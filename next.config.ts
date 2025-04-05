import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Check if in development mode
    const isDev = process.env.NODE_ENV === "development";
    // Conditionally include 'unsafe-eval' in development
    const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";

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