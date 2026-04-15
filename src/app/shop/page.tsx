import Link from 'next/link'
import { RecordCard } from '@/components/RecordCard'
import { SortSelect } from '@/components/SortSelect'
import { getInventory, getListingImageUrl, cleanArtistName } from '@/lib/discogs'

export const revalidate = 180

interface ShopPageProps {
  searchParams: Promise<{
    page?: string
    genre?: string
    condition?: string
    sort?: string
    q?: string
    new?: string
  }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const sortParam = params.sort || 'listed-desc'
  const [sortField, sortOrder] = sortParam.split('-') as [string, 'asc' | 'desc']

  let listings: Awaited<ReturnType<typeof getInventory>>['listings'] = []
  let pagination: Awaited<ReturnType<typeof getInventory>>['pagination'] | null = null

  try {
    const data = await getInventory({
      page,
      perPage: 24,
      sort: sortField as 'listed' | 'price' | 'item' | 'artist',
      sortOrder,
    })
    listings = data.listings || []
    pagination = data.pagination
  } catch (error) {
    console.error('Failed to fetch inventory:', error)
  }

  const isNewArrivals = params.new === 'true'
  const totalPages = pagination?.pages || 1

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-black pb-6">
        <div>
          <h1 className="heading-lg">{isNewArrivals ? 'New Arrivals' : 'All Records'}</h1>
          {pagination && (
            <p className="text-xs text-gray-500 mt-1">
              {pagination.items} record{pagination.items !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Sort:
          </label>
          <SortSelect current={sortParam} />
        </div>
      </div>

      {/* Grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-black mb-8">
          {listings.map((listing) => {
            const artist = cleanArtistName(
              listing.release.artist || listing.release.description || 'Unknown'
            )
            const imageUrl = getListingImageUrl(listing)
            const parts = listing.release.description?.split(' – ') || []
            const title =
              parts.length > 1
                ? parts.slice(1).join(' – ')
                : listing.release.title || listing.release.description || 'Unknown Title'

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
        <div className="border border-black p-20 text-center">
          <p className="text-sm font-bold uppercase tracking-widest">No records found</p>
          <p className="text-xs text-gray-500 mt-2">Check back soon for new inventory.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
          {page > 1 && (
            <PaginationLink href={`/shop?page=${page - 1}&sort=${sortParam}`}>
              ← Prev
            </PaginationLink>
          )}
          <span className="text-xs font-bold px-4">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <PaginationLink href={`/shop?page=${page + 1}&sort=${sortParam}`}>
              Next →
            </PaginationLink>
          )}
        </nav>
      )}
    </div>
  )
}

function PaginationLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
    >
      {children}
    </Link>
  )
}
