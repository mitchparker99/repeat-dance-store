import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RecordCard } from '@/components/RecordCard'
import { getAllInventory, getRelease, getListingImageUrl, cleanArtistName, getDiscogsLabelByName } from '@/lib/discogs'
import { slugify } from '@/lib/utils'

export const revalidate = 3600

interface LabelPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LabelPageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ')
  return { title: `${name} — Repeat Dance` }
}

export default async function LabelPage({ params }: LabelPageProps) {
  const { slug } = await params

  const allListings = await getAllInventory()

  // Fetch release details to get label info — use Promise.allSettled for resilience
  const listingsWithReleases = await Promise.allSettled(
    allListings.map(async (listing) => {
      const release = await getRelease(listing.release.id.toString()).catch(() => null)
      return { listing, release }
    })
  )

  const resolved = listingsWithReleases
    .filter((r): r is PromiseFulfilledResult<{ listing: typeof allListings[0]; release: Awaited<ReturnType<typeof getRelease>> | null }> => r.status === 'fulfilled')
    .map((r) => r.value)

  // Filter by label slug
  const labelListings = resolved.filter(({ release }) => {
    if (!release?.labels?.length) return false
    return release.labels.some((l: { name: string }) => slugify(l.name) === slug)
  })

  if (labelListings.length === 0) notFound()

  // Get canonical label name
  const firstLabel = labelListings[0].release?.labels?.find(
    (l: { name: string }) => slugify(l.name) === slug
  )
  const labelName = firstLabel?.name || slug.replace(/-/g, ' ')

  const labelInfo = await getDiscogsLabelByName(labelName)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-xs text-gray-500 mb-8">
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <Link href="/shop" className="hover:underline">Shop</Link>
        {' / '}
        <span className="text-black">{labelName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row gap-8 mb-12 pb-8 border-b border-gray-200">
        {labelInfo?.images?.[0]?.uri && (
          <div className="w-32 h-32 relative flex-shrink-0 overflow-hidden bg-gray-100">
            <Image
              src={labelInfo.images[0].uri}
              alt={labelName}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Label</p>
          <h1 className="heading-lg mb-4">{labelName}</h1>
          {labelInfo?.profile && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl line-clamp-5">
              {labelInfo.profile.replace(/\[([^\]]+)\]/g, '$1').replace(/\[url=[^\]]+\]/g, '').replace(/\[\/url\]/g, '')}
            </p>
          )}
          {labelInfo?.urls && labelInfo.urls.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {labelInfo.urls.slice(0, 4).map((url, i) => {
                try {
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                       className="text-xs font-bold uppercase tracking-widest hover:underline">
                      {new URL(url).hostname.replace('www.', '')}
                    </a>
                  )
                } catch { return null }
              })}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
        {labelListings.length} record{labelListings.length !== 1 ? 's' : ''} for sale
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {labelListings.map(({ listing }) => {
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
