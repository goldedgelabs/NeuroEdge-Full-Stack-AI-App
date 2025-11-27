from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class IdentityAgent:
    name = "IdentityAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def verify_identity(self, user_info: dict):
        """
        Verify a user's identity based on provided information.
        """
        if not user_info:
            logger.warn(f"[IdentityAgent] No user info provided")
            return {"verified": False, "reason": "Missing data"}

        # Example verification logic
        verified = user_info.get("id") is not None and user_info.get("auth_token") is not None

        result = {"user_id": user_info.get("id"), "verified": verified}

        # Save verification result to DB
        await db.set("identity_verifications", f"id_{user_info.get('id', 'unknown')}", result, target="edge")
        eventBus.publish("db:update", {"collection": "identity_verifications", "key": f"id_{user_info.get('id', 'unknown')}", "value": result, "source": self.name})

        logger.log(f"[IdentityAgent] Identity verification result: {result}")
        return result

    async def handle_db_update(self, event: dict):
        logger.log(f"[IdentityAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[IdentityAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[IdentityAgent] Recovering from error: {error}")
