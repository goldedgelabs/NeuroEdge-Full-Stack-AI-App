# backend-python/agents/TelemetryAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class TelemetryAgent:
    name = "TelemetryAgent"

    def __init__(self):
        # Subscribe to DB events for telemetry
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def record_metric(self, metric_name: str, value: float) -> dict:
        """
        Record a telemetry metric to the database.
        """
        logger.log(f"[TelemetryAgent] Recording metric {metric_name} = {value}")

        metric_data = {"metric_name": metric_name, "value": value}
        await db.set("telemetry", metric_name, metric_data, "edge")
        eventBus.publish("db:update", {
            "collection": "telemetry",
            "key": metric_name,
            "value": metric_data,
            "source": self.name
        })
        logger.log(f"[TelemetryAgent] Metric {metric_name} saved in DB")

        return metric_data

    async def handle_db_update(self, event: dict):
        logger.log(f"[TelemetryAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[TelemetryAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[TelemetryAgent] Recovering from error: {error}")
