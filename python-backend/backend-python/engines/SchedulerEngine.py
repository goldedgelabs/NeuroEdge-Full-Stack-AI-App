from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class SchedulerEngine:
    name = "SchedulerEngine"

    def __init__(self):
        self.tasks = {}

    async def add_task(self, task_id: str, task_data: dict):
        """Add or update a scheduled task."""
        self.tasks[task_id] = task_data

        # Save to DB and emit update event
        await db.set("tasks", task_id, task_data, storage="edge")
        eventBus.publish("db:update", {
            "collection": "tasks",
            "key": task_id,
            "value": task_data,
            "source": self.name
        })
        log(f"[{self.name}] Task added/updated: {task_id}")
        return task_data

    async def get_tasks(self, criteria: dict):
        """Retrieve tasks matching criteria."""
        results = [
            t for t in self.tasks.values()
            if all(t.get(k) == v for k, v in criteria.items())
        ]
        log(f"[{self.name}] Tasks retrieved: {results}")
        return results

    async def remove_task(self, task_id: str):
        """Remove a task."""
        await db.delete("tasks", task_id, storage="edge")
        eventBus.publish("db:delete", {
            "collection": "tasks",
            "key": task_id,
            "source": self.name
        })
        log(f"[{self.name}] Removed task: {task_id}")
        self.tasks.pop(task_id, None)

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
