// backend-ts/src/services/engineRouter.ts
import axios from 'axios';

export type RouteOpts = { conversationId: string; message: string; preferredEngine?: string };

function chooseEngine(opts: RouteOpts) {
  // Simple heuristic: allow override via preferredEngine, otherwise base on keywords
  if (opts.preferredEngine) return opts.preferredEngine;
  const m = opts.message.toLowerCase();
  if (m.includes('image') || m.includes('vision') || m.includes('photo')) return 'go'; // example: Go handles vision
  if (m.includes('audio') || m.includes('transcribe')) return 'python';
  // default to python for LLM
  return 'python';
}

export async function routeToEngine(opts: RouteOpts) {
  const engine = chooseEngine(opts);
  if (engine === 'python') {
    const pyHost = process.env.PY_BACKEND_URL || 'http://localhost:5000';
    await axios.post(`${pyHost}/api/generate`, { conversationId: opts.conversationId, message: opts.message, engine: 'python' }, { timeout: 10_000 });
    return;
  } else if (engine === 'go') {
    const goHost = process.env.GO_BACKEND_URL || 'http://localhost:9000';
    await axios.post(`${goHost}/api/generate`, { conversationId: opts.conversationId, message: opts.message, engine: 'go' }, { timeout: 10_000 });
    return;
  } else {
    throw new Error('unknown engine');
  }
}
