/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      'api.neuroedge.ai',
      'cdn.neuroedge.ai',
      'files.neuroedge.ai',
    ],
  },

  
  env: {
    NEXT_PUBLIC_TS_BACKEND_URL: process.env.TS_BACKEND_URL || 'http://localhost:4000',
    NEXT_PUBLIC_PY_BACKEND_URL: process.env.PY_BACKEND_URL || 'http://localhost:5000',
    NEXT_PUBLIC_GO_BACKEND_URL: process.env.GO_BACKEND_URL || 'http://localhost:9000',

    TS_BACKEND_URL: process.env.TS_BACKEND_URL || 'http://localhost:4000',
    PY_BACKEND_URL: process.env.PY_BACKEND_URL || 'http://localhost:5000',
    GO_BACKEND_URL: process.env.GO_BACKEND_URL || 'http://localhost:9000',
  },

  async rewrites() {
    return [
      {
        source: "/api/ts/:path*",
        destination: `${process.env.TS_BACKEND_URL || "http://localhost:4000"}/:path*`,
      },
      {
        source: "/api/py/:path*",
        destination: `${process.env.PY_BACKEND_URL || "http://localhost:5000"}/:path*`,
      },
      {
        source: "/api/go/:path*",
        destination: `${process.env.GO_BACKEND_URL || "http://localhost:9000"}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "microphone=*, camera=*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
