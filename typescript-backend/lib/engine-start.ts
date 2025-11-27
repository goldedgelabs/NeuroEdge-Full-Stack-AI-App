import engines from './engines/registry';

let _bootPromise: Promise<Record<string, any>> | null = null;

export function ensureEnginesBooted() {
  if (!_bootPromise) {
    _bootPromise = (async () => {
      const loaded: Record<string, any> = {};
      for (const k of Object.keys(engines)) {
        try {
          const inst = engines[k];
          if (inst && typeof inst.init === 'function') {
            await inst.init();
          }
          loaded[k] = inst;
          console.log('[engine-start] booted', k);
        } catch (e) {
          console.error('[engine-start] failed to boot', k, e);
        }
      }
      return loaded;
    })();
  }
  return _bootPromise;
}
