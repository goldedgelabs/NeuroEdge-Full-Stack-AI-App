'use client';
import React, { useEffect, useState } from 'react';

export default function TokenMeter({ conversationId }: { conversationId?: string }) {
  const [tokens, setTokens] = useState(0);
  const [last, setLast] = useState<number | null>(null);

  useEffect(() => {
    // read from local storage / idb meta or call backend metrics
    const value = Number(localStorage.getItem(`tokens:${conversationId || 'global'}`) || 0);
    setTokens(value);
  }, [conversationId]);

  function add(n: number) {
    const next = tokens + n;
    setTokens(next);
    localStorage.setItem(`tokens:${conversationId || 'global'}`, String(next));
    setLast(Date.now());
  }

  return (
    <div className="p-2 rounded card">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-400">Tokens used</div>
          <div className="text-lg font-semibold">{tokens}</div>
        </div>
        <div>
          <button className="btn-ghost" onClick={()=>add(10)}>+10</button>
          <button className="btn-ghost" onClick={()=>add(100)}>+100</button>
        </div>
      </div>
      {last && <div className="text-xs text-gray-500 mt-2">Last updated {new Date(last).toLocaleTimeString()}</div>}
    </div>
  );
}
