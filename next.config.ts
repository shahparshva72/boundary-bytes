import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'p.imgci.com',
      },
      {
        protocol: 'https',
        hostname: 'p.imgci.com',
      },
      {
        protocol: 'http',
        hostname: 'img1.hscicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'img1.hscicdn.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
