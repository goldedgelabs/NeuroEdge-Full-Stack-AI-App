# backend-python/agents/AntiTheftAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class AntiTheftAgent:
    name = "AntiTheftAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def monitor_device(self, device_id: str, status: str):
        # Simulate theft monitoring
        alert = None
        if status == "stolen":
            alert = {"device_id": device_id, "alert": "Device reported stolen"}
            await db.set("alerts", device_id, alert, target="edge")
            eventBus.publish("db:update", {"collection": "alerts", "key": device_id, "value": alert, "source": self.name})
            logger.log(f"[AntiTheftAgent] Stolen device alert: {device_id}")
        return {"device_id": device_id, "status": status, "alert": alert}

    async def handle_db_update(self, event: dict):
        # Handle DB update events
        logger.log(f"[AntiTheftAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        # Handle DB delete events
        logger.log(f"[AntiTheftAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[AntiTheftAgent] Recovering from error: {error}")
