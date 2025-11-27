

# 🟦 NeuroEdge TypeScript Backend  
### ⚡ Node.js • 🚀 Fastify • 🧠 42 Engines • 🔗 Multi-Backend Orchestration • 📊 PostgreSQL + Redis • 🔐 JWT Auth • 🛰 WebSockets

Welcome to the **NeuroEdge TypeScript Backend**, one of the three core backends powering the **NeuroEdge Distributed AI Platform** (TypeScript + Python + Go).

This service is responsible for:  
- ⚙️ Engine orchestration (42 engines)  
- 🔁 Task routing  
- 🔐 Auth & Admin APIs  
- 📡 Realtime WebSocket streaming  
- 🧠 Vector & memory operations  
- 🗄 PostgreSQL (pgvector) integration  
- ⚡ Redis caching & queues  
- 🔗 Communication with Python and Go backends  
- 🧭 Multi-tenant isolation  
- 🔥 Rolling-swap engine hot reloads  
- 📦 API gateway for the frontend  

Built to compete with systems like **OpenAI**, **Anthropic**, **Gemini**, and **xAI**, with a modern, high-performance, distributed design.

---

# 🚀 Features

### 🧠 **42 Modular Engines**
Each engine implements a unified interface:

- SelfImprovementEngine  
- PlannerEngine  
- VectorEngine  
- EmbeddingEngine  
- AnalyticsEngine  
- RecommendationEngine  
- ConversationEngine  
- ReinforcementEngine  
- SecurityEngine  
- MonitoringEngine  
- VoiceEngine  
- VisionEngine  
- SchedulingEngine  
- …and 25+ more  

### ⚙️ **Hot-Swap Engine Reloading**
Zero-downtime engine swaps:
- loads new engine instance  
- health checks  
- atomic swap  
- rollback if failure  

### 🛰 **WebSocket Streams**
- Engine logs  
- Memory graph updates  
- Task lifecycle  
- Notifications  
- Admin events  

### 🧭 **Multi-Tenancy**
- Row-Level Security ⚔️  
- Partition per tenant  
- Tenant-bound JWT  
- Engine isolation  

### 📡 **Communication with Other Backends**
The TypeScript backend communicates with:

**Python Backend**  
- ML/LLM engines  
- Embeddings  
- Vision/Audio models  

**Go Backend**  
- Vector search  
- System analytics  
- Storage scaling  

### 🏎 **Fastify — Ultra High Performance**
- 60k req/sec  
- Native async  
- Full plugin ecosystem  

### 🗄 **PostgreSQL + pgvector + Redis**
- pgvector embeddings  
- hypertables/partitions  
- Redis caching  
- Redis pub/sub  
- Redis rate-limiting  

### 🔐 **JWT Auth**
- access + refresh token  
- admin mode  
- tenant-based claims  

### 📦 **API Gateway for Frontend**
Frontend calls only:

/api/ts/*

The TS backend routes to the correct engine or sub-backend.

### 🧪 **Testing**
- Vitest unit tests  
- Supertest API tests  
- Full mocks for Go and Python  

---

# 📁 Directory Structure

typescript-backend/ │ ├── src/ │   ├── engines/               # 42 Engines │   ├── agents/                # Internal decision agents │   ├── services/              # PostgreSQL, Redis, Go/Python clients │   ├── api/                   # Route handlers │   ├── ws/                    # WebSocket gateway │   ├── auth/                  # Login, refresh, admin │   ├── tenants/               # Multi-tenant logic │   ├── utils/                 # Helpers │   └── index.ts               # Bootstrap │ ├── prisma/                    # Database schema ├── migrations/                # SQL migrations ├── tests/                     # Vitest + Supertest │ ├── docker/                    # Docker & Compose ├── helm/                      # Kubernetes helm chart │ └── package.json

---

# 🔧 Configuration

## 📌 Environment Variables

Create `.env`:

PORT=8080

POSTGRES_URL=postgresql://user:placeholder@db:5432/neuroedge REDIS_URL=redis://localhost:6379

JWT_SECRET=your-secret-here TENANT_DEFAULT=public

GO_BACKEND_URL=http://go-backend:9000 PY_BACKEND_URL=http://python-backend:8000

---

# ⚙️ Running the Server

### 👨‍💻 Development

npm install npm run dev

### 🐳 Docker

docker build -t neuroedge-ts . docker run -p 8080:8080 neuroedge-ts

### ☸️ Kubernetes

helm install neuroedge-ts ./helm

---

# 🔐 Auth System

### Login

POST /auth/login

### Refresh

POST /auth/refresh

### Admin

POST /auth/admin/login

Tokens contain:
- tenant  
- user role  
- expiration  

---

# 🧠 Engines

Each engine exports:

```ts
export default class ExampleEngine implements IEngine {
  name = 'example-engine';
  async run(input, context) { ... }
  async health() { ... }
}

Hot Reload Endpoint

POST /admin/engines/reload/:engine

List Engines

GET /engines


---

🛰 WebSockets

Connect via:

ws://host/ws

Channels:

engine-logs

vector-updates

tenant-metrics

admin-events



---

🔗 Backend Coordination

Example: TS → Python

const r = await pythonClient.post("/embed", { text });

Example: TS → Go

const r = await goClient.get("/vectors/search?q=hello");


---

🗄 Database

PostgreSQL (pgvector)

embeddings table

memory table

events

audit log

tenant partitions


Redis

cache

rate limit

pub/sub for engine events



---

📦 Deployment Options

⭐ Vercel Serverless

Good for APIs that are stateless.

☁️ AWS ECS / EKS

Production-ready.

🐳 Docker

Local or VPS.

☸️ Kubernetes

OpenAI-style full environment.


---

🧪 Testing

Unit tests:

npm test

E2E:

npm run test:e2e


---

🏆 Summary

The NeuroEdge TypeScript Backend provides:

🧠 42 AI engines

⚙️ High-performance routing

📡 Real-time WebSockets

🔐 Secure JWT auth

🔄 Hot engine reloading

🔗 Multi-backend communication

🗄 PostgreSQL + pgvector storage

⚡ Redis acceleration

🧭 Multi-tenancy

🔥 Admin APIs

☁️ Production deployment ready

