// src/components/agents/AgentMetricsCharts.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, CategoryScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, CategoryScale);

export default function AgentMetricsCharts({ metricsStream } : { metricsStream?: { cpu:number, memory:number, rps:number } | undefined }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart|null>(null);

  useEffect(()=> {
    if(!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const cfg = {
      type: 'line' as const,
      data: {
        labels: [],
        datasets: [
          { label: 'CPU (%)', data: [], borderColor: '#ef4444', fill:false },
          { label: 'Memory (MB)', data: [], borderColor: '#3b82f6', fill:false },
          { label: 'RPS', data: [], borderColor: '#10b981', fill:false }
        ]
      },
      options: {
        animation: false,
        scales: { x: { type: 'time', time: { unit: 'second' } } }
      }
    };
    chartRef.current = new Chart(ctx, cfg);
    return ()=> { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  useEffect(()=>{
    if(!chartRef.current) return;
    const now = Date.now();
    const ch = chartRef.current;
    ch.data.labels!.push(now);
    (ch.data.datasets![0].data as any[]).push({x: now, y: (metricsStream?.cpu ?? Math.random()*40 + 10).toFixed ? Number((metricsStream?.cpu ?? Math.random()*40 + 10).toFixed(2)) : metricsStream?.cpu ?? 0});
    (ch.data.datasets![1].data as any[]).push({x: now, y: metricsStream?.memory ?? Math.random()*400 + 200});
    (ch.data.datasets![2].data as any[]).push({x: now, y: metricsStream?.rps ?? Math.random()*3});
    // keep 60 points
    ch.data.labels = ch.data.labels!.slice(-60);
    ch.data.datasets!.forEach(ds => { (ds.data as any[]) = (ds.data as any[]).slice(-60); });
    ch.update('none');
  }, [metricsStream]);

  return (
    <div className="bg-white p-3 rounded shadow border">
      <canvas ref={canvasRef} />
    </div>
  );
}
