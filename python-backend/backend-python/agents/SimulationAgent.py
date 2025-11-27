# backend-python/agents/SimulationAgent.py

from ..core.dbManager import db
from ..core.eventBus import eventBus
from ..utils.logger import logger

class SimulationAgent:
    name = "SimulationAgent"

    def __init__(self):
        # Subscribe to DB events
        eventBus.subscribe("db:update", self.handle_db_update)
        eventBus.subscribe("db:delete", self.handle_db_delete)

    async def run_simulation(self, scenario: str, parameters: dict) -> dict:
        """
        Run a simulation for a given scenario with input parameters.
        """
        logger.log(f"[SimulationAgent] Running simulation for scenario: {scenario}")

        # Simple example: simulate results based on parameters
        result = {param: val*2 if isinstance(val, (int, float)) else val for param, val in parameters.items()}

        # Save simulation results to DB
        if result:
            await db.set("simulation_results", f"sim_{scenario}", result, "edge")
            eventBus.publish("db:update", {
                "collection": "simulation_results",
                "key": f"sim_{scenario}",
                "value": result,
                "source": self.name
            })
            logger.log(f"[SimulationAgent] Simulation results saved to DB.")

        return result

    async def handle_db_update(self, event: dict):
        logger.log(f"[SimulationAgent] DB update received: {event.get('collection')}:{event.get('key')}")

    async def handle_db_delete(self, event: dict):
        logger.log(f"[SimulationAgent] DB delete received: {event.get('collection')}:{event.get('key')}")

    async def recover(self, error: Exception):
        logger.error(f"[SimulationAgent] Recovering from error: {error}")
