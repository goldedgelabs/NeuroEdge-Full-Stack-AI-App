// src/lib/agents.ts
export type AgentProfile = {
  id: string;
  name: string;
  description?: string;
  status?: 'online'|'idle'|'offline';
  preferredEngine?: 'python'|'go'|'ts';
};

export const DEFAULT_AGENTS: AgentProfile[] = [
  { id: 'neuro-core', name: 'NeuroEdge Core', description: 'General LLM', status: 'online', preferredEngine: 'python' },
  { id: 'vision', name: 'Vision Engine', description: 'Image/vision tasks', status: 'idle', preferredEngine: 'go' },
  { id: 'research', name: 'Research Agent', description: 'Research & browsing', status: 'online', preferredEngine: 'python' },
];
