import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — Repeat Dance Record Store',
}

export default function ContactPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-xs text-gray-500 mb-8">
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <span className="text-black">Contact</span>
      </nav>

      <div className="max-w-2xl">
        <h1 className="heading-lg mb-8">Contact</h1>

        {/* About */}
        <div className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4">About Repeat Dance</h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Repeat Dance started as a party in Melbourne, Australia — a night dedicated to the
              sounds that make you move: house, techno, disco, and everything in between.
            </p>
            <p>
              In 2026, we made the move to Tokyo, Japan, opening our record store to share the
              music we love with the world. Our inventory is sourced from years of digging —
              carefully selected records we stand behind, shipped directly from Tokyo via Japan
              Post EMS.
            </p>
            <p>
              Every record in the store is personally graded and packed with care. If you have any
              questions about a specific record, shipping, or anything else — reach out.
            </p>
          </div>
        </div>

        {/* Contact info */}
        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Get in Touch</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-gray-500">Email</span>
                <br />
                <a href="mailto:hello@repeatdance.jp" className="font-bold hover:underline">
                  hello@repeatdance.jp
                </a>
              </li>
              <li>
                <span className="text-gray-500">Discogs</span>
                <br />
                <a
                  href="https://www.discogs.com/seller/mitch.aiff"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline"
                >
                  mitch.aiff on Discogs →
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Location</h2>
            <p className="text-sm text-gray-700">
              Tokyo, Japan
              <br />
              <span className="text-gray-500">Ships worldwide via Japan Post EMS</span>
            </p>
            <p className="text-sm text-gray-700 mt-3">
              Originally from Melbourne, Australia
            </p>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-gray-50 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Shipping</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            All orders ship from Tokyo via Japan Post EMS — tracked, insured, and delivered
            worldwide. Shipping cost is calculated automatically at checkout based on your
            location and the weight of your order.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
            {[
              { zone: 'Zone 1', region: 'Asia', days: '3–5 days' },
              { zone: 'Zone 2', region: 'N. America / Oceania', days: '5–7 days' },
              { zone: 'Zone 3', region: 'Europe', days: '7–10 days' },
              { zone: 'Zone 4', region: 'S. America / Africa', days: '10–14 days' },
            ].map((z) => (
              <div key={z.zone}>
                <p className="font-bold">{z.zone}</p>
                <p className="text-gray-500">{z.region}</p>
                <p className="text-gray-500">{z.days}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
