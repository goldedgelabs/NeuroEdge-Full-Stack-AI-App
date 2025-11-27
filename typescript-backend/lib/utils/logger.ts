export function log(...args: any[]) { console.log('[neuroedge]', ...args); }
export function error(...args: any[]) { console.error('[neuroedge][error]', ...args); }
export function info(...args: any[]) { console.info('[neuroedge][info]', ...args); }
export default { log, error, info };
