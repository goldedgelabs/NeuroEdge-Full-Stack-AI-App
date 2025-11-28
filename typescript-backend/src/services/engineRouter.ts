// backend-ts/src/services/engineRouter.ts
import axios from "axios";
import { broadcastToConversationFallback } from "../ws/chatServer";

export type RouteOpts = {
  conversationId: string;
  message: string;
  preferredEngine?: string;
};

/* ------------------------------------------------------
 * ENGINE SELECTION
 * ----------------------------------------------------*/
function chooseEngine(opts: RouteOpts) {
  if (opts.preferredEngine) return opts.preferredEngine;

  const m = opts.message.toLowerCase();

  // Simple keyword heuristic
  if (m.includes("image") || m.includes("vision") || m.includes("photo"))
    return "go";
  if (m.includes("audio") || m.includes("transcribe"))
    return "python";

  return "python"; // default engine
}

/* ------------------------------------------------------
 * FALLBACK STREAM SIMULATION (LOCAL TEST ONLY)
 * Only used if engines are offline.
 * ----------------------------------------------------*/
async function simulateLocalStreaming(convId: string, text: string) {
  const fakeResponse = `Simulated reply: ${text}`;

  const chunks = fakeResponse.match(/.{1,12}/g) || [];

  for (const c of chunks) {
    broadcastToConversationFallback(convId, {
      type: "chunk",
      chunk: c,
    });
    await new Promise((res) => setTimeout(res, 20));
  }

  broadcastToConversationFallback(convId, {
    type: "message",
    text: fakeResponse,
  });
}

/* ------------------------------------------------------
 * MAIN ROUTER TO PYTHON/GO ENGINES
 * ----------------------------------------------------*/
export async function routeToEngine(opts: RouteOpts) {
  const engine = chooseEngine(opts);

  try {
    if (engine === "python") {
      const pyHost = process.env.PY_BACKEND_URL || "http://localhost:5000";

      await axios.post(
        `${pyHost}/api/generate`,
        {
          conversationId: opts.conversationId,
          message: opts.message,
          engine: "python",
        },
        { timeout: 10_000 }
      );

      return;
    }

    if (engine === "go") {
      const goHost = process.env.GO_BACKEND_URL || "http://localhost:9000";

      await axios.post(
        `${goHost}/api/generate`,
        {
          conversationId: opts.conversationId,
          message: opts.message,
          engine: "go",
        },
        { timeout: 10_000 }
      );

      return;
    }

    throw new Error("Unknown engine");
  } catch (err) {
    console.error("Engine error → fallback:", err);
    await simulateLocalStreaming(opts.conversationId, opts.message);
  }
}
