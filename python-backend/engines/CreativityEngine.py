from db.db_manager import db_manager
from utils.logger import log

class CreativityEngine:
    name = "CreativityEngine"

    async def run(self, input_data=None):
        log(f"[{self.name}] Generating creative output for input: {input_data}")
        # Example creative process
        result = {
            "collection": "creativity",
            "id": input_data.get("id") if input_data else "default",
            "creative_output": f"Creative result based on {input_data}"
        }
        await db_manager.set(result["collection"], result["id"], result)
        return result

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
