/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3845',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      // Booking.com hotel images
      {
        protocol: 'https',
        hostname: 'cf.bstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cf2.bstatic.com',
        pathname: '/**',
      },
      // Unsplash for mock hotel images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

