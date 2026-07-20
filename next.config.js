/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

function getSupabaseHost() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).host : null;
  } catch {
    return null;
  }
}

const supabaseHost = getSupabaseHost();
const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : null;

// Supabase Storage (uploaded images/videos) + Google review profile photos
// (components/GoogleReviews.tsx) are the only non-self image/media sources
// the site ever renders.
const mediaSources = ["'self'", "data:", "blob:", supabaseOrigin, "https://*.googleusercontent.com"]
  .filter(Boolean)
  .join(" ");
const connectSources = ["'self'", supabaseOrigin].filter(Boolean).join(" ");

// Next.js hydration + Framer Motion's inline `style=` usage both need
// 'unsafe-inline' without a nonce setup (nonces would force every page to
// dynamic rendering, too large a change for this pass — see
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
// Shipped as Report-Only: it observes and would report violations without
// ever blocking anything, so this cannot break the site. Check the browser
// console after deploying, then promote to an enforced
// `Content-Security-Policy` header once you've confirmed there are no
// violations from real usage.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src ${mediaSources}`,
  `media-src ${mediaSources}`,
  "font-src 'self' data:",
  `connect-src ${connectSources}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

if (isProd) {
  securityHeaders.push(
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "Content-Security-Policy-Report-Only", value: cspDirectives }
  );
}

const nextConfig = {
  // Never send the `X-Powered-By: Next.js` header (minor info disclosure).
  poweredByHeader: false,
  // Pin the workspace root so Turbopack doesn't pick a parent-dir lockfile.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
