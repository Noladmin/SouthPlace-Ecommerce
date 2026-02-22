/** @type {import('next').NextConfig} */
const nextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client', 'argon2'],
  images: {
    unoptimized: true,
    remotePatterns: (() => {
      const patterns = [
        { protocol: 'https', hostname: 'images.unsplash.com' },
        { protocol: 'https', hostname: 'randomuser.me' },
        { protocol: 'https', hostname: 'i.pinimg.com' },
        { protocol: 'https', hostname: 'images.pexels.com' },
        { protocol: 'https', hostname: 'www.tasty-bowls.com' },
        { protocol: 'https', hostname: 'res.cloudinary.com' },
      ]
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        try {
          const supabaseHost = new URL(supabaseUrl).hostname
          patterns.push({ protocol: 'https', hostname: supabaseHost })
        } catch { }
      }
      return patterns
    })(),
  },
  // Output standalone for Docker/Container deployments
  output: 'standalone',

  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    /** @type {import('next/server').Headers} */
    const securityHeaders = [
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
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
      // Only send HSTS in production and over HTTPS
      ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }] : []),
    ]

    // Basic CSP (adjust if you add external sources)
    const supabaseHost = (() => {
      const u = process.env.NEXT_PUBLIC_SUPABASE_URL
      try { return u ? new URL(u).hostname : '' } catch { return '' }
    })()
    const csp = [
      "default-src 'self'",
      // Allow Stripe and Paystack JS
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://js.paystack.co https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      // Images including Stripe/Paystack assets
      `img-src 'self' data: https://images.unsplash.com https://randomuser.me https://i.pinimg.com https://images.pexels.com https://res.cloudinary.com https://m.stripe.network https://r.stripe.com https://*.paystack.co${supabaseHost ? ' https://' + supabaseHost : ''}`,
      // Audio/Video
      "media-src 'self' data:",
      // Network calls to Stripe and Paystack
      "connect-src 'self' https://api.stripe.com https://m.stripe.network https://r.stripe.com https://api.paystack.co https://js.paystack.co https://*.paystack.co",
      "font-src 'self' data:",
      // Allow Stripe and Paystack iframes/popups
      "frame-src https://js.stripe.com https://hooks.stripe.com https://js.paystack.co https://*.paystack.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
