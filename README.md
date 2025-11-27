# ⚡ NeuroEdge — Full-Stack AI Platform  
Multi-Engine • Multi-Language • Production-Ready

NeuroEdge is a **full-stack, multi-backend AI system** designed to run multiple engines (Go, Python, TypeScript) under one unified platform.  
It is built for **performance, modularity, developer freedom, and massive scalability**.

---

## 🚀 Features

### **🔹 1. Multi-Language Backend Architecture**
NeuroEdge includes 3 powerful engines:

| Engine | Language | Purpose |
|--------|----------|---------|
| **Go Engine** | Go (chi) | Ultra-fast AI microservices |
| **Python Engine** | Python/FastAPI | ML, NLP, Vision, Deep models |
| **TypeScript Engine** | Node.js/Next.js server | Realtime sockets, Web APIs |

Each engine is standalone but connected through HTTP/WebSockets.

---

### **🔹 2. Full Frontend (Next.js + Tailwind + PWA)**
NeuroEdge’s UI is:

- ⚛️ **Next.js 14 App Router**
- 🎨 TailwindCSS
- 🔋 PWA enabled (service worker + offline)
- 🔐 Secure API routing
- 🔔 Realtime socket integration
- 📱 Mobile-first responsive design

---

### **🔹 3. Unified Architecture**
```
/NeuroEdge
  ├── go-backend/
  ├── python-backend/
  ├── typescript-backend/
  ├── frontend/
  └── Database/
```

Everything is organized for monorepo-ready deployment.

---

## 🧠 Engines & Capabilities

NeuroEdge includes 20+ AI engines:

- SelfImprovementEngine  
- PredictiveEngine  
- CodeEngine  
- VoiceEngine  
- VisionEngine  
- ReinforcementEngine  
- AnalyticsEngine  
- MemoryEngine  
- RecommendationEngine  
- TranslationEngine  
- SummarizationEngine  
- SecurityEngine  
- MonitoringEngine  
- SchedulingEngine  
- ConversationEngine  

…and many more.

Each engine exposes:

- REST API  
- WebSocket streams  
- Realtime events  
- Optional batching  

---

## 🔗 Connecting the Frontend to All Backends

The frontend communicates with engines using:

- `NEXT_PUBLIC_API_GO_URL=`  
- `NEXT_PUBLIC_API_PYTHON_URL=`  
- `NEXT_PUBLIC_API_TS_URL=`

Send messages from UI → Router → Engine.

---

## 🚀 Deployment Options

### **Frontend**
- Vercel (recommended)
- Cloudflare Pages
- Azure Static Web Apps

### **Go Backend**
- Fly.io
- Render
- Railway  
- Azure App Service

### **Python Backend**
- FastAPI on Railway
- Fly.io
- Azure Web App

### **TypeScript Backend**
- Vercel Serverless
- Node server on Railway/Fly

---

## 🛠️ Development

### Clone repo:
```bash
git clone https://github.com/goldedgelabs/NeuroEdge-Full-Stack-AI-App.git
cd NeuroEdge-Full-Stack-AI-App
```

---

## 🔥 Start Engines

### Go:
```bash
cd go-backend
go run main.go
```

### Python:
```bash
cd python-backend
uvicorn main:app --reload
```

### TypeScript:
```bash
cd typescript-backend
npm install
npm run dev
```

---

## 🖥️ Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧩 Architecture Overview

```
Frontend (Next.js)
       |
       | REST / WebSocket
       v
 ┌─────────────┐
 | Go Engine   |
 ├─────────────┤
 | Python AI   |
 ├─────────────┤
 | TS Engine   |
 └─────────────┘
```

Each service is independent but connected through shared APIs.

---

## 🛡️ Security & Performance

- JWT / HMAC-ready
- Rate limiting (Go middleware)
- Optimized inference batching
- PWA secure context
- CORS hardened
- Multi-engine separation for safety

---

## 🌐 Production Checklist

- [ ] Configure `.env` files  
- [ ] Connect backend URLs  
- [ ] Enable production builds  
- [ ] Deploy each engine  
- [ ] Attach CDN (Cloudflare)  
- [ ] Add monitoring  

---

## 📄 License
MIT — free for personal and commercial use.

---

## ✨ Authors
**GoldEdge Labs**  
Creator: Joseph Were 
