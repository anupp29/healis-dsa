import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'HEAL Platform - Professional DSA Visualization',
  description: 'Where Basic DSA Meets Healthcare Excellence - Beautiful visualizations of algorithms in action',
  keywords: ['DSA', 'Healthcare', 'Algorithms', 'Visualization', 'Professional'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white/30 to-blue-100/50">
          {children}
        </div>
      </body>
    </html>
  )
}
