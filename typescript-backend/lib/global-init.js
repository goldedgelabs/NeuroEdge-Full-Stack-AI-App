import { ensureEnginesBooted } from './lib/engine-start';
// trigger boot but don't await to avoid delaying startup
ensureEnginesBooted().then(() => console.log('[global-init] engines booted')).catch(e => console.error(e));
