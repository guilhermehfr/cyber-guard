import type { NextConfig } from "next";

// Proxying the API under the web app's own origin keeps the session cookies
// first-party. Browser JavaScript can only read cookies that belong to the
// document's host, so a cross-domain API would make the auth marker cookie
// unreadable no matter how it is configured.
const apiUrl = process.env.API_URL;

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
  },
  async rewrites() {
    if (!apiUrl) {
      return [];
    }

    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
