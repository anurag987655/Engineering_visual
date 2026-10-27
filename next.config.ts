import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Content Security Policy for the existing application.
 *
 * Notes / deliberate trade-offs:
 * - `script-src`/`style-src` keep `'unsafe-inline'` because Next.js inlines
 *   its hydration and RSC payloads and React sets inline style attributes.
 *   A per-request nonce would require dynamic rendering, which this app
 *   deliberately avoids (static / partial prerendered pages). The policy
 *   still pins every origin to `'self'`, so no third-party script, style,
 *   font or connection origin is allowed.
 * - No third-party origins are needed: fonts are self-hosted by next/font,
 *   math styles come from the bundled KaTeX stylesheet, and the only network
 *   call is `fetch("/api/feedback")` on the same origin.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
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
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
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
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-math"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-katex", { strict: false, throwOnError: false }],
    ],
  },
});

export default withMDX(nextConfig);
