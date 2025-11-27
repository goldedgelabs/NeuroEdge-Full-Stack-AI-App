from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger
import time

class DeploymentAgent:
    name = "DeploymentAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def deploy_service(self, service_name: str, version: str, config: dict):
        """
        Deploy a service or application version.
        """
        if not service_name or not version:
            logger.warn(f"[DeploymentAgent] Missing service_name or version")
            return None

        deployment_record = {
            "timestamp": time.time(),
            "service": service_name,
            "version": version,
            "config": config,
            "status": "initiated"
        }

        record_id = f"deploy_{int(time.time()*1000)}"
        await db.set("deployments", record_id, deployment_record, target="edge")
        eventBus.publish("db:update", {"collection": "deployments", "key": record_id, "value": deployment_record, "source": self.name})

        logger.log(f"[DeploymentAgent] Deployment initiated: {record_id} → {service_name} v{version}")
        return {"id": record_id, "deployment": deployment_record}

    async def handle_db_update(self, event: dict):
        logger.log(f"[DeploymentAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[DeploymentAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[DeploymentAgent] Recovering from error: {error}")
