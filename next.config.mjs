/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for S3 deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Configure trailing slash for S3 compatibility
  trailingSlash: true,
  
  // Disable server-side features for static export
  typescript: {
    // Ignore build errors during static export
    ignoreBuildErrors: false,
  },
  
  webpack: (config, { isServer }) => {
    // Add this rule to handle the 'canvas' module issue with Konva
    // Konva tries to require 'canvas' conditionally, which can cause build issues in Next.js
    if (!isServer) {
      // Prevent bundling 'canvas' on the client side by marking it as external
      // This assumes the browser's native Canvas API will be used.
      config.externals.push('canvas');
    }
    return config;
  },
};

export default nextConfig;
