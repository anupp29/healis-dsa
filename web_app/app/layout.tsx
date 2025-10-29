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
      <body className={`${inter.className} bg-gradient-to-br from-pastel-whisper via-pastel-pearl to-pastel-sky min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-pastel-whisper/50 via-pastel-pearl/30 to-pastel-sky/50">
          {children}
        </div>
      </body>
    </html>
  )
}
