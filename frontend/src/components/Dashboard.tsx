
'use client'
import React from 'react';
import useMetricsStream from '../lib/neuroedge/hooks/useMetricsStream';
import useMemoryGraph from '../lib/neuroedge/hooks/useMemoryGraph';
import useProactiveActions from '../lib/neuroedge/hooks/useProactiveActions';
import useEngineLogs from '../lib/neuroedge/hooks/useEngineLogs';
import AgentsList from './AgentsList';
import VectorGraph from './VectorGraph';
import EngineLogs from './EngineLogs';
import RecommendationsPanel from './RecommendationsPanel';
import AdminPanel from './AdminPanel';
import useRecommendationsStream from '../lib/neuroedge/hooks/useRecommendationsStream';
import { NeuroEdgeClientProvider, useNeuroEdge } from '../lib/neuroedge/provider';

function DashboardInner() {
  const { metrics } = useMetricsStream();
  const { recommendations } = useRecommendationsStream();
  const { graph } = useMemoryGraph();
  const { actions } = useProactiveActions();
  const { logs } = useEngineLogs();
  const client = useNeuroEdge();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <section style={{ padding: 12, border: '1px solid #ddd' }}>
        <h2>Agent Metrics</h2>
        <pre>{JSON.stringify(metrics, null, 2)}</pre>
        <AgentsList />
      </section>
      <aside style={{ padding: 12, border: '1px solid #ddd' }}>
        <RecommendationsPanel recs={recommendations} />
        <VectorGraph graph={graph} />
        <EngineLogs logs={logs} />
        <AdminPanel />
      </aside>
    </div>
  )
}

export default function Dashboard() {
  return (
    <NeuroEdgeClientProvider>
      <DashboardInner />
    </NeuroEdgeClientProvider>
  )
}
