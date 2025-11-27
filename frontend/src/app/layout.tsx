
import './globals.css';
import React from 'react';
export const metadata = { title: 'NeuroEdge Console' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="app-root" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          <header style={{ padding: 16, borderBottom: '1px solid #eee' }}>
            <h1>NeuroEdge Console</h1>
          </header>
          <main style={{ padding: 16 }}>{children}</main>
        </div>
      
<script dangerouslySetInnerHTML={{ __html: `(function(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').then(()=>console.log('SW registered')).catch(()=>{}); }})();` }} />

</body>
    </html>
  )
}
