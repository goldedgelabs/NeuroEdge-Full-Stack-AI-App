# backend-python/agents/ConversationAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class ConversationAgent:
    name = "ConversationAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def handle_message(self, user_id: str, message: str):
        """
        Process incoming user message and generate a response.
        """
        # For now, simple echo; later can integrate NLP/LLM
        response = f"Echo from ConversationAgent: {message}"

        # Store conversation in DB
        conversation_record = {
            "user_id": user_id,
            "message": message,
            "response": response
        }
        key = f"{user_id}-{hash(message)}"
        await db.set("conversations", key, conversation_record, target="edge")
        eventBus.publish("db:update", {"collection": "conversations", "key": key, "value": conversation_record, "source": self.name})

        logger.log(f"[ConversationAgent] Conversation saved: {key}")
        return response

    async def handle_db_update(self, event: dict):
        logger.log(f"[ConversationAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[ConversationAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[ConversationAgent] Recovering from error: {error}")
