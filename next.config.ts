import type { NextConfig } from "next";

function getSupabaseOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) {
    return "https://*.supabase.co";
  }
  try {
    return new URL(raw).origin;
  } catch {
    return "https://*.supabase.co";
  }
}

const supabaseOrigin = getSupabaseOrigin();
const isProd = process.env.NODE_ENV === "production";

const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-inline' preserva rutas estáticas, hidratación RSC y el script pre-pintado fonts-ready
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' ${supabaseOrigin} data: blob:`,
  `connect-src 'self' ${supabaseOrigin}`,
  "frame-src https://bandcamp.com https://*.bandcamp.com",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const adminNoCacheHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, max-age=0",
  },
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), geolocation=(), microphone=(), focus-without-user-activation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
        ],
      },
      {
        source: "/login",
        headers: adminNoCacheHeaders,
      },
      {
        source: "/dashboard",
        headers: adminNoCacheHeaders,
      },
      {
        source: "/dashboard/:path*",
        headers: adminNoCacheHeaders,
      },
    ];
  },
};

export default nextConfig;
