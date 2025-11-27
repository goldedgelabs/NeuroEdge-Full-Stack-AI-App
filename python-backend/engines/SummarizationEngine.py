from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class SummarizationEngine:
    name = "SummarizationEngine"

    def __init__(self):
        self.summaries = {}

    async def summarize_text(self, doc_id: str, text: str):
        """Summarize the given text (mock logic)."""
        summary = text[:100] + "..."  # Simple mock summarization
        self.summaries[doc_id] = summary

        # Save to DB and emit update
        await db.set("summaries", doc_id, {"text": text, "summary": summary}, storage="edge")
        eventBus.publish("db:update", {
            "collection": "summaries",
            "key": doc_id,
            "value": {"text": text, "summary": summary},
            "source": self.name
        })
        log(f"[{self.name}] Text summarized: {doc_id}")
        return {"doc_id": doc_id, "summary": summary}

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
