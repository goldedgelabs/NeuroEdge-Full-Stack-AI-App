# backend-python/agents/PlannerAgent.py
from core.AgentBase import AgentBase
from db.dbManager import db
from utils.logger import logger

class PlannerAgent(AgentBase):
    name = "PlannerAgent"

    async def handle(self, task: dict):
        """
        Creates structured plans for tasks, goals, operations, workflows or any multi-step execution.
        """
        try:
            goal = task.get("goal", "")
            context = task.get("context", "")
            priority = task.get("priority", "normal")

            plan = {
                "steps": [
                    "Analyze the goal and break into components",
                    "Identify resources required",
                    "Map dependencies",
                    "Create a structured execution timeline",
                    "Assign responsibilities or execution engines",
                ],
                "goal": goal,
                "priority": priority,
                "context": context
            }

            record = {
                "id": self.generate_id(),
                "collection": "planning",
                "plan": plan
            }

            await db.set("planning", record["id"], record)
            return record

        except Exception as e:
            logger.error(f"[PlannerAgent] Error: {e}")
            return {"error": str(e)}
