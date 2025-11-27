# backend-python/agents/PluginManagerAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger

class PluginManagerAgent(AgentBase):
    name = "PluginManagerAgent"

    def __init__(self):
        super().__init__()
        self.plugins = {}

    async def register_plugin(self, plugin_name: str, metadata: dict):
        """
        Registers a plugin and saves it in the DB.
        """
        self.plugins[plugin_name] = metadata
        await db.set("plugins", plugin_name, metadata, "edge")
        event_bus.publish("db:update", {"collection": "plugins", "key": plugin_name, "value": metadata, "source": self.name})
        logger.log(f"[{self.name}] Registered plugin: {plugin_name}")
        return {"success": True, "plugin": plugin_name}

    async def unregister_plugin(self, plugin_name: str):
        """
        Unregisters a plugin.
        """
        if plugin_name in self.plugins:
            self.plugins.pop(plugin_name)
            await db.delete("plugins", plugin_name, "edge")
            event_bus.publish("db:delete", {"collection": "plugins", "key": plugin_name, "source": self.name})
            logger.log(f"[{self.name}] Unregistered plugin: {plugin_name}")
            return {"success": True, "plugin": plugin_name}
        return {"success": False, "message": "Plugin not found"}

    async def handleDBUpdate(self, data):
        """
        Sync local cache if plugin info updates.
        """
        if data.get("collection") == "plugins":
            key = data.get("key")
            value = data.get("value")
            self.plugins[key] = value
            logger.log(f"[{self.name}] Plugin cache updated: {key}")

    async def handleDBDelete(self, data):
        """
        Remove deleted plugin from local cache.
        """
        if data.get("collection") == "plugins":
            key = data.get("key")
            if key in self.plugins:
                self.plugins.pop(key)
                logger.log(f"[{self.name}] Plugin removed from cache: {key}")

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] PluginManagerAgent error: {error}")
