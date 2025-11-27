
'use client'
import React, { createContext, useContext } from 'react';
import TSClient from './typescript';
import BaseClient from './sdk/baseClient';
import WSMultiplexer from './sdk/wsMultiplexer';
import PyClient from './python';
import GoClient from './go';

const NeuroCtx = createContext<any>(null);

export function NeuroEdgeClientProvider({ children }: { children: React.ReactNode }) {
  const ts = new TSClient(process.env.TS_BACKEND_URL); const tsBase = new BaseClient(process.env.TS_BACKEND_URL);
  const py = new PyClient(process.env.PY_BACKEND_URL); const pyBase = new BaseClient(process.env.PY_BACKEND_URL);
  const go = new GoClient(process.env.GO_BACKEND_URL); const goBase = new BaseClient(process.env.GO_BACKEND_URL);
  const wsMux = new WSMultiplexer((process.env.NEXT_PUBLIC_WS_URL || process.env.TS_BACKEND_URL || 'ws://localhost:4000').replace(/^http/, 'ws') + '/ws');
  return <NeuroCtx.Provider value={{ ts, py, go, tsBase, pyBase, goBase, wsMux }}>{children}</NeuroCtx.Provider>
}

export function useNeuroEdge() { return useContext(NeuroCtx); }
