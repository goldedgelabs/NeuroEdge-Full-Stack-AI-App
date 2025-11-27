
NeuroEdge Frontend - Rebuilt

This is a rebuilt Next.js App Router based frontend scaffold for NeuroEdge.

Features included:
- App Router + TypeScript
- NeuroEdge client provider with TS/PY/GO backend clients
- WebSocket hooks for metrics and recommendations
- API proxy routes to backends
- Simple auth token helpers
- Docker Compose for local full-stack testing (placeholders for backend images)

Next steps:
- Replace backend image placeholders with your built backend images
- Run `npm install` and `npm run dev` to start
- Configure environment variables (TS_BACKEND_URL, PY_BACKEND_URL, GO_BACKEND_URL)


## Offline queue & PWA
- Use QueueManager in Dashboard to view pending requests and flush.
- Service worker queues POST /api/* when offline. On reconnect, background sync or page-based flush will send them.

## Running locally with HTTPS using Caddy
- Build frontend image: `docker build -t neuroedge-frontend .`
- Start with Caddy: `docker-compose -f docker-compose.caddy.yml up --build`

## Playwright offline e2e
- Ensure dev server is running, then run: `npx playwright test e2e/offline-queue.spec.js`


## Deployment options
- Docker Compose: docker-compose.full.yml
- Kubernetes / Helm: helm/neuroedge
- Vercel: vercel.json
- Cloudflare Pages: cloudflare-pages-config.json

CI: .github/workflows/integration.yml runs the stack and Playwright e2e smoke tests.
