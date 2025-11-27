# ComplianceAgent.py
# Agent responsible for ensuring that operations adhere to policies, standards, and regulations

class ComplianceAgent:
    def __init__(self):
        self.name = "ComplianceAgent"
        self.rules = []  # List of compliance rules or policies

    def add_rule(self, rule: dict):
        self.rules.append(rule)
        print(f"[ComplianceAgent] Rule added: {rule.get('name', 'Unnamed')}")

    def check_compliance(self, action: dict):
        violations = []
        for rule in self.rules:
            condition = rule.get("condition")
            if condition and not condition(action):
                violations.append(rule.get("name", "Unnamed"))
        return {"compliant": len(violations) == 0, "violations": violations}

    async def handle_request(self, request: dict):
        action = request.get("action_data")
        if action:
            return self.check_compliance(action)
        return {"error": "No action data provided"}

    async def recover(self, error):
        print(f"[ComplianceAgent] Recovered from error: {error}")
