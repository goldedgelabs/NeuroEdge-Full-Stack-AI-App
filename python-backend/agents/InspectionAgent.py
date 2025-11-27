# backend-python/agents/InspectionAgent.py

from core.agent_base import AgentBase
from core.db_manager import db
from core.event_bus import event_bus
from utils.logger import logger
import os
import importlib
import sys

class InspectionAgent(AgentBase):
    name = "InspectionAgent"

    def __init__(self):
        super().__init__()

    async def inspect_folder(self, folder_path: str):
        """
        Inspect a folder recursively for engines and agents, and return a list of Python modules.
        """
        discovered = {"engines": [], "agents": []}
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file.endswith(".py") and file not in ["__init__.py", "agent_base.py", "engine_base.py"]:
                    module_path = os.path.join(root, file)
                    module_name = module_path.replace("/", ".").replace("\\", ".")[:-3]
                    try:
                        imported_module = importlib.import_module(module_name)
                        if hasattr(imported_module, "AgentBase"):
                            discovered["agents"].append(module_name)
                        elif hasattr(imported_module, "EngineBase"):
                            discovered["engines"].append(module_name)
                    except Exception as e:
                        logger.warn(f"[{self.name}] Failed to import {module_name}: {e}")
        return discovered

    async def register_new(self, module_name: str):
        """
        Dynamically register a new agent or engine in the system.
        """
        try:
            module = importlib.import_module(module_name)
            for attr in dir(module):
                cls = getattr(module, attr)
                if isinstance(cls, type):
                    if hasattr(cls, "run"):  # Engine heuristic
                        from core.engine_manager import registerEngine
                        registerEngine(cls.name, cls())
                        logger.log(f"[{self.name}] Registered engine: {cls.name}")
                    elif hasattr(cls, "process"):  # Agent heuristic
                        from core.agent_manager import registerAgent
                        registerAgent(cls.name, cls())
                        logger.log(f"[{self.name}] Registered agent: {cls.name}")
            return {"success": True}
        except Exception as e:
            await self.recover(e)
            return {"success": False, "error": str(e)}

    async def recover(self, error: Exception):
        logger.error(f"[{self.name}] InspectionAgent error: {error}")
