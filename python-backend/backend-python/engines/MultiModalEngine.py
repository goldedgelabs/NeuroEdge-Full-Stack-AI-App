from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus


class MultiModalEngine:
    name = "MultiModalEngine"

    def __init__(self):
        self.models = {}

    async def add_model(self, model_id: str, details: dict):
        """Register a new multimodal model (e.g., text+image)."""
        record = {
            "id": model_id,
            "details": details
        }

        await db.set("multimodal_models", model_id, record, storage="edge")

        eventBus.publish("db:update", {
            "collection": "multimodal_models",
            "key": model_id,
            "value": record,
            "source": self.name
        })

        log(f"[{self.name}] Added model: {model_id}")
        return record

    async def update_model(self, model_id: str, patch: dict):
        """Update an existing model record."""
        existing = await db.get("multimodal_models", model_id, storage="edge") or {}
        updated = {**existing, **patch, "id": model_id}

        await db.set("multimodal_models", model_id, updated, storage="edge")

        eventBus.publish("db:update", {
            "collection": "multimodal_models",
            "key": model_id,
            "value": updated,
            "source": self.name
        })

        log(f"[{self.name}] Updated model: {model_id}")
        return updated

    async def remove_model(self, model_id: str):
        """Delete a multimodal model."""
        await db.delete("multimodal_models", model_id)

        eventBus.publish("db:delete", {
            "collection": "multimodal_models",
            "key": model_id,
            "source": self.name
        })

        log(f"[{self.name}] Removed model: {model_id}")
        return {"success": True, "id": model_id}

    async def list_models(self):
        """List all multimodal models."""
        return await db.all("multimodal_models", storage="edge")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
