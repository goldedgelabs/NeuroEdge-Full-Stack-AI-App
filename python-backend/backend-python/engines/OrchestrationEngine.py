from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class OrchestrationEngine:
    name = "OrchestrationEngine"

    def __init__(self):
        self.workflows = {}

    async def create_workflow(self, workflow_id: str, workflow_def: dict):
        """Create a new orchestration workflow."""
        self.workflows[workflow_id] = workflow_def

        await db.set("workflows", workflow_id, workflow_def, storage="edge")
        eventBus.publish("db:update", {
            "collection": "workflows",
            "key": workflow_id,
            "value": workflow_def,
            "source": self.name
        })
        log(f"[{self.name}] Created workflow: {workflow_id}")
        return workflow_def

    async def update_workflow(self, workflow_id: str, patch: dict):
        """Update existing workflow."""
        existing = await db.get("workflows", workflow_id, storage="edge") or {}
        updated = {**existing, **patch, "id": workflow_id}

        await db.set("workflows", workflow_id, updated, storage="edge")
        eventBus.publish("db:update", {
            "collection": "workflows",
            "key": workflow_id,
            "value": updated,
            "source": self.name
        })
        log(f"[{self.name}] Updated workflow: {workflow_id}")
        return updated

    async def delete_workflow(self, workflow_id: str):
        """Delete a workflow."""
        await db.delete("workflows", workflow_id)
        eventBus.publish("db:delete", {
            "collection": "workflows",
            "key": workflow_id,
            "source": self.name
        })
        log(f"[{self.name}] Deleted workflow: {workflow_id}")
        return {"success": True, "id": workflow_id}

    async def get_workflow(self, workflow_id: str):
        """Retrieve a workflow."""
        return await db.get("workflows", workflow_id, storage="edge")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
