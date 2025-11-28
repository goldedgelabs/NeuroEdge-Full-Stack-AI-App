import { WebSocketServer } from "ws";

export function setupWebsocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const conversationId = req.url?.split("/").pop();

    console.log("WS connected:", conversationId);

    // send welcome
    ws.send(JSON.stringify({ type: "info", message: "Connected!" }));

    // simulate streaming (replace with Python/Go LLM stream)
    async function streamResponse() {
      const chunks = ["Hello", " how", " can", " I help you?"];
      for (const chunk of chunks) {
        ws.send(JSON.stringify({ type: "chunk", chunk }));
        await new Promise(r => setTimeout(r, 200));
      }
      ws.send(JSON.stringify({ type: "message", text: chunks.join("") }));
    }

    streamResponse();

    ws.on("message", (msg) => {
      console.log("Received from frontend:", msg.toString());
    });
  });
}
