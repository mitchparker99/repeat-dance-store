import Image from 'next/image'
import Link from 'next/link'
import { getInventory, getListingImageUrl, cleanArtistName } from '@/lib/discogs'
import { formatPrice } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)

  let listings: Awaited<ReturnType<typeof getInventory>>['listings'] = []
  let pagination: Awaited<ReturnType<typeof getInventory>>['pagination'] | null = null
  let error = ''

  try {
    const data = await getInventory({ page, perPage: 50, sort: 'listed', sortOrder: 'desc' })
    listings = data.listings || []
    pagination = data.pagination
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch inventory'
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight">Inventory</h1>
        <div className="flex items-center gap-4">
          {pagination && (
            <span className="text-xs text-gray-400">
              {pagination.items} listing{pagination.items !== 1 ? 's' : ''} on Discogs
            </span>
          )}
          <a
            href="https://www.discogs.com/sell/manage"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
          >
            Manage on Discogs ↗
          </a>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 text-xs text-blue-800 mb-6">
        <strong>Live from Discogs.</strong> To add or remove records, manage your listings on{' '}
        <a href="https://www.discogs.com/sell/manage" target="_blank" rel="noopener noreferrer" className="underline">
          Discogs Marketplace
        </a>. Changes will appear in your store within ~3 minutes.
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-700 mb-6">
          Error loading inventory: {error}
        </div>
      )}

      {listings.length > 0 && (
        <div className="border border-gray-200">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
            <span className="col-span-1" />
            <span className="col-span-4">Release</span>
            <span className="col-span-2">Price</span>
            <span className="col-span-2">Condition</span>
            <span className="col-span-2">Format</span>
            <span className="col-span-1">Status</span>
          </div>

          <div className="divide-y divide-gray-100">
            {listings.map((listing) => {
              const artist = cleanArtistName(
                listing.release.artist || listing.release.description || 'Unknown'
              )
              const parts = listing.release.description?.split(' – ') || []
              const title = parts.length > 1 ? parts.slice(1).join(' – ') : listing.release.title || 'Unknown'
              const imageUrl = getListingImageUrl(listing)

              return (
                <div key={listing.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50">
                  {/* Thumb */}
                  <div className="col-span-1">
                    <div className="relative w-10 h-10 bg-gray-100 border border-gray-200">
                      {imageUrl && imageUrl !== '/placeholder-record.svg' ? (
                        <Image src={imageUrl} alt={title} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                  </div>
                  {/* Title */}
                  <div className="col-span-4 min-w-0">
                    <Link
                      href={`/shop/${listing.id}`}
                      target="_blank"
                      className="text-xs font-bold truncate block hover:underline"
                    >
                      {artist}
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{title}</p>
                    {listing.release.year && (
                      <p className="text-xs text-gray-400">{listing.release.year}</p>
                    )}
                  </div>
                  {/* Price */}
                  <div className="col-span-2 text-sm font-black">
                    {formatPrice(listing.price.value)}
                  </div>
                  {/* Condition */}
                  <div className="col-span-2 text-xs">
                    <span className="border border-black px-1 py-0.5">{listing.condition.split(' ')[0]}</span>
                  </div>
                  {/* Format */}
                  <div className="col-span-2 text-xs text-gray-500">
                    {listing.release.format || 'LP'}
                  </div>
                  {/* Status */}
                  <div className="col-span-1">
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      {listing.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/admin/inventory?page=${page - 1}`}
              className="text-xs font-bold border border-gray-300 px-3 py-1.5 hover:border-black">
              ← Prev
            </Link>
          )}
          <span className="text-xs font-bold px-4">{page} / {pagination.pages}</span>
          {page < pagination.pages && (
            <Link href={`/admin/inventory?page=${page + 1}`}
              className="text-xs font-bold border border-gray-300 px-3 py-1.5 hover:border-black">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
