# backend-python/agents/GlobalMedAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class GlobalMedAgent(AgentBase):
    name = "GlobalMedAgent"

    def __init__(self):
        super().__init__()

    async def update_global_med_data(self, data: dict):
        """
        Updates global medical data records in the database.
        """
        record = {
            "id": data.get("id"),
            "collection": "global_med_data",
            "data": data
        }

        # Store in DB
        await db.set(record["collection"], record["id"], record, "edge")

        # Trigger DB update event
        event_bus.publish("db:update", {
            "collection": record["collection"],
            "key": record["id"],
            "value": record,
            "source": self.name
        })

        logger.log(f"[{self.name}] Global medical data updated: {record['id']}")
        return record

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] Error occurred: {error}")
