import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude native-binary packages from Webpack bundling so Node.js can
  // require() them at runtime on Vercel's serverless infrastructure.
  serverExternalPackages: [
    'puppeteer',
    'puppeteer-core',
    '@sparticuz/chromium',
  ],
};

export default nextConfig;
