from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus


class GoldEdgeIntegrationEngine:
    name = "GoldEdgeIntegrationEngine"

    def __init__(self):
        self.integrations = {}

    async def add_integration(self, integration_id: str, data: dict):
        """Add a new GoldEdge integration."""
        record = {
            "id": integration_id,
            "data": data
        }

        await db.set("gold_edge_integrations", integration_id, record, storage="edge")
        eventBus.publish("db:update", {
            "collection": "gold_edge_integrations",
            "key": integration_id,
            "value": record,
            "source": self.name
        })
        log(f"[{self.name}] Added integration: {integration_id}")
        return record

    async def update_integration(self, integration_id: str, patch: dict):
        """Update an existing integration."""
        existing = await db.get("gold_edge_integrations", integration_id, storage="edge") or {}
        updated = {**existing, **patch, "id": integration_id}

        await db.set("gold_edge_integrations", integration_id, updated, storage="edge")
        eventBus.publish("db:update", {
            "collection": "gold_edge_integrations",
            "key": integration_id,
            "value": updated,
            "source": self.name
        })
        log(f"[{self.name}] Updated integration: {integration_id}")
        return updated

    async def remove_integration(self, integration_id: str):
        """Remove an integration."""
        await db.delete("gold_edge_integrations", integration_id)
        eventBus.publish("db:delete", {
            "collection": "gold_edge_integrations",
            "key": integration_id,
            "source": self.name
        })
        log(f"[{self.name}] Removed integration: {integration_id}")
        return {"success": True, "id": integration_id}

    async def list_integrations(self):
        """List all integrations."""
        return await db.all("gold_edge_integrations", storage="edge")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
