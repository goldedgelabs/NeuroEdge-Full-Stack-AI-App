import axios, { AxiosInstance } from 'axios';
import { AgentMetric } from '../utils/types';
import { createClient } from '../utils/httpClient';

const client: AxiosInstance = createClient(process.env.PY_BACKEND_URL || 'http://localhost:8000');

export async function health(): Promise<any> {
  const r = await client.get('/api/health');
  return r.data;
}

export async function getAgents(): Promise<{ agents: string[]; scores: Record<string, number> } | null> {
  const r = await client.get('/api/agents');
  return r.data || null;
}

export async function upsertVector(id: string, vector: number[], shared = false): Promise<any> {
  const payload = { id, vector, shared };
  const r = await client.post('/api/vector/upsert', payload);
  return r.data;
}

export async function executeProactive(action: any): Promise<any> {
  const r = await client.post('/api/proactive/execute', action);
  return r.data;
}
