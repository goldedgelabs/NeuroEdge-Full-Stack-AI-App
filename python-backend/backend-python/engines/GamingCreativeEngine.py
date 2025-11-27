from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus


class GamingCreativeEngine:
    name = "GamingCreativeEngine"

    def __init__(self):
        self.games = {}

    async def create_game(self, game_id: str, data: dict):
        """Create a new game entry."""
        record = {
            "id": game_id,
            "data": data
        }

        await db.set("games", game_id, record, storage="edge")

        eventBus.publish("db:update", {
            "collection": "games",
            "key": game_id,
            "value": record,
            "source": self.name
        })

        log(f"[{self.name}] Created game: {game_id}")
        return record

    async def update_game(self, game_id: str, patch: dict):
        """Update an existing game."""
        existing = await db.get("games", game_id, storage="edge") or {}
        updated = {**existing, **patch, "id": game_id}

        await db.set("games", game_id, updated, storage="edge")

        eventBus.publish("db:update", {
            "collection": "games",
            "key": game_id,
            "value": updated,
            "source": self.name
        })

        log(f"[{self.name}] Updated game: {game_id}")
        return updated

    async def delete_game(self, game_id: str):
        """Delete a game record."""
        await db.delete("games", game_id)

        eventBus.publish("db:delete", {
            "collection": "games",
            "key": game_id,
            "source": self.name
        })

        log(f"[{self.name}] Deleted game: {game_id}")
        return {"success": True, "id": game_id}

    async def list_games(self):
        """List all games."""
        return await db.all("games", storage="edge")

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
