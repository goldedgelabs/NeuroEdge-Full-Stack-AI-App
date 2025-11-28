# backend-py/app/routes/generate.py
from fastapi import APIRouter, Request
from pydantic import BaseModel
import os
import asyncio
import json
import logging

# websocket client lib
import websockets

# optional OpenAI library; only required if you set OPENAI_API_KEY
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

# helper to send to TS WS server (broadcast)
async def send_to_ts_ws(conversation_id: str, payload: dict):
    ts_host = os.environ.get('TS_WS_HOST') or 'ws://localhost:4000'
    # expect TS WS path to accept /ws/chat/:conversationId
    ws_url = f"{ts_host}/ws/chat/{conversation_id}"
    try:
        async with websockets.connect(ws_url) as ws:
            await ws.send(json.dumps(payload))
    except Exception as e:
        logger.exception("failed to send to ts ws: %s", e)

@router.post("/api/generate")
async def generate(req: GenRequest):
    conv = req.conversationId
    text = req.message

    # If OPENAI_API_KEY available and openai lib present -> stream from OpenAI
    openai_key = os.environ.get('OPENAI_API_KEY')
    if openai_key and openai is not None:
        openai.api_key = openai_key
        # Use Chat Completions streaming (example). Adjust model as needed.
        try:
            # Create an asynchronous generator using openai with requests streaming if available
            # We'll use the synchronous streaming via threading for simplicity here:
            # NOTE: Use the official OpenAI async client if available in your env.
            def _stream():
                # fallback synchronous stream using openai.Completion or ChatCompletion
                # This code may need to be adapted to your installed OpenAI library version.
                for chunk in openai.ChatCompletion.create(model="gpt-4o-mini", messages=[{"role":"user","content": text}], stream=True):
                    # chunk is a dict with choices; extract token content
                    if 'choices' in chunk:
                        for c in chunk['choices']:
                            delta = c.get('delta', {})
                            token = delta.get('content')
                            if token:
                                yield token
            # stream synchronously inside thread loop, forward to TS websocket
            loop = asyncio.get_event_loop()
            for token in _stream():
                payload = {"type": "chunk", "chunk": token}
                await send_to_ts_ws(conv, payload)
            # after streaming complete, send final message
            final_payload = {"type": "message", "text": "[done]"}
            await send_to_ts_ws(conv, final_payload)
            return {"ok": True}
        except Exception as e:
            logger.exception("openai stream failed: %s", e)
            # fallback to deterministic below
    # Fallback deterministic generator (good for offline dev)
    try:
        # Break text into synthetic chunks
        chunks = []
        # simple chunking: split into words and emit groups of 6
        words = text.split()
        for i in range(0, len(words), 6):
            chunks.append(" ".join(words[i:i+6]))
        if not chunks:
            chunks = ["(no content)"]
        for ch in chunks:
            await send_to_ts_ws(conv, {"type": "chunk", "chunk": ch})
            await asyncio.sleep(0.2)
        final = " ".join(chunks)
        await send_to_ts_ws(conv, {"type": "message", "text": final})
        return {"ok": True}
    except Exception as e:
        logger.exception("fallback generator failed: %s", e)
        return {"ok": False, "error": str(e)}
