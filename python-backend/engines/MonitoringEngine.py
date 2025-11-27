from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus


class MonitoringEngine:
    name = "MonitoringEngine"

    def __init__(self):
        self.statuses = {}

    async def add_status(self, system_id: str, status: dict):
        """Add a new monitoring status for a system."""
        self.statuses[system_id] = status

        await db.set("statuses", system_id, status, storage="edge")
        eventBus.publish("db:update", {
            "collection": "statuses",
            "key": system_id,
            "value": status,
            "source": self.name
        })
        log(f"[{self.name}] Added status for: {system_id}")
        return status

    async def update_status(self, system_id: str, patch: dict):
        """Update an existing system status."""
        existing = await db.get("statuses", system_id, storage="edge") or {}
        updated = {**existing, **patch, "id": system_id}

        await db.set("statuses", system_id, updated, storage="edge")
        eventBus.publish("db:update", {
            "collection": "statuses",
            "key": system_id,
            "value": updated,
            "source": self.name
        })
        log(f"[{self.name}] Updated status for: {system_id}")
        return updated

    async def delete_status(self, system_id: str):
        """Delete a system status."""
        await db.delete("statuses", system_id)
        eventBus.publish("db:delete", {
            "collection": "statuses",
            "key": system_id,
            "source": self.name
        })
        log(f"[{self.name}] Deleted status for: {system_id}")
        return {"success": True, "id": system_id}

    async def get_status(self, system_id: str):
        """Retrieve a system status."""
        return await db.get("statuses", system_id, storage="edge")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
