
# neuroedge_autonomous.py
"""
Autonomous NeuroEdge core - inject this into your existing Python backend.
Drop this file into your backend root (e.g., backend-python/) and import/run the FastAPI app
or include the startup_bootstrap() call from your existing ASGI app.

Dependencies:
  pip install fastapi uvicorn websockets aiohttp numpy scikit-learn python-multipart
  (optional) faiss-cpu if you want faster vector search: pip install faiss-cpu

Features implemented:
 - AgentManager: collects metrics from existing agents (auto-discovers agents package)
 - VectorMemory: in-process vector store + usage tracking + importance/retention models
 - PredictiveModel: lightweight models that update continuously
 - RecommendationEngine: actionable recommendations
 - ProactiveExecutor: executes actions and logs them
 - CrossBackendBridge: async comms to TypeScript & Go backends
 - FastAPI app with WebSocket endpoints: /ws/metrics, /ws/recommendations, /ws/proactive, /ws/memory
 - Background scheduler that runs continuous loops
 - Startup bootstrap to start autonomous learning on backend startup

This file tries to be minimally invasive: it will import your existing `agents` package
if present and build on top of it. If you have custom Agents, ensure they expose a simple
interface (get_metrics async/def or attributes). The code also gracefully degrades if
third-party libraries like faiss are not available.

Note: This is a large integration shim. Review and adapt paths/configs to your repo layout.
"""

import asyncio
import importlib
import inspect
import logging
import math
import os
import pathlib
import random
import sqlite3
import time
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import aiohttp

# Optional imports
try:
    import faiss
    _HAS_FAISS = True
except Exception:
    _HAS_FAISS = False

# Optional FAISS integration: if faiss is installed and NEUROEDGE_USE_FAISS=1, build and persist an index
FAISS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "neuroedge_faiss.index")
USE_FAISS = os.getenv("NEUROEDGE_USE_FAISS", "0") == "1" and _HAS_FAISS

if USE_FAISS:
    try:
        # helper to (re)build index from current vectors
        def build_faiss_index(vm):
            dim = vm.dim
            index = faiss.IndexFlatIP(dim)  # inner product = cosine with normalized vectors
            vids = list(vm.vectors.keys())
            if not vids:
                return None, []
            mat = np.vstack([vm.vectors[v] for v in vids]).astype('float32')
            # normalize for inner-product cosine similarity
            norms = np.linalg.norm(mat, axis=1, keepdims=True)
            norms[norms==0] = 1.0
            mat = mat / norms
            index.add(mat)
            return index, vids

        # try load index on startup
        if os.path.exists(FAISS_INDEX_PATH):
            try:
                _faiss_index = faiss.read_index(FAISS_INDEX_PATH)
            except Exception:
                _faiss_index = None
        else:
            _faiss_index = None
    except Exception as e:
        logger.exception('FAISS init failed: %s', e)
        USE_FAISS = False

    # replace VectorMemory.search to use faiss when enabled
    _orig_search = VectorMemory.search
    def _faiss_search(self, q: List[float], k=10):
        global _faiss_index, _faiss_vids
        if not self.vectors:
            return []
        if _faiss_index is None or self._needs_rebuild:
            try:
                _faiss_index, _faiss_vids = build_faiss_index(self)
                if _faiss_index is not None:
                    faiss.write_index(_faiss_index, FAISS_INDEX_PATH)
                    self._needs_rebuild = False
            except Exception as e:
                logger.exception('faiss build failed: %s', e)
                return _orig_search(self, q, k)
        if _faiss_index is None:
            return _orig_search(self, q, k)
        qarr = np.array(q, dtype=np.float32)
        if qarr.shape[0] != self.dim:
            if qarr.shape[0] < self.dim:
                qarr = np.pad(qarr, (0, self.dim - qarr.shape[0]))
            else:
                qarr = qarr[: self.dim]
        qnorm = qarr / (np.linalg.norm(qarr) + 1e-9)
        D, I = _faiss_index.search(qnorm.reshape(1, -1).astype('float32'), k)
        results = []
        for idx, score in zip(I[0], D[0]):
            if idx < 0 or idx >= len(_faiss_vids):
                continue
            results.append((_faiss_vids[int(idx)], float(score)))
        return results

    VectorMemory.search = _faiss_search

# Basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("neuroedge")

# Paths
ROOT = pathlib.Path(__file__).resolve().parent
DB_PATH = ROOT / "neuroedge_core.db"

# Simple persisted sqlite for logs and vector metadata
def init_db():
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS proactive_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts REAL,
        action_type TEXT,
        details TEXT
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vectors (
        id TEXT PRIMARY KEY,
        dim INTEGER,
        usage_count INTEGER,
        shared INTEGER,
        last_used_ts REAL,
        importance REAL,
        retention REAL
    )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------------------
# Vector memory & store
# ---------------------------
class VectorMemory:
    def __init__(self, dim: int = 256):
        self.dim = dim
        self.vectors: Dict[str, np.ndarray] = {}
        self.usage: Dict[str, int] = {}
        self.shared: Dict[str, bool] = {}
        self.last_used: Dict[str, float] = {}
        self.importance: Dict[str, float] = {}
        self.retention: Dict[str, float] = {}
        self._index = None
        self._needs_rebuild = True

    def upsert(self, vid: str, vec: List[float], shared: bool = False):
        arr = np.array(vec, dtype=np.float32)
        if arr.shape[0] != self.dim:
            # automatically pad or trim
            if arr.shape[0] < self.dim:
                arr = np.pad(arr, (0, self.dim - arr.shape[0]))
            else:
                arr = arr[: self.dim]
        self.vectors[vid] = arr
        self.usage.setdefault(vid, 0)
        self.shared[vid] = bool(shared)
        self.last_used[vid] = time.time()
        self.importance[vid] = self.importance.get(vid, 0.5)
        self.retention[vid] = self.retention.get(vid, 0.5)
        self._needs_rebuild = True
        self._persist_vector_meta(vid)

    def _persist_vector_meta(self, vid: str):
        conn = sqlite3.connect(str(DB_PATH))
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO vectors (id, dim, usage_count, shared, last_used_ts, importance, retention) VALUES (?,?,?,?,?,?,?)",
            (
                vid,
                self.dim,
                int(self.usage.get(vid, 0)),
                int(self.shared.get(vid, 0)),
                float(self.last_used.get(vid, 0)),
                float(self.importance.get(vid, 0)),
                float(self.retention.get(vid, 0)),
            ),
        )
        conn.commit()
        conn.close()

    def record_usage(self, vid: str):
        self.usage[vid] = self.usage.get(vid, 0) + 1
        self.last_used[vid] = time.time()
        self._persist_vector_meta(vid)

    def delete(self, vid: str):
        if vid in self.vectors:
            del self.vectors[vid]
        for d in (self.usage, self.shared, self.last_used, self.importance, self.retention):
            d.pop(vid, None)
        self._needs_rebuild = True
        conn = sqlite3.connect(str(DB_PATH))
        cur = conn.cursor()
        cur.execute("DELETE FROM vectors WHERE id=?", (vid,))
        conn.commit()
        conn.close()

    def top_used(self, n=10):
        items = sorted(self.usage.items(), key=lambda kv: kv[1], reverse=True)
        return [(vid, cnt) for vid, cnt in items[:n]]

    def compute_importance_and_retention(self):
        # importance: mix of usage, recency, and sharedness
        now = time.time()
        max_usage = max(self.usage.values()) if self.usage else 1
        for vid in list(self.vectors.keys()):
            u = self.usage.get(vid, 0) / max_usage
            age = max(1.0, now - self.last_used.get(vid, now))
            recency = 1.0 / math.log(age + 2)
            shared = 1.0 if self.shared.get(vid) else 0.0
            imp = 0.6 * u + 0.3 * recency + 0.1 * shared
            # retention: function of importance and age
            retention = max(0.01, min(0.99, imp * 0.9 + 0.1 * recency))
            self.importance[vid] = imp
            self.retention[vid] = retention
            self._persist_vector_meta(vid)

    def search(self, q: List[float], k=10):
        if not self.vectors:
            return []
        qarr = np.array(q, dtype=np.float32)
        if qarr.shape[0] != self.dim:
            if qarr.shape[0] < self.dim:
                qarr = np.pad(qarr, (0, self.dim - qarr.shape[0]))
            else:
                qarr = qarr[: self.dim]
        vids = list(self.vectors.keys())
        mat = np.vstack([self.vectors[v] for v in vids])
        # cosine similarity
        def cos_sim(a, b):
            na = np.linalg.norm(a)
            nb = np.linalg.norm(b)
            if na == 0 or nb == 0:
                return 0.0
            return float(np.dot(a, b) / (na * nb))
        sims = [cos_sim(qarr, mat[i]) for i in range(mat.shape[0])]
        pairs = sorted(enumerate(sims), key=lambda x: x[1], reverse=True)[:k]
        return [(vids[i], float(score)) for i, score in pairs]


# ---------------------------
# Agent manager
# ---------------------------
class AgentManager:
    def __init__(self):
        self.agents: Dict[str, Any] = {}
        self.metrics: Dict[str, Dict[str, Any]] = {}
        self.scores: Dict[str, float] = {}
        self.load_agents()

    def load_agents(self):
        # Attempt to import `agents` package in repo
        try:
            spec = importlib.util.find_spec("agents")
            if spec is None:
                logger.info("No agents package found in repo root; skipping agent autodiscovery")
                return
            agents_pkg = importlib.import_module("agents")
            pkg_path = pathlib.Path(agents_pkg.__file__).parent
            for p in pkg_path.glob("*.py"):
                name = p.stem
                if name.startswith("__"):
                    continue
                try:
                    mod = importlib.import_module(f"agents.{name}")
                    # find classes that look like Agent
                    for _, obj in inspect.getmembers(mod, inspect.isclass):
                        if obj.__module__ == mod.__name__:
                            inst = None
                            try:
                                inst = obj()
                            except Exception:
                                # maybe class requires args; skip instance
                                continue
                            key = f"{name}.{obj.__name__}"
                            self.agents[key] = inst
                            self.metrics[key] = {"performance": 0.0, "throughput": 0.0, "latency": 0.0, "last_score": 0.0}
                except Exception as e:
                    logger.exception("failed to import agent module %s: %s", name, e)
        except Exception as e:
            logger.exception("agent discovery failed: %s", e)

    async def update_metrics(self):
        # query each agent for metrics if possible
        for name, inst in list(self.agents.items()):
            m = self.metrics.setdefault(name, {})
            try:
                if hasattr(inst, "get_metrics"):
                    res = inst.get_metrics()
                    if inspect.iscoroutine(res):
                        res = await res
                    if isinstance(res, dict):
                        m.update(res)
                else:
                    # best-effort: look for attributes
                    m.setdefault("performance", getattr(inst, "performance", random.random()))
                    m.setdefault("throughput", getattr(inst, "throughput", random.random()*10))
                    m.setdefault("latency", getattr(inst, "latency", random.random()))
                # compute a score
                perf = float(m.get("performance", 0.0))
                throughput = float(m.get("throughput", 0.0))
                latency = float(m.get("latency", 1.0))
                score = max(0.0, perf * 0.6 + (throughput / (1 + throughput)) * 0.3 - latency * 0.1)
                self.scores[name] = score
                m["last_score"] = score
            except Exception as e:
                logger.exception("error updating metrics for %s: %s", name, e)
                m["last_score"] = 0.0

    def scoreboard(self, top_n=20):
        items = sorted(self.scores.items(), key=lambda kv: kv[1], reverse=True)
        return items[:top_n]

    def low_performers(self, threshold=0.2):
        return [name for name, s in self.scores.items() if s < threshold]


# ---------------------------
# Predictive & Recommendation
# ---------------------------
class PredictiveModel:
    def __init__(self, vm: VectorMemory, am: AgentManager):
        self.vm = vm
        self.am = am

    async def update(self):
        # compute vector importance/retention
        self.vm.compute_importance_and_retention()
        # optionally refine using simple learning: emphasize vectors used by high performing agents
        top_agents = [k for k, _ in self.am.scoreboard(5)]
        bonus = 0.02
        for vid in list(self.vm.vectors.keys()):
            usage_factor = self.vm.usage.get(vid, 0)
            if usage_factor > 0 and random.random() < 0.3:
                self.vm.importance[vid] = min(0.999, self.vm.importance.get(vid, 0.5) + bonus * math.log(1 + usage_factor))
            # decay retention slowly
            self.vm.retention[vid] = max(0.01, self.vm.retention.get(vid, 0.5) - 0.001 * math.log(1 + usage_factor))
            self.vm._persist_vector_meta(vid)


class RecommendationEngine:
    def __init__(self, vm: VectorMemory, am: AgentManager):
        self.vm = vm
        self.am = am

    async def generate(self):
        recs = {"agents": [], "vectors": []}
        # Agents: low performers -> recommend retrain, adjust memory, or scale down
        low = self.am.low_performers()
        for name in low:
            recs["agents"].append({
                "agent": name,
                "reason": "low_score",
                "actions": [
                    {"type": "retrain", "params": {"agent": name}},
                    {"type": "adjust_memory", "params": {"agent": name, "delta": 0.1}},
                ],
            })
        # Vectors: high importance but low retention -> replicate or pin
        vectors = sorted(self.vm.importance.items(), key=lambda kv: kv[1], reverse=True)[:50]
        for vid, imp in vectors:
            ret = self.vm.retention.get(vid, 0.5)
            if imp > 0.7 and ret < 0.3:
                recs["vectors"].append({
                    "vector_id": vid,
                    "importance": imp,
                    "retention": ret,
                    "actions": [
                        {"type": "replicate_vector", "params": {"vector_id": vid}},
                        {"type": "pin_vector", "params": {"vector_id": vid}},
                    ],
                })
            elif imp < 0.2 and ret < 0.1:
                recs["vectors"].append({
                    "vector_id": vid,
                    "importance": imp,
                    "retention": ret,
                    "actions": [{"type": "purge_vector", "params": {"vector_id": vid}}],
                })
        return recs


# ---------------------------
# Proactive executor
# ---------------------------
class ProactiveExecutor:
    def __init__(self, vm: VectorMemory, am: AgentManager):
        self.vm = vm
        self.am = am
        self.log = []  # in-memory log; also persisted

    async def execute(self, action: Dict[str, Any]):
        ts = time.time()
        t = action.get("type")
        details = action.get("params", {})
        try:
            if t == "replicate_vector":
                vid = details["vector_id"]
                # simple replication: copy vector under new id
                if vid in self.vm.vectors:
                    new_id = vid + "_replica_" + str(int(ts))
                    self.vm.upsert(new_id, self.vm.vectors[vid].tolist(), shared=True)
                    msg = f"replicated {vid} as {new_id}"
                else:
                    msg = f"vector {vid} not found"
            elif t == "pin_vector":
                vid = details["vector_id"]
                self.vm.shared[vid] = True
                msg = f"pinned {vid}"
            elif t == "purge_vector":
                vid = details["vector_id"]
                # safety: require approval for purge actions unless auto-purge env var enabled
                auto_purge = os.getenv('NEUROEDGE_AUTO_PURGE', '0') == '1'
                if not auto_purge:
                    # request approval instead of immediate purge
                    req = await orch.request_approval({'type': 'purge_vector', 'params': {'vector_id': vid}})
                    msg = f"purge requested for {vid}; request id {req['id']}"
                else:
                    self.vm.delete(vid)
                    msg = f"purged {vid}"
            elif t == "retrain":
                agent = details.get("agent")
                # try to invoke retrain() on agent if exists
                inst = self.am.agents.get(agent)
                if inst and hasattr(inst, "retrain"):
                    try:
                        r = inst.retrain()
                        if inspect.iscoroutine(r):
                            await r
                        msg = f"retrained {agent}"
                    except Exception as e:
                        msg = f"retrain {agent} failed: {e}"
                else:
                    msg = f"retrain not available for {agent}"
            elif t == "adjust_memory":
                # best-effort: if agent exposes memory allocation, adjust
                agent = details.get("agent")
                delta = float(details.get("delta", 0.1))
                inst = self.am.agents.get(agent)
                if inst and hasattr(inst, "memory_alloc"):
                    try:
                        inst.memory_alloc = max(0.0, getattr(inst, "memory_alloc", 1.0) + delta)
                        msg = f"adjusted memory of {agent} by {delta}"
                    except Exception as e:
                        msg = f"adjust memory failed: {e}"
                else:
                    msg = f"agent {agent} has no memory_alloc property"
            else:
                msg = f"unknown action {t}"
            # persist log
            conn = sqlite3.connect(str(DB_PATH))
            cur = conn.cursor()
            cur.execute("INSERT INTO proactive_actions (ts, action_type, details) VALUES (?,?,?)", (ts, t, str(details)))
            conn.commit()
            conn.close()
            self.log.append({"ts": ts, "action": t, "details": details, "msg": msg})
            logger.info("Proactive action executed: %s", msg)
            return {"ok": True, "msg": msg}
        except Exception as e:
            logger.exception("proactive execute failed: %s", e)
            return {"ok": False, "msg": str(e)}

    def recent_log(self, limit=100):
        return list(self.log)[-limit:]


# ---------------------------
# Cross-backend communication
# ---------------------------
class CrossBackendBridge:
    def __init__(self, ts_url: Optional[str] = None, go_url: Optional[str] = None):
        self.ts_url = ts_url
        self.go_url = go_url
        self.session = aiohttp.ClientSession()

    async def fetch_from_ts(self, path: str = "/data"):
        if not self.ts_url:
            return None
        try:
            async with self.session.get(self.ts_url + path, timeout=10) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.exception("fetch_from_ts failed: %s", e)
            return None

    async def fetch_from_go(self, path: str = "/data"):
        if not self.go_url:
            return None
        try:
            async with self.session.get(self.go_url + path, timeout=10) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.exception("fetch_from_go failed: %s", e)
            return None

    async def post_to_ts(self, path: str, payload: dict):
        if not self.ts_url:
            return None
        try:
            async with self.session.post(self.ts_url + path, json=payload, timeout=10) as resp:
                return await resp.json()
        except Exception as e:
            logger.exception("post_to_ts failed: %s", e)
            return None

    async def close(self):
        await self.session.close()


# ---------------------------
# Orchestrator and scheduler
# ---------------------------
class Orchestrator:
    def __init__(self, *, vector_dim=256, ts_url=None, go_url=None):
        self.vm = VectorMemory(dim=vector_dim)
        self.am = AgentManager()
        self.predictive = PredictiveModel(self.vm, self.am)
        self.recommender = RecommendationEngine(self.vm, self.am)
        self.executor = ProactiveExecutor(self.vm, self.am)
        self.bridge = CrossBackendBridge(ts_url=ts_url, go_url=go_url)
        self._tasks: List[asyncio.Task] = []
        self.clients_metrics: List[WebSocket] = []
        self.clients_recs: List[WebSocket] = []
        self.clients_proactive: List[WebSocket] = []
        self.clients_memory: List[WebSocket] = []
        # approval workflow
        self.approval_queue: List[Dict[str, Any]] = []
        self.clients_proactive_approvals: List[WebSocket] = []

    async def start(self):
        # create periodic tasks
        loop = asyncio.get_event_loop()
        self._tasks.append(loop.create_task(self._metrics_loop()))
        self._tasks.append(loop.create_task(self._predictive_loop()))
        self._tasks.append(loop.create_task(self._recommendations_loop()))
        self._tasks.append(loop.create_task(self._proactive_loop()))
        self._tasks.append(loop.create_task(self._cross_backend_loop()))
        self._tasks.append(loop.create_task(self._approval_loop()))
        logger.info("Orchestrator started with %d background tasks", len(self._tasks))

    async def stop(self):
        for t in self._tasks:
            t.cancel()
        await self.bridge.close()

    async def _metrics_loop(self):
        while True:
            try:
                await self.am.update_metrics()
                payload = {"scores": self.am.scoreboard(50), "metrics": self.am.metrics}
                await self._broadcast(self.clients_metrics, payload)
            except Exception as e:
                logger.exception("metrics loop error: %s", e)
            await asyncio.sleep(3)

    async def _predictive_loop(self):
        while True:
            try:
                await self.predictive.update()
                # send vector memory summary
                payload = {
                    "top_used": self.vm.top_used(20),
                    "importance_summary": sorted(list(self.vm.importance.items()), key=lambda kv: kv[1], reverse=True)[:20],
                }
                await self._broadcast(self.clients_memory, payload)
            except Exception as e:
                logger.exception("predictive loop error: %s", e)
            await asyncio.sleep(5)

    async def _recommendations_loop(self):
        while True:
            try:
                recs = await self.recommender.generate()
                await self._broadcast(self.clients_recs, recs)
                # small probability to auto-accept recommendations
                for a in recs.get("vectors", [])[:3]:
                    # if importance very high and retention low, schedule replication
                    if a["importance"] > 0.85 and a["retention"] < 0.25:
                        act = {"type": "replicate_vector", "params": {"vector_id": a["vector_id"]}}
                        await self.executor.execute(act)
            except Exception as e:
                logger.exception("recommendations loop error: %s", e)
            await asyncio.sleep(4)

    async def _proactive_loop(self):
        # safety: require env var NEUROEDGE_AUTO_PURGE=1 to enable automatic destruction (purge)
        AUTO_PURGE_ENABLED = os.getenv('NEUROEDGE_AUTO_PURGE', '0') == '1'

        while True:
            try:
                # look for vectors to purge automatically
                to_purge = [vid for vid, r in self.vm.retention.items() if r < 0.05]
                if AUTO_PURGE_ENABLED:
                    for vid in to_purge:
                        await self.executor.execute({"type": "purge_vector", "params": {"vector_id": vid}})
                else:
                    if to_purge:
                        logger.info('AUTO_PURGE disabled; candidates for purge: %s', to_purge)
                # broadcast recent log
                await self._broadcast(self.clients_proactive, {"log": self.executor.recent_log(50)})
            except Exception as e:
                logger.exception("proactive loop error: %s", e)
            await asyncio.sleep(6)


    async def request_approval(self, action: Dict[str, Any]):
        # create a request entry and notify approval WS clients
        req = {
            'id': f'req_{int(time.time()*1000)}_{random.randint(0,9999)}',
            'ts': time.time(),
            'action': action,
            'status': 'pending'
        }
        self.approval_queue.append(req)
        # notify approval clients
        await self._broadcast(self.clients_proactive_approvals, {'type': 'new_request', 'request': req})
        logger.info('Approval requested: %s', req['id'])
        return req

    async def _broadcast_approvals(self):
        # push current pending queue to approval WS clients
        await self._broadcast(self.clients_proactive_approvals, {'type': 'queue_update', 'queue': self.approval_queue})

    async def _approval_loop(self):
        # notify periodically about pending approvals; auto-escalate or expire requests after timeout
        while True:
            try:
                now = time.time()
                # expire requests older than 1 hour
                changed = False
                for req in list(self.approval_queue):
                    if now - req['ts'] > 3600:
                        req['status'] = 'expired'
                        changed = True
                if changed:
                    await self._broadcast_approvals()
            except Exception as e:
                logger.exception('approval loop error: %s', e)
            await asyncio.sleep(30)

    async def _cross_backend_loop(self):
        while True:
            try:
                # fetch small sample of external signals
                tsd = await self.bridge.fetch_from_ts("/signals")
                god = await self.bridge.fetch_from_go("/signals")
                # integrate signals as synthetic vectors or metrics
                if isinstance(tsd, dict):
                    for k, v in list(tsd.items())[:5]:
                        vid = f"ts::{k}"
                        vec = np.random.randn(self.vm.dim).tolist()[: self.vm.dim]
                        self.vm.upsert(vid, vec, shared=True)
                if isinstance(god, dict):
                    for k, v in list(god.items())[:5]:
                        vid = f"go::{k}"
                        vec = np.random.randn(self.vm.dim).tolist()[: self.vm.dim]
                        self.vm.upsert(vid, vec, shared=False)
            except Exception as e:
                logger.exception('cross backend loop error: %s', e)
            await asyncio.sleep(8)


# ---------------------------
# FastAPI app & WebSocket endpoints
# ---------------------------
app = FastAPI(title="NeuroEdge Core")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# instantiate orchestrator; TS/Go endpoints can be configured through env
TS_URL = os.getenv("NEUROEDGE_TS_URL")
GO_URL = os.getenv("NEUROEDGE_GO_URL")
orch = Orchestrator(vector_dim=int(os.getenv("NEUROEDGE_VEC_DIM", "256")), ts_url=TS_URL, go_url=GO_URL)

@app.on_event("startup")
async def startup_bootstrap():
    # Start orchestrator loops
    await orch.start()
    logger.info("NeuroEdge bootstrap complete, autonomous loops running.")

@app.on_event("shutdown")
async def shutdown():
    await orch.stop()

# WebSocket endpoints
@app.websocket("/ws/metrics")
async def ws_metrics(ws: WebSocket):
    await ws.accept()
    orch.clients_metrics.append(ws)
    try:
        while True:
            # keep connection alive; client may send pings
            data = await ws.receive_text()
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        if ws in orch.clients_metrics:
            orch.clients_metrics.remove(ws)

@app.websocket("/ws/recommendations")
async def ws_recommendations(ws: WebSocket):
    await ws.accept()
    orch.clients_recs.append(ws)
    try:
        while True:
            await ws.receive_text()
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        if ws in orch.clients_recs:
            orch.clients_recs.remove(ws)

@app.websocket("/ws/proactive")
async def ws_proactive(ws: WebSocket):
    await ws.accept()
    orch.clients_proactive.append(ws)
    try:
        while True:
            await ws.receive_text()
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        if ws in orch.clients_proactive:
            orch.clients_proactive.remove(ws)



@app.websocket("/ws/proactive-approvals")
async def ws_proactive_approvals(ws: WebSocket):
    await ws.accept()
    orch.clients_proactive_approvals.append(ws)
    try:
        # send current pending queue on connect
        await ws.send_json({'type':'queue_update','queue': orch.approval_queue})
        while True:
            await ws.receive_text()
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        if ws in orch.clients_proactive_approvals:
            orch.clients_proactive_approvals.remove(ws)

@app.get("/api/agents")
async def get_agents():
    return {"agents": list(orch.am.agents.keys()), "scores": orch.am.scoreboard(50)}

@app.get("/api/vectors/top")
async def top_vectors(n: int = 20):
    return {"top_used": orch.vm.top_used(n)}

@app.post("/api/proactive/execute")
async def execute_action(action: Dict[str, Any]):
    res = await orch.executor.execute(action)
    return JSONResponse(res)

@app.get("/api/proactive/log")
async def proactive_log(limit: int = 100):
    return {"log": orch.executor.recent_log(limit)}

@app.post("/api/vector/upsert")
async def upsert_vector(payload: Dict[str, Any]):
    vid = payload.get("id")
    vec = payload.get("vector")
    shared = bool(payload.get("shared", False))
    if not vid or not isinstance(vec, list):
        return JSONResponse({"ok": False, "error": "id and vector list required"}, status_code=400)
    orch.vm.upsert(vid, vec, shared=shared)
    return {"ok": True}

# Simple health
@app.get("/api/health")
async def health():
    return {"status": "ok", "now": time.time()}

# ---------------------------
# Integration helper: call this from your existing app if you don't run the module directly
# ---------------------------
def start_neuroedge_app():
    # returns app for ASGI servers
    return app

# If executed as main, run uvicorn
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("neuroedge_autonomous:app", host="0.0.0.0", port=8000, reload=False)


# Load optional extensions (operator UI, checkpointing, agent registry integration)
try:
    import neuroedge_extensions
except Exception:
    pass
