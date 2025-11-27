export interface AgentMetric {
  id: string;
  performance: number;
  throughput: number;
  latency: number;
  last_score: number;
  updated_at?: number;
}

export interface VectorMeta {
  id: string;
  usage_count: number;
  shared: boolean;
  last_used_ts: number;
  importance: number;
  retention: number;
}

export interface RecommendationAction {
  type: string;
  params: Record<string, any>;
}

export interface Recommendation {
  vector_id?: string;
  agent?: string;
  importance?: number;
  retention?: number;
  reason?: string;
  actions: RecommendationAction[];
}
