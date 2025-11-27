from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class SecurityEngine:
    name = "SecurityEngine"

    def __init__(self):
        self.policies = {}

    async def add_policy(self, policy_id: str, policy_data: dict):
        """Add or update a security policy."""
        self.policies[policy_id] = policy_data

        # Save to DB and emit update event
        await db.set("security_policies", policy_id, policy_data, storage="edge")
        eventBus.publish("db:update", {
            "collection": "security_policies",
            "key": policy_id,
            "value": policy_data,
            "source": self.name
        })
        log(f"[{self.name}] Policy added/updated: {policy_id}")
        return policy_data

    async def get_policy(self, policy_id: str):
        """Retrieve a security policy."""
        policy = self.policies.get(policy_id)
        log(f"[{self.name}] Retrieved policy: {policy_id} -> {policy}")
        return policy

    async def remove_policy(self, policy_id: str):
        """Remove a security policy from memory and DB."""
        await db.delete("security_policies", policy_id, storage="edge")
        eventBus.publish("db:delete", {
            "collection": "security_policies",
            "key": policy_id,
            "source": self.name
        })
        log(f"[{self.name}] Removed policy: {policy_id}")
        self.policies.pop(policy_id, None)

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
