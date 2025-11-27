# backend-python/agents/PhoneSecurityAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class PhoneSecurityAgent(AgentBase):
    name = "PhoneSecurityAgent"

    def __init__(self):
        super().__init__()
        self.device_status = {}

    async def register_device(self, device_id: str, user_id: str):
        """
        Register a new device for a user and store in DB.
        """
        self.device_status[device_id] = {"user_id": user_id, "status": "active"}
        await db.set("devices", device_id, self.device_status[device_id], "edge")
        event_bus.publish("db:update", {"collection": "devices", "key": device_id, "value": self.device_status[device_id], "source": self.name})
        logger.log(f"[{self.name}] Device registered: {device_id} for user {user_id}")
        return {"success": True, "device_id": device_id}

    async def revoke_device(self, device_id: str):
        """
        Revoke a registered device.
        """
        if device_id in self.device_status:
            self.device_status[device_id]["status"] = "revoked"
            await db.set("devices", device_id, self.device_status[device_id], "edge")
            event_bus.publish("db:update", {"collection": "devices", "key": device_id, "value": self.device_status[device_id], "source": self.name})
            logger.log(f"[{self.name}] Device revoked: {device_id}")
            return {"success": True, "device_id": device_id}
        return {"success": False, "message": "Device not found"}

    async def handleDBUpdate(self, data):
        """
        Respond to DB updates for devices.
        """
        if data.get("collection") == "devices":
            key = data.get("key")
            value = data.get("value")
            self.device_status[key] = value
            logger.log(f"[{self.name}] Updated local cache for device {key}")

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] PhoneSecurityAgent error: {error}")
