/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf2json', 'sharp'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    }
    return config;
  },
};

module.exports = nextConfig;
