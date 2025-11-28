// src/lib/api/agents.ts
import axios from 'axios';

const base = process.env.NEXT_PUBLIC_TS_BACKEND_URL || '';

export type AgentConfig = {
  id?: string;
  name?: string;
  description?: string;
  resources?: { cpu?: number; memoryMb?: number; replicas?: number };
  autoscale?: { enabled: boolean; minReplicas?: number; maxReplicas?: number; targetRps?: number };
  env?: Record<string,string>;
};

export async function startAgent(id: string) {
  return axios.post(`/api/agents/${id}/start`);
}
export async function stopAgent(id: string) {
  return axios.post(`/api/agents/${id}/stop`);
}
export async function restartAgent(id: string) {
  return axios.post(`/api/agents/${id}/restart`);
}
export async function reloadAgentConfig(id: string) {
  return axios.post(`/api/agents/${id}/reload-config`);
}
export async function testAgent(id: string, payload: { message: string }) {
  return axios.post(`/api/agents/${id}/test`, payload);
}

export async function getAgentConfig(id: string): Promise<AgentConfig> {
  const r = await axios.get(`/api/agents/${id}/config`);
  return r.data;
}
export async function saveAgentConfig(id: string, cfg: AgentConfig) {
  return axios.post(`/api/agents/${id}/config`, cfg);
}

// Metrics/controls
export async function setAgentResources(id: string, resources: AgentConfig['resources']) {
  return axios.post(`/api/agents/${id}/resources`, resources);
}
export async function setAgentAutoscale(id: string, autoscale: AgentConfig['autoscale']) {
  return axios.post(`/api/agents/${id}/autoscale`, autoscale);
}
