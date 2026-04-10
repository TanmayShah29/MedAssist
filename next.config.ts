import type { NextConfig } from "next";

// ─── Security Headers ──────────────────────────────────────────────────────
// Applied to every route. Kept in one place so they're easy to audit.
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Deny embedding in iframes (clickjacking protection)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Legacy XSS filter (belt-and-suspenders; CSP is the real protection)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Limit Referer header to origin only on cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 2 years, include subdomains, apply for preload list
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Disable access to sensitive browser APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Content Security Policy
  // NOTE: `unsafe-eval` is currently required by Next.js / Turbopack for its
  // runtime module system. It can be removed once Next.js ships full nonce
  // support in the App Router (tracked: github.com/vercel/next.js/issues/42170).
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      // Supabase realtime uses wss://
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // ── External packages ───────────────────────────────────────────────────
  // pdf-parse v2 tries to load @napi-rs/canvas (browser-only). Externalizing
  // prevents Turbopack from bundling these unresolvable deps server-side.
  serverExternalPackages: ['pdf-parse'],

  // ── Turbopack (Next 16 default) ─────────────────────────────────────────
  // Empty config silences the webpack-config conflict warning.
  turbopack: {},

  // ── Experimental ────────────────────────────────────────────────────────
  experimental: {
    serverActions: {
      // 4.5 MB covers all manual-entry payloads; PDF uploads go via API route.
      bodySizeLimit: '4.5mb',
    },
  },

  // ── Image optimisation ──────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    // Serve correctly-sized images. Most UI images are small icons/avatars.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // ── Webpack (canvas extern) ─────────────────────────────────────────────
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse optionally requires canvas for rendering; we never use it.
      config.externals = [...(config.externals ?? []), 'canvas'];
    }
    return config;
  },

  // ── HTTP headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // ── Redirects ───────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Canonical: ensure /upload always goes to dashboard
      {
        source: '/upload',
        destination: '/dashboard',
        permanent: true,
      },
      // Canonical: /login → /auth
      {
        source: '/login',
        destination: '/auth?mode=login',
        permanent: true,
      },
    ];
  },
};

// NOTE: Per-route `maxDuration` must be set inside the route file itself via
//   `export const maxDuration = N`
// A top-level export here has no effect in Next.js.
// See: src/app/api/analyze-report/route.ts (maxDuration = 60)

export default nextConfig;
