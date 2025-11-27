from utils.logger import log, warn
from db_manager import db_manager

class ReplicationManager:
    def __init__(self):
        # Could track which collections have changed
        self.subscribers = []

    async def replicate_edge_to_shared(self, collection: str = None):
        """Replicate either a specific collection or all edge collections."""
        if collection:
            if collection in db_manager.edge_store:
                if collection not in db_manager.shared_store:
                    db_manager.shared_store[collection] = {}
                db_manager.shared_store[collection].update(db_manager.edge_store[collection])
                log(f"[ReplicationManager] Replicated {collection} to shared store")
        else:
            await db_manager.replicate_to_shared()
            log("[ReplicationManager] Replicated all edge collections to shared store")

replication_manager = ReplicationManager()
