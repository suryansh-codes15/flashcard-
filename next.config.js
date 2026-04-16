/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf2json', 'sharp'],
  experimental: {
    outputFileTracingExcludes: {
      "/*": ["./node_modules/canvas/**/*", "./node_modules/jsdom/**/*", "./node_modules/pdfjs-dist/**/*"],
      "/api/**/*": ["./node_modules/canvas/**/*", "./node_modules/jsdom/**/*", "./node_modules/pdfjs-dist/**/*"]
    }
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    }
    return config;
  },
};

module.exports = nextConfig;
