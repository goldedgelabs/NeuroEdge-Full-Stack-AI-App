/**
 * Generic adapter factory for engines/agents.
 * - Detects default export, named export, classes, factories.
 * - Attempts multiple instantiation strategies:
 *   1) new Engine()
 *   2) new Engine({ redis, vectorDB, services })
 *   3) Engine.create?()
 *   4) Engine() (call)
 * - Wraps the implementation to provide: init(), run(payload), metrics()
 */
import type IEngine from './types';

const DEFAULT_INJECT = {
  redis: (global as any).__NEUROEDGE_REDIS || null,
  vectorDB: (global as any).__NEUROEDGE_VECTORDB || null,
  services: (global as any).__NEUROEDGE_SERVICES || null
};

function tryInstantiate(ctor: any) {
  if (!ctor) return null;
  // 1. Try no-arg constructor
  try {
    return new ctor();
  } catch (e) {}
  // 2. Try config object
  try {
    return new ctor(DEFAULT_INJECT);
  } catch (e) {}
  // 3. Try static factory create()
  try {
    if (typeof ctor.create === 'function') return ctor.create(DEFAULT_INJECT);
  } catch (e) {}
  // 4. Try calling as function
  try {
    return ctor(DEFAULT_INJECT);
  } catch (e) {}
  return null;
}

export function adaptModule(mod: any, name = 'unknown'): IEngine | null {
  if (!mod) return null;
  const E = mod.default || mod;
  let impl: any = null;
  // If module is a class/function, try to instantiate
  if (typeof E === 'function') {
    impl = tryInstantiate(E);
  } else if (E && typeof E === 'object') {
    // maybe it's already an instance or factory object
    impl = E;
  }
  if (!impl) return null;

  const instance: any = {
    name: impl.name || name,
    init: async () => { try { if (typeof impl.init === 'function') await impl.init(); } catch(e){ console.error('engine init error', e); } },
    run: async (payload: any) => { try { if (typeof impl.run === 'function') return await impl.run(payload); return null; } catch(e){ console.error('engine run error', e); return null; } },
    metrics: () => { try { if (typeof impl.metrics === 'function') return impl.metrics(); return {}; } catch(e){ console.error('engine metrics error', e); return {}; } }
  };
  return instance as IEngine;
}
