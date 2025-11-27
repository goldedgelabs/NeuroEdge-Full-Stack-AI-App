from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class PlannerEngine:
    name = "PlannerEngine"

    def __init__(self):
        self.tasks = {}

    async def create_plan(self, plan_id: str, plan_data: dict):
        """Create or update a planning task."""
        self.tasks[plan_id] = plan_data

        # Save to DB and emit update event
        await db.set("plans", plan_id, plan_data, storage="edge")
        eventBus.publish("db:update", {
            "collection": "plans",
            "key": plan_id,
            "value": plan_data,
            "source": self.name
        })
        log(f"[{self.name}] Plan created/updated: {plan_id}")
        return plan_data

    async def execute_plan(self, plan_id: str):
        """Execute the plan by returning steps or summary."""
        plan = self.tasks.get(plan_id)
        if not plan:
            return {"error": "Plan not found"}

        # Example execution logic
        steps = plan.get("steps", [])
        log(f"[{self.name}] Executing plan {plan_id} with {len(steps)} steps")
        return {"plan_id": plan_id, "steps": steps, "status": "executed"}

    async def delete_plan(self, plan_id: str):
        """Delete plan from system."""
        await db.delete("plans", plan_id, storage="edge")
        eventBus.publish("db:delete", {
            "collection": "plans",
            "key": plan_id,
            "source": self.name
        })
        log(f"[{self.name}] Deleted plan: {plan_id}")
        self.tasks.pop(plan_id, None)

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
