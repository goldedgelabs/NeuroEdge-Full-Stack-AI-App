# backend-python/agents/PlannerHelperAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class PlannerHelperAgent(AgentBase):
    name = "PlannerHelperAgent"

    def __init__(self):
        super().__init__()
        self.plans = {}

    async def create_plan(self, plan_id: str, user_id: str, tasks: list):
        """
        Create a new plan for a user and store in DB.
        """
        self.plans[plan_id] = {"user_id": user_id, "tasks": tasks, "status": "pending"}
        await db.set("plans", plan_id, self.plans[plan_id], "edge")
        event_bus.publish("db:update", {"collection": "plans", "key": plan_id, "value": self.plans[plan_id], "source": self.name})
        logger.log(f"[{self.name}] Plan created: {plan_id} for user {user_id}")
        return {"success": True, "plan_id": plan_id}

    async def update_plan_status(self, plan_id: str, status: str):
        """
        Update the status of an existing plan.
        """
        if plan_id in self.plans:
            self.plans[plan_id]["status"] = status
            await db.set("plans", plan_id, self.plans[plan_id], "edge")
            event_bus.publish("db:update", {"collection": "plans", "key": plan_id, "value": self.plans[plan_id], "source": self.name})
            logger.log(f"[{self.name}] Plan {plan_id} updated to status {status}")
            return {"success": True, "plan_id": plan_id}
        return {"success": False, "message": "Plan not found"}

    async def handleDBUpdate(self, data):
        """
        Respond to DB updates for plans.
        """
        if data.get("collection") == "plans":
            key = data.get("key")
            value = data.get("value")
            self.plans[key] = value
            logger.log(f"[{self.name}] Updated local cache for plan {key}")

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] PlannerHelperAgent error: {error}")
