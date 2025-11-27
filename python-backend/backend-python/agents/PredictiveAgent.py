# backend-python/agents/PredictionAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger
import time
import random

class PredictionAgent:
    name = "PredictionAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def predict(self, collection: str, input_data: dict) -> dict:
        """
        Generate a simple prediction for the given input data.
        """
        prediction_result = {
            "timestamp": time.time(),
            "input": input_data,
            "prediction": random.choice(["high", "medium", "low"]),  # Placeholder example
            "confidence": round(random.uniform(0.5, 0.99), 2)
        }

        # Save prediction to DB
        record_id = f"prediction_{int(time.time()*1000)}"
        await db.set(collection, record_id, prediction_result, target="edge")
        eventBus.publish("db:update", {"collection": collection, "key": record_id, "value": prediction_result, "source": self.name})

        logger.log(f"[PredictionAgent] Prediction saved: {collection}:{record_id}")
        return prediction_result

    async def handle_db_update(self, event: dict):
        logger.log(f"[PredictionAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[PredictionAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[PredictionAgent] Recovering from error: {error}")
