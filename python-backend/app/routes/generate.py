# backend-py/app/routes/generate.py
from fastapi import APIRouter
from pydantic import BaseModel
import asyncio
import websockets
import json

router = APIRouter()

class ChatInput(BaseModel):
    conversationId: str
    message: str

@router.post("/api/generate")
async def generate_chat(req: ChatInput):
    conv = req.conversationId

    # Stream tokens to TS websocket server
    uri = f"ws://localhost:4000/ws/chat/{conv}"
    async with websockets.connect(uri) as ws:
        for token in ["Thinking...", " Okay!", " Here's the answer."]:
            await ws.send(json.dumps({ "type": "chunk", "chunk": token }))
            await asyncio.sleep(0.3)

        final = "Thinking... Okay! Here's the answer."
        await ws.send(json.dumps({ "type": "message", "text": final }))

    return {"ok": True}
