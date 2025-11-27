# backend-python/agents/SelfImprovementAgent.py
from core.AgentBase import AgentBase
from utils.logger import logger
from db.dbManager import db
import time
import statistics

class SelfImprovementAgent(AgentBase):
    name = "SelfImprovementAgent"

    async def handle(self, task: dict):
        """
        Unified dispatcher for all actions of SelfImprovementAgent.
        """
        action = task.get("action")

        if action == "log_performance":
            return await self.log_performance(task.get("metrics"))

        if action == "learn":
            return await self.learn(task.get("feedback"))

        if action == "adapt_strategy":
            return await self.adapt_strategy(task.get("history"))

        if action == "get_performance_trends":
            return await self.get_performance_trends()

        if action == "improvement_plan":
            return await self.improvement_plan()

        return {"error": f"Unknown action '{action}' for SelfImprovementAgent"}

    # ---------------------------------------------------------
    # 1. Log performance metrics
    # ---------------------------------------------------------
    async def log_performance(self, metrics: dict):
        if not metrics:
            return {"error": "Missing performance metrics"}

        entry = {
            "timestamp": time.time(),
            "metrics": metrics
        }

        entry_id = f"perf_{int(time.time()*1000)}"
        await db.set("self_improvement_metrics", entry_id, entry)

        logger.log(f"[SelfImprovementAgent] Logged performance → {entry_id}")
        return {"id": entry_id, "logged": entry}

    # ---------------------------------------------------------
    # 2. Learn from feedback
    # ---------------------------------------------------------
    async def learn(self, feedback: dict):
        if not feedback:
            return {"error": "Missing feedback for learning"}

        learning_result = {
            "timestamp": time.time(),
            "feedback": feedback,
            "improved": True,
            "adjustments": [
                "increased_accuracy_weight",
                "reduced_latency_penalty",
                "optimized_decision_pathways"
            ]
        }

        learn_id = f"learn_{int(time.time()*1000)}"
        await db.set("self_learning_logs", learn_id, learning_result)

        logger.log(f"[SelfImprovementAgent] Applied learning → {learn_id}")
        return {"id": learn_id, "learning_result": learning_result}

    # ---------------------------------------------------------
    # 3. Adapt strategies based on historical data
    # ---------------------------------------------------------
    async def adapt_strategy(self, history: list):
        if not history:
            return {"error": "Missing history data for adaptation"}

        try:
            avg_score = statistics.mean([h.get("score", 0) for h in history])
        except:
            avg_score = 0

        new_strategy = {
            "timestamp": time.time(),
            "previous_average": avg_score,
            "strategy": "aggressive" if avg_score < 0.5 else "conservative",
        }

        strat_id = f"strategy_{int(time.time()*1000)}"
        await db.set("self_improvement_strategies", strat_id, new_strategy)

        return {"id": strat_id, "strategy": new_strategy}

    # ---------------------------------------------------------
    # 4. Retrieve historical performance trends
    # ---------------------------------------------------------
    async def get_performance_trends(self):
        logs = await db.get_all("self_improvement_metrics") or []
        scores = []

        for log in logs:
            m = log.get("metrics", {})
            if "score" in m:
                scores.append(m["score"])

        trend = {
            "total_entries": len(scores),
            "average_score": statistics.mean(scores) if scores else None,
            "max_score": max(scores) if scores else None,
            "min_score": min(scores) if scores else None,
            "trend_direction": (
                "improving" if len(scores) > 1 and scores[-1] > scores[0] else
                "declining" if len(scores) > 1 and scores[-1] < scores[0] else
                "neutral"
            )
        }

        return trend

    # ---------------------------------------------------------
    # 5. Auto-generate an improvement plan
    # ---------------------------------------------------------
    async def improvement_plan(self):
        historical = await self.get_performance_trends()

        plan = {
            "timestamp": time.time(),
            "focus": "accuracy" if (historical.get("average_score") or 0) < 0.6 else "efficiency",
            "steps": [
                "evaluate weak areas",
                "increase training iterations",
                "update reward/penalty weights",
                "monitor drift every 12 hours"
            ],
            "stats_used": historical
        }

        plan_id = f"plan_{int(time.time()*1000)}"
        await db.set("self_improvement_plans", plan_id, plan)

        return {"id": plan_id, "plan": plan}
