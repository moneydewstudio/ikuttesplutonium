/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Handle node: scheme imports
  webpack: (config, { isServer }) => {
    // Only apply these modifications for client-side builds
    if (!isServer) {
      // Replace node: scheme imports with empty modules on the client side
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase-admin': false,
      };
      
      // Polyfill or mock node modules that are used in client builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        'node:process': false,
        'node:fs': false,
        'node:path': false,
        'node:crypto': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
