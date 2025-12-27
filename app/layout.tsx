import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Node Wave',
  url: 'https://www.nodewave.io',
  description: 'We build tailored automation solutions that streamline your internal processes. From Salesforce workflows to intelligent document handling.',
  sameAs: [],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Node Wave',
  url: 'https://www.nodewave.io',
  description: 'Custom automation solutions for your business.',
  publisher: {
    '@type': 'Organization',
    name: 'Node Wave',
  },
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nodewave.io'),
  title: 'Node Wave - Custom Automation for Your Business',
  description: 'We build tailored automation solutions that streamline your internal processes. From Salesforce workflows to intelligent document handling.',
  generator: 'Next.js',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.nodewave.io',
    siteName: 'Node Wave',
    title: 'Node Wave - Custom Automation for Your Business',
    description: 'We build tailored automation solutions that streamline your internal processes. From Salesforce workflows to intelligent document handling.',
  },
  twitter: {
    card: 'summary',
    title: 'Node Wave - Custom Automation for Your Business',
    description: 'We build tailored automation solutions that streamline your internal processes. From Salesforce workflows to intelligent document handling.',
  },
  alternates: {
    canonical: 'https://www.nodewave.io',
    types: {
      'application/rss+xml': 'https://www.nodewave.io/blog/feed.xml',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
