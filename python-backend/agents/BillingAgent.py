# backend-python/agents/BillingAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class BillingAgent:
    name = "BillingAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def process_payment(self, user_id: str, amount: float):
        """
        Process a payment for a given user.
        """
        payment_record = {
            "user_id": user_id,
            "amount": amount,
            "status": "processed"
        }

        # Store in DB
        await db.set("payments", f"{user_id}_{amount}", payment_record, target="edge")
        eventBus.publish("db:update", {"collection": "payments", "key": f"{user_id}_{amount}", "value": payment_record, "source": self.name})

        logger.log(f"[BillingAgent] Payment processed for user {user_id}: {amount}")
        return payment_record

    async def handle_db_update(self, event: dict):
        logger.log(f"[BillingAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[BillingAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[BillingAgent] Recovering from error: {error}")
