/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Core configuration */
  reactStrictMode: true,
  
  /* Image optimization */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blend-playlist-covers.spotifycdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'charts-images.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dailymix-images.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'seed-mix-image.spotifycdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wrapped-images.spotifycdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thisis-images.scdn.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /* TypeScript configuration */
  typescript: {
    // Set to true if you want production builds to ignore TS errors
    // ignoreBuildErrors: false,
  },

  /* ESLint configuration */
  eslint: {
    // Set to true if you want production builds to ignore ESLint errors
    // ignoreDuringBuilds: false,
  },

  /* Headers for security */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },

  /* Environment variables to expose to client */
  env: {
    // Add any env vars you need on the client side
    // CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  /* Redirects if needed */
  async redirects() {
    return [
      // Example redirect
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ]
  },

  /* Rewrites if needed */
  async rewrites() {
    return [
      // Example rewrite
      // {
      //   source: '/api/spotify/:path*',
      //   destination: 'https://api.spotify.com/v1/:path*',
      // },
    ]
  },
}

export default nextConfig