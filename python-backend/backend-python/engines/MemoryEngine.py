from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus


class MemoryEngine:
    name = "MemoryEngine"

    def __init__(self):
        self.memories = {}

    async def store_memory(self, memory_id: str, data: dict):
        """Store a new memory."""
        self.memories[memory_id] = data

        await db.set("memories", memory_id, data, storage="edge")
        eventBus.publish("db:update", {
            "collection": "memories",
            "key": memory_id,
            "value": data,
            "source": self.name
        })
        log(f"[{self.name}] Stored memory: {memory_id}")
        return data

    async def update_memory(self, memory_id: str, patch: dict):
        """Update an existing memory."""
        existing = await db.get("memories", memory_id, storage="edge") or {}
        updated = {**existing, **patch, "id": memory_id}

        await db.set("memories", memory_id, updated, storage="edge")
        eventBus.publish("db:update", {
            "collection": "memories",
            "key": memory_id,
            "value": updated,
            "source": self.name
        })
        log(f"[{self.name}] Updated memory: {memory_id}")
        return updated

    async def delete_memory(self, memory_id: str):
        """Delete a memory."""
        await db.delete("memories", memory_id)
        eventBus.publish("db:delete", {
            "collection": "memories",
            "key": memory_id,
            "source": self.name
        })
        log(f"[{self.name}] Deleted memory: {memory_id}")
        return {"success": True, "id": memory_id}

    async def get_memory(self, memory_id: str):
        """Retrieve a memory."""
        return await db.get("memories", memory_id, storage="edge")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
