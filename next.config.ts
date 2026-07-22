import type { NextConfig } from 'next';

// Dynamically build allowed origins from env so prod domain works automatically
const allowedOrigins = ['localhost:3000', 'localhost:3001'];
if (process.env.NEXT_PUBLIC_APP_URL) {
  try {
    const { host } = new URL(process.env.NEXT_PUBLIC_APP_URL);
    if (host && !allowedOrigins.includes(host)) allowedOrigins.push(host);
  } catch {
    // invalid URL — skip
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
  async redirects() {
    // Redirect www → non-www in production
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    if (!appUrl.includes('localhost') && !appUrl.startsWith('http://')) {
      return [
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'www.startup-navigator.com' }],
          destination: 'https://startup-navigator.com/:path*',
          permanent: true,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
