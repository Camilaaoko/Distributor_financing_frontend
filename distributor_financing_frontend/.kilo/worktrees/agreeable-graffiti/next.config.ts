import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js to serve the app and all _next assets under /distributor-financing
  basePath: "/distributor-financing",

  // Add the server IP so Next.js dev server allows requests forwarded through Nginx
  allowedDevOrigins: ["172.16.3.14", "172.16.0.11"],
};

export default nextConfig;