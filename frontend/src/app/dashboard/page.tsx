import QueueManager from '../../components/QueueManager';
import ThemeBuilder from '../../components/ui/ThemeBuilder';
import RealtimeCharts from '../../components/ui/RealtimeCharts';
import ChatV2 from '../../components/ChatV2';

'use client'
import React from 'react';
import AgentsPanel from '../../components/AgentsPanel';
import EnginesPanel from '../../components/EnginesPanel';
import VectorsPanel from '../../components/VectorsPanel';
import JobsPanel from '../../components/JobsPanel';
import RecommendationsPanel from '../../components/RecommendationsPanel';

export default function DashboardPage(){
  return (
    <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
      <div>
        <h1>NeuroEdge Master Dashboard</h1>
        <AgentsPanel />
        <EnginesPanel />
        <VectorsPanel />
        <JobsPanel />
      </div>
      <aside>
        <RecommendationsPanel />
      <QueueManager />
      </aside>
    </div>
  )
}
