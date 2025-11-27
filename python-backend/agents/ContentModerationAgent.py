# backend-python/agents/ContentModerationAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class ContentModerationAgent:
    name = "ContentModerationAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def moderate_content(self, collection: str, key: str):
        """
        Scan a record and mark it if content is inappropriate.
        """
        record = await db.get(collection, key, target="edge")
        if not record:
            logger.warn(f"[ContentModerationAgent] Record not found: {collection}:{key}")
            return None

        # Simple moderation example: check for forbidden words
        forbidden_words = ["spam", "malware", "illegal"]
        flagged = any(word in str(record.get("content", "")).lower() for word in forbidden_words)

        record["flagged"] = flagged
        await db.set(collection, key, record, target="edge")
        eventBus.publish("db:update", {"collection": collection, "key": key, "value": record, "source": self.name})

        logger.log(f"[ContentModerationAgent] Record moderated: {collection}:{key} → flagged={flagged}")
        return record

    async def handle_db_update(self, event: dict):
        logger.log(f"[ContentModerationAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[ContentModerationAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[ContentModerationAgent] Recovering from error: {error}")
