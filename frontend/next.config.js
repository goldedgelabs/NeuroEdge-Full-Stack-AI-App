
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  env: { NEXT_PUBLIC_TS_BACKEND_URL: process.env.TS_BACKEND_URL || 'http://localhost:4000', NEXT_PUBLIC_PY_BACKEND_URL: process.env.PY_BACKEND_URL || 'http://localhost:5000', NEXT_PUBLIC_GO_BACKEND_URL: process.env.GO_BACKEND_URL || 'http://localhost:9000',
    TS_BACKEND_URL: process.env.TS_BACKEND_URL || "http://localhost:4000",
    PY_BACKEND_URL: process.env.PY_BACKEND_URL || "http://localhost:5000",
    GO_BACKEND_URL: process.env.GO_BACKEND_URL || "http://localhost:9000",
  }
}
module.exports = nextConfig
