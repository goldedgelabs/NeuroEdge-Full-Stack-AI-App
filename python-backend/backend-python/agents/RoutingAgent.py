# backend-python/agents/RoutingAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger
import time

class RoutingAgent:
    name = "RoutingAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def route_request(self, collection: str, request_data: dict) -> dict:
        """
        Routes a request to the appropriate engine/agent based on request data.
        """
        if not request_data:
            logger.warn(f"[RoutingAgent] No request data provided")
            return {"error": "No request data provided"}

        # Example routing logic: pick target based on type
        target = "default_engine"
        if request_data.get("type") == "analytics":
            target = "AnalyticsEngine"
        elif request_data.get("type") == "security":
            target = "SecurityAgent"

        result = {
            "request_id": request_data.get("id", f"req_{int(time.time()*1000)}"),
            "target": target,
            "timestamp": time.time()
        }

        record_id = f"routing_{int(time.time()*1000)}"
        await db.set(collection, record_id, result, target="edge")
        eventBus.publish("db:update", {
            "collection": collection,
            "key": record_id,
            "value": result,
            "source": self.name
        })

        logger.log(f"[RoutingAgent] Routed request saved: {collection}:{record_id} → {target}")
        return result

    async def handle_db_update(self, event: dict):
        logger.log(f"[RoutingAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[RoutingAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[RoutingAgent] Recovering from error: {error}")
