from db.db_manager import db_manager
from utils.logger import log

class CodeEngine:
    name = "CodeEngine"

    async def run(self, input_data=None):
        log(f"[{self.name}] Running with input: {input_data}")
        # Simulate code execution or compilation
        result = {
            "collection": "code",
            "id": input_data.get("id") if input_data else "default",
            "result": f"Executed {input_data}"
        }
        await db_manager.set(result["collection"], result["id"], result)
        return result

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
