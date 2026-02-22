import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ConditionalNavbar from "@/components/conditional-navbar"
import Head from "next/head"
import { inter, montserrat } from "@/lib/fonts"
import AOSInit from "@/components/UI/AOSInit"

export const metadata: Metadata = {
  title: "South Place Catering Services | Professional Catering & Facilities Management",
  description:
    "South Place Catering Services provides professional catering, facilities management, housekeeping, and support services across Nigeria. Trusted for quality and reliability.",
  keywords:
    "catering services Nigeria, industrial catering, facilities management, housekeeping services, laundry services, corporate catering",
  openGraph: {
    title: "South Place Catering Services | Professional Catering Solutions",
    description:
      "Excellence in industrial catering, facilities management, and support services across Nigeria.",
    url: "https://www.southplacecatering.com",
    siteName: "South Place Catering Services",
    images: [
      {
        url: "/images/food1.webp",
        width: 1200,
        height: 630,
        alt: "South Place Catering Services",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${montserrat.variable}`}>
      <Head>
        <link rel="canonical" href="https://www.southplacecatering.com/" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#F97316" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="South Place Catering Services" />
        <meta name="twitter:description" content="Professional catering and facilities management services in Nigeria." />
        <meta name="twitter:image" content="https://www.southplacecatering.com/images/food1.webp" />
        {/* Open Graph (redundant with metadata, but for extra compatibility) */}
        <meta property="og:title" content="South Place Catering Services | Professional Catering Solutions" />
        <meta property="og:description" content="Excellence in industrial catering, facilities management, and support services across Nigeria." />
        <meta property="og:image" content="https://www.southplacecatering.com/images/food1.webp" />
        <meta property="og:url" content="https://www.southplacecatering.com/" />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "South Place Catering Services",
              "image": "https://www.southplacecatering.com/images/food1.webp",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "8A Oluwakayode Jacobs, Lekki Phase 1",
                "addressLocality": "Lagos",
                "addressRegion": "Lagos",
                "postalCode": "",
                "addressCountry": "NG"
              },
              "telephone": "+234-806-779-3091",
              "url": "https://www.southplacecatering.com",
              "sameAs": [
                "https://www.instagram.com/",
                "https://www.facebook.com/"
              ]
            })
          }}
        />
      </Head>
      <body className="font-sans antialiased">
        <AOSInit />
        <ConditionalNavbar>
          <main className="overflow-hidden">{children}</main>
        </ConditionalNavbar>
      </body>
    </html>
  )
}
