import Link from 'next/link'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-black mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Logo size="sm" className="mb-4" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Record store based in Tokyo, Japan.<br />
              Specialising in electronic, dance, and club music.<br />
              Shipping worldwide via Japan Post EMS.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-xs hover:underline">
                  All Records
                </Link>
              </li>
              <li>
                <Link href="/shop?new=true" className="text-xs hover:underline">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Info</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-xs hover:underline">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Repeat Dance Record Store. Tokyo, Japan.
          </p>
          <p className="text-xs text-gray-400">
            Powered by Discogs · Stripe · Japan Post EMS
          </p>
        </div>
      </div>
    </footer>
  )
}
