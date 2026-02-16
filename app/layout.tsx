import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Warehouse Management System',
  description: 'Professional Internal Warehouse Management System',
  icons: {
    icon: [
      {
        url: '/logo-pt.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo-pt.jpg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/logo-pt.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
