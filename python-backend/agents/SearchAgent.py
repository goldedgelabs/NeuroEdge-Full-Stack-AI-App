# backend-python/agents/SearchAgent.py
from core.AgentBase import AgentBase
from db.dbManager import db
from utils.logger import logger

class SearchAgent(AgentBase):
    name = "SearchAgent"

    async def handle(self, task: dict):
        """
        Handles search queries across:
        - Local DB
        - Cached engine outputs
        - Offline indexes
        - Metadata registries
        """
        try:
            query = task.get("query")
            collection = task.get("collection", None)

            if not query:
                return {"error": "Missing search query"}

            results = []

            if collection:
                # Direct search inside specific collection
                col = await db.get_all(collection)
                for item_id, item in col.items():
                    if self.matches(item, query):
                        results.append(item)
            else:
                # Global search across all collections
                all_collections = await db.get_collections()
                for col_name in all_collections:
                    col = await db.get_all(col_name)
                    for item_id, item in col.items():
                        if self.matches(item, query):
                            results.append(item)

            return {
                "query": query,
                "count": len(results),
                "results": results
            }

        except Exception as e:
            logger.error(f"[SearchAgent] Error: {e}")
            return {"error": str(e)}

    def matches(self, item, query):
        """Basic fuzzy-match search."""
        try:
            q = query.lower()
            for value in item.values():
                if isinstance(value, str) and q in value.lower():
                    return True
            return False
        except:
            return False
