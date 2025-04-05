import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Always include 'unsafe-eval' for WebAssembly support
    const scriptSrc = "'self' 'unsafe-inline' 'unsafe-eval'";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'none';
              script-src ${scriptSrc};
              connect-src 'self';
              img-src 'self' data:;
              style-src 'self' 'unsafe-inline';
              font-src 'self';
              base-uri 'none';
              form-action 'none';
              frame-ancestors 'none';
              object-src 'none';
              media-src 'none';
              worker-src 'none';
            `.replace(/\s{2,}/g, " ").trim(),
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
            value: "no-referrer",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;