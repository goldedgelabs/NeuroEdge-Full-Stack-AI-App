
'use client'
import React from 'react';
export default function EngineLogs({logs}:{logs:any[]}){ return (<div><h4>Engine Logs</h4><pre>{JSON.stringify(logs.slice(0,100),null,2)}</pre></div>); }
