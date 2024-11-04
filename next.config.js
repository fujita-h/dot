/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['@azure/storage-blob', '@dqbd/tiktoken'],
  poweredByHeader: false,
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000',
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig
