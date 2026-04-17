/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf2json', 'sharp'],
  outputFileTracingExcludes: {
    "/*": ["./node_modules/canvas/**/*", "./node_modules/jsdom/**/*", "./node_modules/pdfjs-dist/**/*"],
    "/api/**/*": ["./node_modules/canvas/**/*", "./node_modules/jsdom/**/*", "./node_modules/pdfjs-dist/**/*"]
  },
  experimental: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    }
    return config;
  },
  // CSP disabled temporarily to debug styling issue
};

module.exports = nextConfig;
