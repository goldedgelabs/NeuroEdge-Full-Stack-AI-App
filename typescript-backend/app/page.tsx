import AutoBoot from './components/AutoBoot';
import React from 'react';

export default function Home() {
  return (
    <main>
      <AutoBoot /> style={{fontFamily: 'system-ui, Arial', padding: 24}}>
      <h1>NeuroEdge Next.js Engine</h1>
      <p>Minimal dashboard. Use API routes under <code>/api/</code> to interact with Python and Go backends.</p>
      <ul>
        <li><a href="/api/proxy/py">Python Proxy (GET)</a></li>
        <li><a href="/api/proxy/go">Go Proxy (GET)</a></li>
      </ul>
    </main>
  );
}
