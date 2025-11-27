FROM node:20-bullseye-slim

# install build deps for uWebSockets native module
RUN apt-get update && apt-get install -y build-essential cmake python3 pkg-config git curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# copy source
COPY . .

# install uWebSockets.js (may compile native code)
RUN npm install uWebSockets.js@20.0.0 || npm install uWebSockets.js

# build Next.js
RUN npm run build

EXPOSE 3000 8081 8082
CMD ["npm", "start"]
