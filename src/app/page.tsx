import Link from 'next/link'
import { RecordCard } from '@/components/RecordCard'
import { getInventory, getListingImageUrl, cleanArtistName } from '@/lib/discogs'

export const revalidate = 300 // revalidate homepage every 5 minutes

async function getNewArrivals() {
  try {
    const data = await getInventory({ perPage: 8, sort: 'listed', sortOrder: 'desc' })
    return data.listings || []
  } catch (error) {
    console.error('Failed to fetch inventory:', error)
    return []
  }
}

export default async function HomePage() {
  const listings = await getNewArrivals()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-black px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="heading-xl mb-4">
            Repeat Dance<br />Record Store
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <p className="text-sm text-gray-500 max-w-sm">
              Electronic, dance, and club music on vinyl.<br />
              Based in Tokyo, Japan — shipping worldwide.
            </p>
            <Link href="/shop" className="btn-primary self-start sm:self-auto">
              Shop All Records →
            </Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-lg">New Arrivals</h2>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-widest hover:underline hidden sm:block"
            >
              View All →
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-black">
              {listings.map((listing) => {
                const artist = cleanArtistName(listing.release.artist || listing.release.description || 'Unknown')
                const imageUrl = getListingImageUrl(listing)
                const parts = listing.release.description?.split(' – ') || []
                const title = parts.length > 1 ? parts.slice(1).join(' – ') : listing.release.title || listing.release.description || 'Unknown Title'

                return (
                  <div key={listing.id} className="bg-white">
                    <RecordCard
                      listingId={listing.id.toString()}
                      releaseId={listing.release.id.toString()}
                      title={title}
                      artist={artist}
                      price={listing.price.value}
                      condition={listing.condition}
                      sleeveCondition={listing.sleeve_condition}
                      imageUrl={imageUrl}
                      format={listing.release.format || 'LP'}
                      year={listing.release.year}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border border-black p-12 text-center">
              <p className="text-sm text-gray-500">Inventory loading — check back soon.</p>
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Link href="/shop" className="btn-secondary w-full text-center text-xs">
              View All Records →
            </Link>
          </div>
        </div>
      </section>

      {/* ── About strip ──────────────────────────────────────────────────── */}
      <section className="border-t border-black bg-black text-white px-4 sm:px-6 py-12">
        <div className="max-w-screen-xl mx-auto grid sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Location</h3>
            <p className="text-sm text-gray-400">Tokyo, Japan</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Shipping</h3>
            <p className="text-sm text-gray-400">Worldwide via Japan Post EMS</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Genres</h3>
            <p className="text-sm text-gray-400">Electronic · House · Techno · Disco · Dance</p>
          </div>
        </div>
      </section>
    </>
  )
}
