from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class SelfImprovementEngine:
    name = "SelfImprovementEngine"

    def __init__(self):
        self.goals = []

    async def add_goal(self, goal_id: str, goal_data: dict):
        """Add a new self-improvement goal."""
        self.goals.append({"id": goal_id, **goal_data})

        # Save to DB and emit update
        await db.set("self_improvement_goals", goal_id, goal_data, storage="edge")
        eventBus.publish("db:update", {
            "collection": "self_improvement_goals",
            "key": goal_id,
            "value": goal_data,
            "source": self.name
        })
        log(f"[{self.name}] Goal added: {goal_id}")
        return goal_data

    async def get_goal(self, goal_id: str):
        """Retrieve a goal by ID."""
        for g in self.goals:
            if g["id"] == goal_id:
                log(f"[{self.name}] Retrieved goal: {goal_id}")
                return g
        log(f"[{self.name}] Goal not found: {goal_id}")
        return None

    async def complete_goal(self, goal_id: str):
        """Mark a goal as completed and remove from DB."""
        self.goals = [g for g in self.goals if g["id"] != goal_id]
        await db.delete("self_improvement_goals", goal_id, storage="edge")
        eventBus.publish("db:delete", {
            "collection": "self_improvement_goals",
            "key": goal_id,
            "source": self.name
        })
        log(f"[{self.name}] Goal completed and removed: {goal_id}")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
