# backend-python/agents/LearningAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class LearningAgent(AgentBase):
    name = "LearningAgent"

    def __init__(self):
        super().__init__()
        self.knowledge_base = {}

    async def learn(self, topic: str, data: dict):
        """
        Store new knowledge under a topic.
        """
        if topic not in self.knowledge_base:
            self.knowledge_base[topic] = []
        self.knowledge_base[topic].append(data)

        # Persist to DB
        record_id = f"{topic}_{len(self.knowledge_base[topic])}"
        await db.set("learning", record_id, {"topic": topic, "data": data}, "edge")
        event_bus.publish("db:update", {
            "collection": "learning",
            "key": record_id,
            "value": {"topic": topic, "data": data},
            "source": self.name
        })

        logger.log(f"[{self.name}] Learned new data under topic '{topic}': {data}")
        return {"success": True, "topic": topic}

    async def recall(self, topic: str):
        """
        Retrieve all learned data under a topic.
        """
        return self.knowledge_base.get(topic, [])

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] LearningAgent error: {error}")
