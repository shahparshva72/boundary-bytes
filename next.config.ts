import type { NextConfig } from 'next';

const goApiBaseUrl = (process.env.BOUNDARY_BYTES_GO_API_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
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
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/players/:path*',
          destination: `${goApiBaseUrl}/api/players/:path*`,
        },
        {
          source: '/api/matches/:path*',
          destination: `${goApiBaseUrl}/api/matches/:path*`,
        },
        {
          source: '/api/stats/:path*',
          destination: `${goApiBaseUrl}/api/stats/:path*`,
        },
        {
          source: '/api/news',
          destination: `${goApiBaseUrl}/api/news`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
