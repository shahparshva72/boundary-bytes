import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'p.imgci.com',
        pathname: '/db/PICTURES/**',
      },
      {
        protocol: 'https',
        hostname: 'p.imgci.com',
        pathname: '/db/PICTURES/**',
      },
    ],
  },
};

export default nextConfig;
