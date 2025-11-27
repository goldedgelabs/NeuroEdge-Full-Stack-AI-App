/**
 * Brain Router - simple orchestration layer that routes tasks to agents and engines.
 * Exposes runTask(agentName, payload) that will prefer agents, then engines.
 */
import engines from '../engines/registry';
import agents from '../agents/registry';

export async function runTask(target: string, payload: any) {
  // prefer agents
  if (agents && agents[target]) {
    const a = agents[target];
    if (a && typeof a.run === 'function') return await a.run(payload);
  }
  // fallback to engines
  if (engines && engines[target]) {
    const e = engines[target];
    if (e && typeof e.run === 'function') return await e.run(payload);
  }
  throw new Error('Unknown target: ' + target);
}

export function listCapabilities() {
  return { agents: Object.keys(agents || {}), engines: Object.keys(engines || {}) };
}
