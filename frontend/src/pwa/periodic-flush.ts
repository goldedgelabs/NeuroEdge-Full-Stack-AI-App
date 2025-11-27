// src/pwa/periodic-flush.ts
export function startPeriodicFlush(intervalMs = 4 * 60 * 60 * 1000) {
  // If service worker supports periodicSync, the SW handles this more reliably.
  // This is a fallback that attempts to message the SW to flush the queue.
  function flush() {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'neuroedge:attemptFlush' });
    }
  }
  // try now and every interval
  flush();
  const id = setInterval(flush, intervalMs);
  window.addEventListener('online', flush);
  return () => {
    clearInterval(id);
    window.removeEventListener('online', flush);
  };
}
