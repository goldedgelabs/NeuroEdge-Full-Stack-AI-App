# backend-python/agents/ValidationAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class ValidationAgent:
    name = "ValidationAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def validate_record(self, collection: str, key: str) -> dict:
        """
        Validate a DB record for correctness or completeness.
        """
        record = await db.get(collection, key)
        if not record:
            logger.warn(f"[ValidationAgent] Record not found: {collection}:{key}")
            return {"valid": False, "reason": "Record not found"}

        # Example validation logic
        is_valid = True
        missing_fields = [f for f in ["id", "collection"] if f not in record]
        if missing_fields:
            is_valid = False

        validation_result = {"collection": collection, "key": key, "valid": is_valid, "missing_fields": missing_fields}

        await db.set("validation", f"{collection}_{key}", validation_result, "edge")
        eventBus.publish("db:update", {
            "collection": "validation",
            "key": f"{collection}_{key}",
            "value": validation_result,
            "source": self.name
        })

        logger.log(f"[ValidationAgent] Validation result saved for {collection}:{key}")
        return validation_result

    async def handle_db_update(self, event: dict):
        logger.log(f"[ValidationAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[ValidationAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[ValidationAgent] Recovering from error: {error}")
