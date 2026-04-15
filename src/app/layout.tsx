import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'

export const metadata: Metadata = {
  title: {
    default: 'Repeat Dance Record Store — Tokyo, Japan',
    template: '%s | Repeat Dance',
  },
  description:
    'Electronic, dance, and club music on vinyl. Based in Tokyo, Japan. Shipping worldwide via Japan Post EMS.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Repeat Dance Record Store',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  )
}
