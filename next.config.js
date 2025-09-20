/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for easier Electron packaging
  output: 'standalone',
  
  // Your existing Next.js config options here...
  images: {
    domains: [
      "images.unsplash.com",
      "res.cloudinary.com",
      "cdn.example.com",
      "i.ibb.co",
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle Konva canvas module resolution issue
    if (!isServer) {
      // For client-side builds, ignore the 'canvas' module that Konva tries to import
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    // Also handle the module resolution more explicitly
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });

    return config;
  },
};

module.exports = nextConfig;
