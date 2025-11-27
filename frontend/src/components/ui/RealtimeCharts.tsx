
'use client'
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function RealtimeCharts({ channel='metrics' }: { channel?: string }) {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    const ctx = canvasRef.current!.getContext('2d');
    const chart = new Chart(ctx!, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Throughput', data: [], fill:false, borderColor: '#0ea5a4' }]},
      options: { animation: false, responsive: true }
    });
    const ws = new WebSocket((process.env.NEXT_PUBLIC_WS_URL || (process.env.NEXT_PUBLIC_TS_BACKEND_URL||'ws://localhost:4000')).replace(/^http/, 'ws') + '/ws/metrics');
    ws.onmessage = (e)=>{ try{ const d = JSON.parse(e.data); const t = new Date().toLocaleTimeString(); chart.data.labels.push(t); chart.data.datasets[0].data.push(d.throughput || 0); if(chart.data.labels.length>30){ chart.data.labels.shift(); chart.data.datasets[0].data.shift(); } chart.update(); }catch(e){} };
    return ()=>{ chart.destroy(); ws.close(); };
  }, []);
  return (<div className='p-4 border rounded bg-white shadow-sm'><canvas ref={canvasRef}></canvas></div>)
}
