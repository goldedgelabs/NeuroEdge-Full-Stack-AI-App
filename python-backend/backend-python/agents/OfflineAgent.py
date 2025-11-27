# backend-python/agents/OfflineAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class OfflineAgent(AgentBase):
    name = "OfflineAgent"

    def __init__(self):
        super().__init__()

    async def run_offline_tasks(self, db_instance=None):
        """
        Handles offline-first operations, ensuring data sync when connectivity resumes.
        """
        self.db_instance = db_instance
        if not self.db_instance:
            logger.warn(f"[{self.name}] No DB instance provided. Offline tasks may fail.")
            return

        # Example: replicate pending local records to shared DB when online
        pending_records = await self.db_instance.get_all_pending()
        for record in pending_records:
            await db.set(record["collection"], record["id"], record, "shared")
            event_bus.publish("db:update", {
                "collection": record["collection"],
                "key": record["id"],
                "value": record,
                "source": self.name
            })
            logger.log(f"[{self.name}] Synced offline record: {record['id']}")

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] OfflineAgent error: {error}")
