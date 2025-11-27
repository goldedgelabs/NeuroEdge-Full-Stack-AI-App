'use client';
import { useEffect } from 'react';

export default function AutoBoot() {
  useEffect(() => {
    fetch('/api/ping').catch(()=>{});
  }, []);
  return null;
}
