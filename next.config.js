/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook : true,
    serverMinification: false, // temporary workaround for Next.js 14.0.4 issue
  }
}

module.exports = nextConfig
