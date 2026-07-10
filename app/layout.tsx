import type { Metadata, Viewport } from 'next'
import './globals.css'
import { RootLayoutClient } from './layout-client'

export const metadata: Metadata = {
  title: 'GrowEasy - CSV Importer',
  description: 'AI-powered CSV importer for CRM leads and contacts',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f7ff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1a2f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background scroll-smooth" suppressHydrationWarning>
      <body className="antialiased">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}
