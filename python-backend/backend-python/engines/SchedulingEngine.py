from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class SchedulingEngine:
    name = "SchedulingEngine"

    def __init__(self):
        self.schedule = {}

    async def add_schedule(self, schedule_id: str, schedule_data: dict):
        """Add or update a schedule."""
        self.schedule[schedule_id] = schedule_data

        # Save to DB and emit update event
        await db.set("schedules", schedule_id, schedule_data, storage="edge")
        eventBus.publish("db:update", {
            "collection": "schedules",
            "key": schedule_id,
            "value": schedule_data,
            "source": self.name
        })
        log(f"[{self.name}] Schedule added/updated: {schedule_id}")
        return schedule_data

    async def get_schedule(self, criteria: dict):
        """Retrieve schedules matching criteria."""
        results = [
            s for s in self.schedule.values()
            if all(s.get(k) == v for k, v in criteria.items())
        ]
        log(f"[{self.name}] Schedules retrieved: {results}")
        return results

    async def remove_schedule(self, schedule_id: str):
        """Remove a schedule."""
        await db.delete("schedules", schedule_id, storage="edge")
        eventBus.publish("db:delete", {
            "collection": "schedules",
            "key": schedule_id,
            "source": self.name
        })
        log(f"[{self.name}] Removed schedule: {schedule_id}")
        self.schedule.pop(schedule_id, None)

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
