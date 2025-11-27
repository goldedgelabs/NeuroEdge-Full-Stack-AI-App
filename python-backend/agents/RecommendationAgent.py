# backend-python/agents/RecommendationAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger
import time

class RecommendationAgent:
    name = "RecommendationAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def recommend(self, collection: str, user_data: dict) -> dict:
        """
        Generate recommendations based on user data and save results.
        """
        if not user_data:
            logger.warn(f"[RecommendationAgent] No user data provided")
            return {"error": "No user data provided"}

        # Example recommendation logic: placeholder
        recommendations = [f"item_{i}" for i in range(1, 6)]
        result = {
            "user": user_data.get("id", "unknown"),
            "recommendations": recommendations,
            "generated_at": time.time()
        }

        record_id = f"recommendation_{int(time.time()*1000)}"
        await db.set(collection, record_id, result, target="edge")
        eventBus.publish("db:update", {
            "collection": collection,
            "key": record_id,
            "value": result,
            "source": self.name
        })

        logger.log(f"[RecommendationAgent] Recommendations saved: {collection}:{record_id}")
        return {"record_id": record_id, "recommendations": recommendations}

    async def handle_db_update(self, event: dict):
        logger.log(f"[RecommendationAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[RecommendationAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[RecommendationAgent] Recovering from error: {error}")
