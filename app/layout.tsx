import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientProvider } from '@/components/client-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'A8Visas | Hacemos tu trámite fácil',
  description: 'A8Visas - Hacemos tu trámite fácil. Expertos en trámites de visa americana. Llenado profesional del formulario DS-160, citas y asesoría completa.',
  keywords: 'A8Visas, visa americana, DS-160, tramite visa, Estados Unidos, Mexico, trámite fácil',
  icons: {
    icon: '/images/LOGOSOLO.png',
    shortcut: '/images/LOGOSOLO.png',
    apple: '/images/LOGOSOLO.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  )
}