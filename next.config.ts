import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    // Content Security Policy — restrict sources to known-good origins
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval; tighten in future
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  }
];

const nextConfig: NextConfig = {
  // pdf-parse v2 tries to load @napi-rs/canvas which requires DOMMatrix (browser-only).
  // Externalizing it prevents Turbopack from bundling these unresolvable deps.
  serverExternalPackages: ['pdf-parse'],
  // Next.js 16 enables Turbopack by default. Adding an empty turbopack config
  // silences the webpack-config conflict error while keeping our webpack extern.
  turbopack: {},
  experimental: {
    serverActions: {
      // 4.5MB is the Vercel Hobby limit for server action payloads.
      // PDF uploads go through the API route (not server actions) so this
      // only applies to manual entry payloads — 4.5MB is more than enough.
      bodySizeLimit: '4.5mb',
    },
  },
  // Suppress the pdf-parse peer-dep warning about canvas (we don't use canvas rendering)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse optionally requires canvas for rendering; we don't need it
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};

// NOTE: maxDuration must be set per-route via `export const maxDuration = N` inside
// the route file itself. A top-level export here has no effect in Next.js.
// See: src/app/api/analyze-report/route.ts

export default nextConfig;
