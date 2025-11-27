from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class TelemetryEngine:
    name = "TelemetryEngine"

    def __init__(self):
        self.telemetry_data = {}

    async def record_metric(self, metric_id: str, data: dict):
        """Record telemetry metric."""
        self.telemetry_data[metric_id] = data

        # Save to DB and emit update
        await db.set("telemetry", metric_id, data, storage="edge")
        eventBus.publish("db:update", {
            "collection": "telemetry",
            "key": metric_id,
            "value": data,
            "source": self.name
        })
        log(f"[{self.name}] Metric recorded: {metric_id}")
        return {"metric_id": metric_id, "status": "recorded"}

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
