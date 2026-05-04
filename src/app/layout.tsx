import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
})

export const metadata: Metadata = {
  title: 'Tiim.app',
  description: 'Team check-ins and goal tracking, AI-assisted.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="et" className={`${inter.variable} h-full antialiased`}>
        <head>
          <link rel="preconnect" href="https://rsms.me" />
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        </head>
        <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
