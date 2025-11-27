from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus


class HealthEngine:
    name = "HealthEngine"

    def __init__(self):
        self.records = {}

    async def add_health_record(self, patient_id: str, record: dict):
        """Add a new health record for a patient."""
        self.records[patient_id] = record

        await db.set("health_records", patient_id, record, storage="edge")
        eventBus.publish("db:update", {
            "collection": "health_records",
            "key": patient_id,
            "value": record,
            "source": self.name
        })
        log(f"[{self.name}] Added health record: {patient_id}")
        return record

    async def update_health_record(self, patient_id: str, patch: dict):
        """Update an existing health record."""
        existing = await db.get("health_records", patient_id, storage="edge") or {}
        updated = {**existing, **patch, "id": patient_id}

        await db.set("health_records", patient_id, updated, storage="edge")
        eventBus.publish("db:update", {
            "collection": "health_records",
            "key": patient_id,
            "value": updated,
            "source": self.name
        })
        log(f"[{self.name}] Updated health record: {patient_id}")
        return updated

    async def remove_health_record(self, patient_id: str):
        """Delete a health record."""
        await db.delete("health_records", patient_id)
        eventBus.publish("db:delete", {
            "collection": "health_records",
            "key": patient_id,
            "source": self.name
        })
        log(f"[{self.name}] Removed health record: {patient_id}")
        return {"success": True, "id": patient_id}

    async def get_health_record(self, patient_id: str):
        """Retrieve a single health record."""
        return await db.get("health_records", patient_id, storage="edge")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
