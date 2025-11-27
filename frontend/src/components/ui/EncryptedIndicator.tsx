// src/components/ui/EncryptedIndicator.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { getRawKey } from '@/lib/secure-storage'; // export getRawKey? we have getRawKey internal; we can add an export

export default function EncryptedIndicator() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        // safe attempt to detect key presence
        const db = await (await import('@/lib/secure-storage')).getRawKey();
        setEnabled(Boolean(db));
      } catch {
        setEnabled(false);
      }
    })();
  }, []);
  return <div className={`text-xs ${enabled ? 'text-green-300' : 'text-yellow-300'}`}>{enabled ? 'Encrypted local storage' : 'Local storage unencrypted'}</div>;
}
