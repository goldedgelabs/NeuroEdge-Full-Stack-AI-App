# backend-python/agents/LocalStorageAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class LocalStorageAgent(AgentBase):
    name = "LocalStorageAgent"

    def __init__(self):
        super().__init__()
        self.local_store = {}

    async def save(self, key: str, value: dict):
        """
        Save data locally and persist to DB.
        """
        self.local_store[key] = value

        # Persist to DB
        await db.set("local_storage", key, value, "edge")
        event_bus.publish("db:update", {
            "collection": "local_storage",
            "key": key,
            "value": value,
            "source": self.name
        })

        logger.log(f"[{self.name}] Saved key '{key}' to local storage.")
        return {"success": True, "key": key}

    async def load(self, key: str):
        """
        Retrieve data from local storage.
        """
        return self.local_store.get(key)

    async def delete(self, key: str):
        """
        Delete data from local storage and DB.
        """
        if key in self.local_store:
            del self.local_store[key]
            await db.delete("local_storage", key)
            event_bus.publish("db:delete", {
                "collection": "local_storage",
                "key": key,
                "source": self.name
            })
            logger.log(f"[{self.name}] Deleted key '{key}' from local storage.")
            return {"success": True, "key": key}
        return {"success": False, "message": "Key not found"}

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] LocalStorageAgent error: {error}")
