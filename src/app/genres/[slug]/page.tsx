import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RecordCard } from '@/components/RecordCard'
import { getAllInventory, getRelease, getListingImageUrl, cleanArtistName } from '@/lib/discogs'
import { slugify } from '@/lib/utils'

export const revalidate = 3600

interface GenrePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ')
  return { title: `${name} — Repeat Dance` }
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params

  const allListings = await getAllInventory()

  const listingsWithReleases = await Promise.allSettled(
    allListings.map(async (listing) => {
      const release = await getRelease(listing.release.id.toString()).catch(() => null)
      return { listing, release }
    })
  )

  const resolved = listingsWithReleases
    .filter((r): r is PromiseFulfilledResult<{ listing: typeof allListings[0]; release: Awaited<ReturnType<typeof getRelease>> | null }> => r.status === 'fulfilled')
    .map((r) => r.value)

  const genreListings = resolved.filter(({ release }) => {
    if (!release) return false
    const allTags = [...(release.genres || []), ...(release.styles || [])]
    return allTags.some((t: string) => slugify(t) === slug)
  })

  if (genreListings.length === 0) notFound()

  // Get canonical genre/style name
  const firstRelease = genreListings[0].release
  const allTags = [...(firstRelease?.genres || []), ...(firstRelease?.styles || [])]
  const genreName = allTags.find((t: string) => slugify(t) === slug) || slug.replace(/-/g, ' ')

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-xs text-gray-500 mb-8">
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <Link href="/shop" className="hover:underline">Shop</Link>
        {' / '}
        <span className="text-black capitalize">{genreName}</span>
      </nav>

      <div className="mb-12 pb-8 border-b border-gray-200">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Genre</p>
        <h1 className="heading-lg capitalize">{genreName}</h1>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
        {genreListings.length} record{genreListings.length !== 1 ? 's' : ''} for sale
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {genreListings.map(({ listing }) => {
          const artist = cleanArtistName(
            listing.release.artist || listing.release.description?.split(' – ')[0] || 'Unknown'
          )
          const imageUrl = getListingImageUrl(listing)
          const parts = listing.release.description?.split(' – ') || []
          const title =
            parts.length > 1
              ? parts.slice(1).join(' – ')
              : listing.release.title || 'Unknown Title'
          return (
            <RecordCard
              key={listing.id}
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
          )
        })}
      </div>
    </div>
  )
}
