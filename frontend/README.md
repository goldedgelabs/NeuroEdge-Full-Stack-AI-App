# ⚡️ NeuroEdge Frontend  
### 🌐 Next.js 14 • 🔥 React 18 • 🧠 Multi-Backend AI • 📦 PWA • ⚙️ Offline-First • 🛰 WebSockets

Welcome to the **NeuroEdge Frontend**, the official UI layer for the **NeuroEdge Distributed AI Platform**.

This frontend powers:
- 🔥 Real-time AI engines  
- 🧩 Multi-backend routing (TS, Python, Go)  
- 📡 WebSocket live engine logs  
- ⚡ PWA with 100% offline mode  
- 🎛 Admin dashboards  
- 📊 Vector + engine insights  
- 🔐 Secure JWT auth  
- 🧭 Multi-tenant navigation  
- 🗄 Full backend integration with PostgreSQL + pgvector  

This is the **same architecture style** used by platforms like **OpenAI**, **Google Gemini**, and other enterprise-scale AI systems.

---

# 🚀 Features

### 🌐 **Next.js 14 (App Router)**
- Optimized for server components  
- Parallel routing  
- Streaming UI  

### 🔥 **Three-Backend Integration**
The frontend communicates with:
- 🟦 **TypeScript Backend** — core API
- 🟨 **Python Backend** — AI/ML engines
- 🟩 **Go Backend** — vector search, memory, analytics

Supports:
- 🔁 Fan-out requests  
- 🤝 Backend handoff  
- ⚠️ Automatic fallback  

### 📡 **WebSockets Everywhere**
- Engine logs  
- Memory graph  
- Pipeline progress  
- Status updates  

### 📦 **Powerful PWA**
- 100% offline  
- Background sync  
- IndexedDB caching  
- Realtime reconnect  
- Home-screen app icon  

### 🔐 **Auth System**
- JWT login  
- Refresh token cycle  
- Admin mode  
- Multi-tenant support  

### 📊 **Admin UI**
- Tenant creation  
- User management  
- Engine control panel  
- Vector storage explorer  
- Logs + metrics  

### 🧪 **Testing**
- Playwright E2E  
- Vitest unit tests  
- Coverage-ready  

### ☁️ **Deployment Support**
Ready for:
- ⚡ **Vercel**
- ☁️ **Cloudflare**
- 🐳 **Docker**
- ☸️ **Kubernetes**
- 🔐 **Vault secrets**

---

# 📁 Project Structure

neuroedge-frontend/ │ ├── app/                     # Next.js App Router pages │   ├── dashboard/          # Main dashboard │   ├── admin/              # Admin panel │   ├── engines/            # Engine insights │   ├── vectors/            # Vector UI │   └── api/                # Local API routes (auth, proxy) │ ├── components/             # Reusable UI elements │   ├── ui/                 # shadcn/ui components │   ├── charts/             # Metrics + graphs │   ├── chat/               # Chat + messaging │   └── layout/             # Sidebars, headers │ ├── lib/ │   ├── api-client.ts       # Multi-backend API SDK │   ├── ws-client.ts        # WebSocket helper │   ├── storage.ts          # IndexedDB cache │   └── auth.ts             # Token handling + refresh │ ├── public/ │   ├── icons/              # App icons │   └── service-worker.js   # PWA SW │ ├── playwright/tests/       # E2E tests ├── next.config.js ├── tailwind.config.js └── package.json

---

# 🔧 Configuration

## 🔗 Environment Variables

Create `.env.local`:

NEXT_PUBLIC_TS_BACKEND_URL=https://your-ts-backend NEXT_PUBLIC_PY_BACKEND_URL=https://your-python-backend NEXT_PUBLIC_GO_BACKEND_URL=https://your-go-backend

NEXT_PUBLIC_APP_NAME=NeuroEdge NEXT_PUBLIC_ENABLE_PWA=true

---

# 📡 Connecting to the Backends

The frontend routes requests like this:

/api/proxy/ts     → TypeScript backend
/api/proxy/py     → Python backend
/api/proxy/go     → Go backend

Each proxy injects:
- 🔐 JWT token  
- 🧠 Tenant header  
- 📎 Trace ID  
- 🔍 Request metadata  

---

# 🛰 WebSockets

The WS client automatically:
- reconnects  
- buffers offline messages  
- flushes when online  
- joins engine rooms  

Example:

```ts
const ws = createWS("engine-logs", (msg) => {
  console.log("log:", msg);
});


---

📦 Offline Mode (PWA)

The service worker caches:

HTML

JS + CSS

API responses

Engine metadata

Vector results


Your application works fully offline, including:

Dashboard

Engine list

Cached chat

Admin view (limited to cached records)



---

🧭 Admin Panel

Available under:

/admin

Contains:

🧑‍💼 User management

🏷 Tenant creation

🧠 Engine control dashboard

📊 System metrics

🔧 Maintenance tools



---

🐳 Docker Usage

docker build -t neuroedge-frontend .
docker run -p 3000:3000 neuroedge-frontend


---

☁️ Kubernetes Deployment

kubectl apply -f k8s/frontend.yaml

Includes:

autoscaling

health probes

ConfigMap injection

PWA caching tuning



---

🧪 Testing

Run E2E tests:

npx playwright test

Run unit tests:

npm test


---

🚀 Production Deployment

You can deploy to:

⚡ Vercel

Instant, supports edge functions.

☁️ Cloudflare

Fast, global, serverless.

🐳 Docker

For VPS / custom infra.

☸️ Kubernetes

Production-grade like OpenAI.


---

🏆 Summary

NeuroEdge Frontend is:

🚀 Fast

🔐 Secure

🌍 Globally deployable

🧠 AI-engine aware

📦 Offline-first

🛰 Multi-backend intelligent

🧭 Enterprise-grade

🌐 Built like OpenAI’s own frontend stack


This UI is ready for real engines, real users, and real production load.


---

❤️ Credits

Built as part of the NeuroEdge Distributed AI Platform — next-generation full-stack AI.

---
