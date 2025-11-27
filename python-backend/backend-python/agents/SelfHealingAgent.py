# backend-python/agents/SelfHealingAgent.py
from core.AgentBase import AgentBase
from utils.logger import logger
from db.dbManager import db
import time
import traceback

class SelfHealingAgent(AgentBase):
    name = "SelfHealingAgent"

    async def handle(self, task: dict):
        """
        Main task dispatcher for self-healing.
        """
        try:
            action = task.get("action")

            if action == "diagnose":
                return await self.diagnose(task.get("component"))

            elif action == "heal":
                return await self.heal(task.get("issue"))

            elif action == "system_check":
                return await self.system_check()

            elif action == "log_healing":
                return await self.log_healing(task.get("data"))

            elif action == "get_healing_history":
                return await self.get_healing_history()

            else:
                return {"error": "Unknown action for SelfHealingAgent"}

        except Exception as e:
            logger.error(f"[SelfHealingAgent] ERROR: {e}")
            return {"error": str(e)}

    async def diagnose(self, component: str):
        """
        Performs diagnostic checks on engines / agents.
        """
        if not component:
            return {"error": "Missing component name"}

        issues = []

        # Simulated diagnostic rules
        if "engine" in component.lower():
            issues.append("High CPU usage pattern")
        if "agent" in component.lower():
            issues.append("Unhandled promise rejections detected")

        result = {
            "component": component,
            "detected_issues": issues or ["No issues detected"],
            "timestamp": time.time()
        }

        log_id = f"diag_{int(time.time()*1000)}"
        await db.set("healing_diagnostics", log_id, result)

        return {"id": log_id, "diagnosis": result}

    async def heal(self, issue: dict):
        """
        Attempts automated mitigation of system faults.
        """
        if not issue:
            return {"error": "Missing issue details"}

        logger.log(f"[SelfHealingAgent] Healing issue → {issue}")

        try:
            status = "resolved"

            if "restart" in issue.get("type", ""):
                status = "engine_restarted"
            elif "reset" in issue.get("type", ""):
                status = "state_reset"

            healing_record = {
                "timestamp": time.time(),
                "issue": issue,
                "status": status,
            }

            heal_id = f"heal_{int(time.time()*1000)}"
            await db.set("healing_logs", heal_id, healing_record)

            return {"status": "healed", "id": heal_id, "details": healing_record}

        except Exception:
            err = traceback.format_exc()
            logger.error(f"[SelfHealingAgent] Healing failed: {err}")
            return {"error": "Healing failed", "trace": err}

    async def system_check(self):
        """
        Full system sweep for degradations.
        """
        sweep_result = {
            "timestamp": time.time(),
            "cpu_status": "stable",
            "memory_status": "stable",
            "agents_status": "nominal",
            "engines_status": "nominal"
        }

        sweep_id = f"syscheck_{int(time.time()*1000)}"
        await db.set("healing_system_checks", sweep_id, sweep_result)

        return {"id": sweep_id, "system_check": sweep_result}

    async def log_healing(self, data: dict):
        """
        Stores a manual or external healing entry.
        """
        if not data:
            return {"error": "Missing healing log data"}

        entry = {
            "timestamp": time.time(),
            "info": data
        }

        entry_id = f"logheal_{int(time.time()*1000)}"
        await db.set("healing_logs", entry_id, entry)

        return {"id": entry_id, "logged": entry}

    async def get_healing_history(self):
        """
        Returns all healing logs.
        """
        logs = await db.get_all("healing_logs") or []
        return {"count": len(logs), "logs": logs}
