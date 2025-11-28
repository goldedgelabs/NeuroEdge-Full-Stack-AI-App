# backend-py/app/routes/generate.py
from fastapi import APIRouter, Request, Header, HTTPException
from pydantic import BaseModel
import os
import asyncio
import json
import logging
import websockets

try:
    import openai
except Exception:
    openai = None

logger = logging.getLogger("generate")
router = APIRouter()

class GenRequest(BaseModel):
    conversationId: str
    message: str
    engine: str = "python"

async def send_to_ts_ws(conversation_id: str, payload: dict):
    ts_host = os.environ.get('TS_WS_HOST') or 'ws://localhost:4000'
    ws_url = f"{ts_host}/ws/chat/{conversation_id}"
    try:
        async with websockets.connect(ws_url) as ws:
            await ws.send(json.dumps(payload))
    except Exception as e:
        logger.exception("failed to send to ts ws: %s", e)


@router.post("/api/generate")
async def generate(
    req: GenRequest,
    x_internal_key: str = Header(None)
):
    # 🔐 Validate internal key
    if x_internal_key != os.environ.get("INTERNAL_API_KEY"):
        raise HTTPException(status_code=401, detail="invalid internal key")

    conv = req.conversationId
    text = req.message

    # (Everything below stays exactly as your original code)
    openai_key = os.environ.get('OPENAI_API_KEY')
    if openai_key and openai is not None:
        openai.api_key = openai_key
        try:
            def _stream():
                for chunk in openai.ChatCompletion.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": text}],
                    stream=True
                ):
                    if "choices" in chunk:
                        for c in chunk["choices"]:
                            delta = c.get("delta", {})
                            token = delta.get("content")
                            if token:
                                yield token

            for token in _stream():
                await send_to_ts_ws(conv, {"type": "chunk", "chunk": token})
            await send_to_ts_ws(conv, {"type": "message", "text": "[done]"})
            return {"ok": True}
        except Exception as e:
            logger.exception("openai stream failed: %s", e)

    # fallback
    try:
        words = text.split()
        chunks = [" ".join(words[i:i+6]) for i in range(0, len(words), 6)] or ["(no content)"]

        for ch in chunks:
            await send_to_ts_ws(conv, {"type": "chunk", "chunk": ch})
            await asyncio.sleep(0.2)

        final = " ".join(chunks)
        await send_to_ts_ws(conv, {"type": "message", "text": final})
        return {"ok": True}
    except Exception as e:
        logger.exception("fallback generator failed: %s", e)
        return {"ok": False, "error": str(e)}
