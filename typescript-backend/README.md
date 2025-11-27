# NeuroEdge Next.js Engine (Converted)

This repository is a Next.js app wrapping the original TypeScript backend into a Next.js full application.
It exposes API routes for integration with the Python (FastAPI) and Go backends.

## Run (development)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Set env vars to point to your backends:
   - `PY_BACKEND_URL` (default http://localhost:8000)
   - `GO_BACKEND_URL` (default http://localhost:9000)

## Structure
- `/app` - Next.js app router (pages + API routes)
- `/lib` - original TS core code migrated here (agents, runtime, utils)
- `/lib/services` - HTTP clients to Python & Go backends
- `/public` - static assets

## Notes
- This is a minimal conversion to Next.js. Additional restructuring, type improvements, and test integration will be applied on request.
