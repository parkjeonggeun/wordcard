import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow unoptimized local images to fall through gracefully
    dangerouslyAllowSVG: false,
  },
  // Prevent double-tap zoom on iOS via headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
