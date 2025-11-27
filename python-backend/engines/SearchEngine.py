from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class SearchEngine:
    name = "SearchEngine"

    def __init__(self):
        self.index = {}

    async def add_document(self, doc_id: str, content: dict):
        """Add or update a searchable document."""
        self.index[doc_id] = content

        # Save to DB and emit update event
        await db.set("documents", doc_id, content, storage="edge")
        eventBus.publish("db:update", {
            "collection": "documents",
            "key": doc_id,
            "value": content,
            "source": self.name
        })
        log(f"[{self.name}] Document added/updated: {doc_id}")
        return content

    async def search(self, query: dict):
        """Simple search matching key-value pairs."""
        results = [
            doc for doc in self.index.values()
            if all(doc.get(k) == v for k, v in query.items())
        ]
        log(f"[{self.name}] Search results: {results}")
        return results

    async def remove_document(self, doc_id: str):
        """Remove a document from index and DB."""
        await db.delete("documents", doc_id, storage="edge")
        eventBus.publish("db:delete", {
            "collection": "documents",
            "key": doc_id,
            "source": self.name
        })
        log(f"[{self.name}] Removed document: {doc_id}")
        self.index.pop(doc_id, None)

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
