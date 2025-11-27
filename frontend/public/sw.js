
const CACHE_NAME = 'neuroedge-static-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        const response = await fetch(req.clone());
        return response;
      } catch (err) {
        try {
          const body = await req.clone().json();
          await queueRequest({ url: req.url, body, headers: {} });
          return new Response(JSON.stringify({ queued: true }), { status: 202, headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        }
      }
    })());
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        const r = await fetch(req);
        return r;
      } catch (err) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        return await cache.match(OFFLINE_URL);
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const resp = await fetch(req);
      if (req.method === 'GET' && resp && resp.status === 200) {
        cache.put(req, resp.clone());
      }
      return resp;
    } catch (err) {
      if (req.destination === 'image') {
        return new Response('', { status: 404 });
      }
      return new Response('Offline', { status: 503 });
    }
  })());
});

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('neuroedge-requests', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('requests', { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function queueRequest(obj) {
  const db = await idbOpen();
  const tx = db.transaction('requests', 'readwrite');
  tx.objectStore('requests').add(obj);
  await tx.complete;
  if ('sync' in self.registration) {
    try { await self.registration.sync.register('neuroedge-sync'); } catch(e){}
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'neuroedge-sync') {
    event.waitUntil(flushQueue());
  }
});

async function flushQueue() {
  const db = await idbOpen();
  const tx = db.transaction('requests', 'readwrite');
  const store = tx.objectStore('requests');
  const allReq = store.getAll();
  await new Promise((res, rej) => { allReq.onsuccess = ()=>res(allReq.result); allReq.onerror = ()=>rej(allReq.error); });
  const all = allReq.result || [];
  for (const req of all) {
    try {
      await fetch(req.url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(req.body) });
    } catch (e) {
      return;
    }
  }
  const clearTx = db.transaction('requests', 'readwrite');
  clearTx.objectStore('requests').clear();
  await new Promise((res, rej) => { clearTx.oncomplete = ()=>res(); clearTx.onerror = ()=>rej(clearTx.error); });
}
