import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
