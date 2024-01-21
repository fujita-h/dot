/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook : true,
    serverComponentsExternalPackages: ['@azure/storage-blob'],
  },
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
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
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
