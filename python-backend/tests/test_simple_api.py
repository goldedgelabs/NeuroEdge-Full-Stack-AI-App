import asyncio
import pytest
import os
from httpx import AsyncClient

BASE_URL = os.getenv("NEUROEDGE_TEST_URL", "http://localhost:8000")

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient() as ac:
        r = await ac.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert "status" in data and data["status"] == "ok"

@pytest.mark.asyncio
async def test_request_and_approve_purge():
    async with AsyncClient() as ac:
        # request a fake purge action (vector id does not need to exist)
        action = {"type":"purge_vector","params":{"vector_id":"testvec1"}}
        r = await ac.post(f"{BASE_URL}/api/proactive/request", json=action)
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        req = data["request"]
        assert req["status"] == "pending"
        # list pending
        r2 = await ac.get(f"{BASE_URL}/api/proactive/pending")
        assert r2.status_code == 200
        pend = r2.json()
        assert any(p["id"] == req["id"] for p in pend["pending"])
        # approve it
        r3 = await ac.post(f"{BASE_URL}/api/proactive/approve", json={"request_id": req["id"], "approve": True})
        assert r3.status_code == 200
        res = r3.json()
        assert res["ok"] is True
