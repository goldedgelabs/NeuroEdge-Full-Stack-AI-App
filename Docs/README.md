✅ README — Deployment Configuration Checklist (Frontend + TS + Python + Go + Database)

NeuroEdge AI — Infrastructure & Deployment Configuration Guide

This document lists every file, environment variable, URL, and code path that MUST be updated after deployment.

Use this as your master reference when deploying to:
Vercel, Cloudflare, Render, Railway, Azure, AWS, Fly.io, or Docker/Kubernetes.


---

0. ⭐ Overview of What Must Be Configured

After deployment you MUST update:

✓ Frontend

API URLs (TS backend URL)

WebSocket URL

File upload endpoints

Auth URLs

Service worker caching URL rules

PWA manifest URLs

Environment variables on Vercel/Cloudflare


✓ TypeScript Backend

PORT

Python backend URL

Go backend URL

Internal API key

JWT secret

Allowed origins (CORS)

Public domain URL

WebSocket host


✓ Python Backend

TS backend WS host

Internal API key

STT/LLM API keys (if using)

Allowed origins


✓ Go Backend

TS backend WS host

Internal API key

CORS origins


✓ Database (PostgreSQL / MySQL / MongoDB / Redis)

Connection string environment variables

Pool size

Database URLs for production

Migrations path



---

1. ✅ FRONTEND (Next.js) — What You MUST CHANGE After Deployment

Your frontend lives in:

/neuroedge-frontend/

🔧 1.1 Environment variables (MOST IMPORTANT)

Path:

neuroedge-frontend/.env.production
neuroedge-frontend/.env.local (dev)

Required variables:

NEXT_PUBLIC_TS_BACKEND_URL=https://your-ts-backend.com
NEXT_PUBLIC_WS_URL=wss://your-ts-backend.com/ws/chat
NEXT_PUBLIC_UPLOAD_URL=https://your-ts-backend.com/api/uploads
NEXT_PUBLIC_AUTH_URL=https://your-ts-backend.com/api/auth
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com

Notes:

Replace all your-ts-backend.com with your deployed TS backend domain.

Use wss:// (NOT ws://) when deployed on HTTPS.



---

🔧 1.2 Frontend API Proxy Files

Path:

neuroedge-frontend/app/api/chat/send/route.ts

Update these constants:

const TS_BACKEND = process.env.NEXT_PUBLIC_TS_BACKEND_URL!;

Make sure it matches the production backend URL.


---

Path:

neuroedge-frontend/app/api/files/upload/route.ts

Update:

const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL!;


---

🔧 1.3 WebSocket connection code

Path:

neuroedge-frontend/utils/ws-client.ts

Update:

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;


---

🔧 1.4 Service Worker (PWA)

Path:

neuroedge-frontend/public/service-worker.js

Update cache lists (optional):

const BACKEND = "https://your-ts-backend.com";


---

🔧 1.5 PWA Manifest

Path:

neuroedge-frontend/public/manifest.json

Update:

"start_url": "/",
"scope": "/",
"icons": [
  { "$ref": "your-domain icons" }
]


---

🔧 1.6 Allowed Backend CORS

If TS backend changes domain, update in frontend’s .env:

NEXT_PUBLIC_TS_BACKEND_URL


---

2. ✅ TYPESCRIPT BACKEND — What You MUST Change After Deployment

Lives in:

backend-ts/

🔧 2.1 Environment Variables

Path:

backend-ts/.env

Required:

PORT=4000
PY_BACKEND_URL=https://your-python-backend.com
GO_BACKEND_URL=https://your-go-backend.com
INTERNAL_API_KEY=your-secret
JWT_SECRET=your-super-secret
TS_WS_HOST=wss://your-ts-backend.com
PUBLIC_FRONTEND_URL=https://your-frontend.com


---

🔧 2.2 Change Engine Routing URLs

Path:

backend-ts/src/services/engineRouter.ts

Update:

const PY = process.env.PY_BACKEND_URL;
const GO = process.env.GO_BACKEND_URL;

These MUST match Python & Go production URLs.


---

🔧 2.3 CORS Whitelist

Path:

backend-ts/src/server.ts

Add:

app.use(cors({
  origin: process.env.PUBLIC_FRONTEND_URL
}));


---

🔧 2.4 WebSocket connection

Frontend must use:

wss://your-ts-backend.com/ws/chat/:conversationId

Engine uses:

TS_WS_HOST=wss://your-ts-backend.com


---

3. ✅ PYTHON BACKEND — What You MUST Change After Deployment

Lives in:

backend-py/

🔧 3.1 Environment Variables

Path:

backend-py/.env

Required:

INTERNAL_API_KEY=your-secret
TS_WS_HOST=wss://your-ts-backend.com
OPENAI_API_KEY=your-key (optional)
CORS_ORIGIN=https://your-frontend.com


---

🔧 3.2 WebSocket URL for Streaming Back

Path:

backend-py/app/routes/generate.py

Update:

ts_host = os.environ.get("TS_WS_HOST")


---

🔧 3.3 STT / LLM keys

If using Whisper or OpenAI:

OPENAI_API_KEY=xxx


---

4. ✅ GO BACKEND — What You MUST Change After Deployment

Lives in:

backend-go/

🔧 4.1 Environment Variables

Path:

backend-go/.env

INTERNAL_API_KEY=your-secret
TS_WS_HOST=wss://your-ts-backend.com
CORS_ORIGIN=https://your-frontend.com


---

🔧 4.2 Update Engine → TS WS URL

Path:

backend-go/api/generate.go

Change:

tsHost := os.Getenv("TS_WS_HOST")


---

5. ✅ DATABASE — What You MUST Change After Deployment

Applies to PostgreSQL / MySQL / MongoDB / Redis

🔧 5.1 Environment Variables (Frontend + Backends)

Path:

Frontend:

neuroedge-frontend/.env.production

Backend TS:

backend-ts/.env

Python:

backend-py/.env

Go:

backend-go/.env

Required:

DATABASE_URL=postgres://user:pass@host:5432/db
DATABASE_POOL_SIZE=10


---

🔧 5.2 Prisma / ORM Configuration (TS Backend)

If using Prisma:

Path:

backend-ts/prisma/schema.prisma

Update:

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

Run migrations after deploy:

npx prisma migrate deploy


---

🔧 5.3 Database Access in Python (SQLAlchemy)

Path:

backend-py/app/db.py

Update URL:

DB_URL = os.environ["DATABASE_URL"]


---

🔧 5.4 Go Database Config

Path:

backend-go/db/config.go

Update:

dbURL := os.Getenv("DATABASE_URL")


---
# 6 ⭐ Summary Table — ONE LOOK CHECKLIST

| Component        | What to Change                                   | Files                                                                 |
|------------------|--------------------------------------------------|-----------------------------------------------------------------------|
| **Frontend**     | API URLs, WS URL, upload URL, PWA URLs           | `.env.production`, `utils/ws-client.ts`, `api/chat/send/route.ts`, `api/files/upload/route.ts` |
| **TS Backend**   | Python URL, Go URL, internal key, JWT secret, CORS, WS host | `.env`, `services/engineRouter.ts`, `server.ts`                      |
| **Python Backend** | TS WS URL, internal key, API keys             | `.env`, `routes/generate.py`                                         |
| **Go Backend**   | TS WS URL, internal key                          | `.env`, `api/generate.go`                                            |
| **Database**     | Connection string                                | All `.env` files + ORM configs                                       |
