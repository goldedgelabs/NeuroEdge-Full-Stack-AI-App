# backend-python/agents/EvolutionAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class EvolutionAgent(AgentBase):
    name = "EvolutionAgent"

    def __init__(self):
        super().__init__()

    async def process_evolution_data(self, data: dict):
        """
        Process evolutionary computations or adaptative analytics.
        Automatically writes to DB and emits db:update.
        """
        record = {
            "id": data.get("id"),
            "collection": "evolution",
            "data": data
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

        logger.log(f"[{self.name}] Processed evolution record {record['id']}")
        return record

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] Error occurred: {error}")
