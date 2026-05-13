import type { NextConfig } from "next";

// ── HTTP Security Headers ─────────────────────────────────────────────────────
// Applied to every response from the demo site.
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Disallow embedding in iframes
  { key: "X-Frame-Options",           value: "DENY" },
  // Control referrer info sent to external links
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Limit browser feature access
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  // Enforce HTTPS for 2 years (set by Vercel too, but explicit is safer)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Enable DNS prefetching for faster external links (GitHub, npm)
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  // Content Security Policy
  // unsafe-inline required for: Next.js inline styles, JSON-LD script tags
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Note: do NOT set `output: "standalone"` for Vercel — Vercel manages
  // the output format itself and standalone mode can conflict with it.

  async headers() {
    return [
      {
        source: "/(.*)",   // apply to all routes
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
