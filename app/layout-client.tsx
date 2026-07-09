'use client'

import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'

export function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </ThemeProvider>
  )
}
