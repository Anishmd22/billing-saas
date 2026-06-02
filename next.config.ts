import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude native-binary packages from Webpack bundling so Node.js can
  // require() them at runtime on Vercel's serverless infrastructure.
  serverExternalPackages: [
    'puppeteer',
    'puppeteer-core',
    '@sparticuz/chromium',
  ],
  experimental: {
    // Next.js file tracing only follows JS imports — it misses @sparticuz/chromium's
    // binary assets in bin/ (chromium.br, fonts.tar.br, etc.). Without this, Vercel
    // deploys the JS wrapper but not the 62MB Chromium binary, causing the
    // "bin directory does not exist" error at runtime.
    outputFileTracingIncludes: {
      '/api/v1/pdf': ['./node_modules/@sparticuz/chromium/**/*'],
    },
  },
};

export default nextConfig;
