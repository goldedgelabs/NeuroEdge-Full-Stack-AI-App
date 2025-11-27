
'use client'
import React from 'react';
export default function LogsPanel({logs}:{logs:any[]}){ return (<section className='border border-gray-200 p-4 rounded bg-white shadow-sm'><h2>Logs</h2><pre>{JSON.stringify(logs.slice(0,100),null,2)}</pre></section>) }
