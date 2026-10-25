import type { Metadata, Viewport } from 'next'
import { Host_Grotesk } from 'next/font/google'
import { LibraryShell } from '@/components/case-library/library-shell'
import './globals.css'

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-host-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Case Law Library — Search, review, and explore legal judgments',
  description:
    'A design prototype of a legal research dashboard: search, filter, and read illustrative case records. Sample data only.',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={hostGrotesk.variable}>
      <body>
        <LibraryShell>{children}</LibraryShell>
      </body>
    </html>
  )
}
