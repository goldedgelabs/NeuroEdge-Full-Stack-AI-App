/**
 * Engine Adapter - ensures every engine conforms to the standard interface:
 *  - init(): Promise<void>
 *  - run(payload: any): Promise<any>
 *  - metrics(): any
 *
 * Wraps engines that don't implement all methods with sensible defaults.
 */
import engines from './engines/registry';

export type EngineLike = any;

function normalize(engineModule: EngineLike) {
  // engineModule may be a module namespace or default export
  const E = engineModule && (engineModule.default || engineModule);
  if (!E) return null;
  // If it's a class, instantiate; if object, use directly
  let instance: any;
  try {
    if (typeof E === 'function') {
      instance = new E();
    } else {
      instance = E;
    }
  } catch (e) {
    instance = E;
  }
  // ensure methods exist
  if (typeof instance.init !== 'function') instance.init = async () => {};
  if (typeof instance.run !== 'function') instance.run = async (_payload: any) => { return null; };
  if (typeof instance.metrics !== 'function') instance.metrics = () => ({ });
  if (!instance.name) instance.name = instance.constructor && instance.constructor.name || 'UnnamedEngine';
  return instance;
}

export async function bootAll() {
  const loaded: Record<string, any> = {};
  for (const k of Object.keys(engines)) {
    try {
      const mod = engines[k];
      const inst = normalize(mod);
      if (inst) {
        if (typeof inst.init === 'function') {
          await inst.init();
        }
        loaded[k] = inst;
        console.log('[engine-adapter] booted', k);
      } else {
        console.warn('[engine-adapter] skipped', k);
      }
    } catch (e) {
      console.error('[engine-adapter] failed to boot', k, e);
    }
  }
  return loaded;
}
