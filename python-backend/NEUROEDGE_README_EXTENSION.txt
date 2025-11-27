NeuroEdge - Additional Integrations (README snippet)
===================================================

Agent registration:
- For agents that require constructor args or special factories, use `neuroedge_agent_registry.py`:
  Example:
    from neuroedge_agent_registry import register_agent
    @register_agent('my_agent')
    def create_my_agent(config):
        return MyAgent(config['param1'], config['param2'])

  The orchestrator will still autodiscover simple no-arg agent classes in `agents/`.
  For registry-created agents, ensure you call `create_agent('my_agent', cfg)` somewhere in startup or use the registry in your agent modules.

FAISS (optional):
- To enable FAISS vector index (faster, scalable search), install `faiss-cpu` and start the service with:
    export NEUROEDGE_USE_FAISS=1
  The system will attempt to build a FAISS index from in-memory vectors and persist it to `neuroedge_faiss.index`.

Safety - Auto-purge protection:
- Automatic purge of low-retention vectors is **disabled by default** to prevent data loss.
  To enable automatic purges (use with caution), set environment variable:
    export NEUROEDGE_AUTO_PURGE=1

Docker & compose (see Dockerfile & docker-compose.yml included):
- Build image:
    docker build -t neuroedge-core:latest .
- Run compose for local dev:
    docker-compose up --build -d

Defaults & tuning:
- Vector dimension default: 256 (env NEUROEDGE_VEC_DIM)
- Cross-backend URLs: NEUROEDGE_TS_URL, NEUROEDGE_GO_URL
- FAISS index path: neuroedge_faiss.index (next to the module)
- Checkpoint file: neuroedge_checkpoint.pkl


Approval Workflow & CI Tests:
- Destructive actions like purge require approval by default.
- API endpoints added: /api/proactive/request, /api/proactive/pending, /api/proactive/approve
- WebSocket for approvals: /ws/proactive-approvals
- Basic pytest tests included under /tests to validate health and approval flow.
