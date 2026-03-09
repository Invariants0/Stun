/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Ensure dev server logs are visible
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
