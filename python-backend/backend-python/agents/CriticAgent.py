# backend-python/agents/CriticAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class CriticAgent:
    name = "CriticAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def review_content(self, content_id: str, content: str, user_id: str):
        """
        Critique or review content.
        Returns a simple review analysis.
        """
        # Basic example review
        review_text = f"Critique of content '{content_id}': Looks good!"
        
        review_record = {
            "user_id": user_id,
            "content_id": content_id,
            "review": review_text
        }

        # Save review in DB
        key = f"{user_id}-{content_id}"
        await db.set("content_reviews", key, review_record, target="edge")
        eventBus.publish("db:update", {"collection": "content_reviews", "key": key, "value": review_record, "source": self.name})

        logger.log(f"[CriticAgent] Review saved: {key}")
        return review_text

    async def handle_db_update(self, event: dict):
        logger.log(f"[CriticAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[CriticAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[CriticAgent] Recovering from error: {error}")
