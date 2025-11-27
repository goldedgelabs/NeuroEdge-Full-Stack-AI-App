# backend-python/agents/FeedbackAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class FeedbackAgent(AgentBase):
    name = "FeedbackAgent"

    def __init__(self):
        super().__init__()

    async def submit_feedback(self, feedback: dict):
        """
        Process user or system feedback, store in DB, and trigger replication/events.
        """
        record = {
            "id": feedback.get("id"),
            "collection": "feedback",
            "data": feedback
        }

        # Write to DB
        await db.set(record["collection"], record["id"], record, "edge")

        # Emit DB update event
        event_bus.publish("db:update", {
            "collection": record["collection"],
            "key": record["id"],
            "value": record,
            "source": self.name
        })

        logger.log(f"[{self.name}] Feedback recorded: {record['id']}")
        return record

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] Error occurred: {error}")
