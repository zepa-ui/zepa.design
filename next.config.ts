import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * No Content-Security-Policy yet, deliberately. A CSP that has to allow
 * Clerk's CDN, Google Analytics, Cloudinary and the inline gtag bootstrap is
 * easy to get subtly wrong, and a broken CSP breaks auth in production while
 * looking fine in dev. Worth adding, but as its own change with a real test
 * pass — not bundled in with everything else.
 *
 * The headers below are the ones that carry no such risk.
 */
const securityHeaders = [
  // registry demos render in iframes on our own origin; nobody else should
  // be able to frame the site (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  // stop browsers guessing a different content type than we sent
  { key: "X-Content-Type-Options", value: "nosniff" },

  // send the full URL same-origin, only the origin cross-origin — so
  // component paths don't leak to third parties in the Referer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // nothing here needs these
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },

  // HTTPS only, once seen. Netlify already redirects; this stops the first
  // plaintext request on repeat visits.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "assets.basehub.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // every route, including API responses
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
