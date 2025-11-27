
'use client'
import React from 'react';
export default function VectorGraph({graph}:{graph:any}){ return (<div><h4>Vector Memory Graph</h4><pre>{JSON.stringify(graph,null,2)}</pre></div>); }
