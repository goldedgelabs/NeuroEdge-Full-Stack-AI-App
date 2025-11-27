from utils.logger import log
from db.dbManager import db
from core.eventBus import eventBus

class TranslationEngine:
    name = "TranslationEngine"

    def __init__(self):
        self.translations = {}

    async def translate_text(self, text: str, target_lang: str):
        """Translate text to target language."""
        # For demo, just store the "translated" text
        translated_text = f"{text} [{target_lang}]"
        record_id = f"{hash(text)}_{target_lang}"
        self.translations[record_id] = translated_text

        # Save to DB and emit update
        await db.set("translations", record_id, {"text": text, "translated": translated_text, "lang": target_lang}, storage="edge")
        eventBus.publish("db:update", {
            "collection": "translations",
            "key": record_id,
            "value": {"text": text, "translated": translated_text, "lang": target_lang},
            "source": self.name
        })
        log(f"[{self.name}] Translated text stored: {record_id}")
        return {"record_id": record_id, "translated": translated_text}

    async def recover(self, err):
        log(f"[{self.name}] Recovered from error: {err}")
