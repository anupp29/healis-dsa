import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HEAL Platform - Next-Generation DSA Visualization',
  description: 'Interactive Data Structures and Algorithms visualization platform with real-time MongoDB integration',
  keywords: ['DSA', 'algorithms', 'data structures', 'visualization', 'MongoDB', 'healthcare'],
  authors: [{ name: 'HEAL Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="particles" id="particles-js"></div>
        {children}
      </body>
    </html>
  )
}
