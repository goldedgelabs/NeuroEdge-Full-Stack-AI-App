# backend-python/agents/SchedulingAgent.py
from core.AgentBase import AgentBase
from db.dbManager import db
from utils.logger import logger
import time

class SchedulingAgent(AgentBase):
    name = "SchedulingAgent"

    async def handle(self, task: dict):
        """
        Handles scheduling of reminders, tasks, workflows, background jobs,
        and system-level timed operations.
        """
        try:
            item = task.get("item", "undefined")
            schedule_time = task.get("time")
            repeat = task.get("repeat", None)

            if not schedule_time:
                return {"error": "Missing field 'time' for scheduling"}

            schedule_record = {
                "id": self.generate_id(),
                "collection": "schedules",
                "item": item,
                "schedule_time": schedule_time,
                "repeat_interval": repeat,
                "created_at": time.time(),
                "status": "scheduled"
            }

            await db.set("schedules", schedule_record["id"], schedule_record)
            return schedule_record

        except Exception as e:
            logger.error(f"[SchedulingAgent] Error: {e}")
            return {"error": str(e)}
