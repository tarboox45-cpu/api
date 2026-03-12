/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow streaming from /api/chat.js proxy route
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
