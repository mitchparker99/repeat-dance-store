import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RecordCard } from '@/components/RecordCard'
import { getAllInventory, getListingImageUrl, cleanArtistName, getDiscogsArtistByName } from '@/lib/discogs'
import { slugify } from '@/lib/utils'

export const revalidate = 300

interface ArtistPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ')
  return { title: `${name} — Repeat Dance` }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params

  const allListings = await getAllInventory()

  const artistListings = allListings.filter((listing) => {
    const artist = cleanArtistName(
      listing.release.artist || listing.release.description?.split(' – ')[0] || ''
    )
    return slugify(artist) === slug
  })

  if (artistListings.length === 0) notFound()

  const artistName = cleanArtistName(
    artistListings[0].release.artist ||
      artistListings[0].release.description?.split(' – ')[0] ||
      slug
  )

  const artistInfo = await getDiscogsArtistByName(artistName)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-xs text-gray-500 mb-8">
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <Link href="/shop" className="hover:underline">Shop</Link>
        {' / '}
        <span className="text-black">{artistName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row gap-8 mb-12 pb-8 border-b border-gray-200">
        {artistInfo?.images?.[0]?.uri && (
          <div className="w-32 h-32 relative flex-shrink-0 overflow-hidden bg-gray-100">
            <Image
              src={artistInfo.images[0].uri}
              alt={artistName}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="heading-lg mb-4">{artistName}</h1>
          {artistInfo?.profile && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl line-clamp-5">
              {artistInfo.profile.replace(/\[([^\]]+)\]/g, '$1').replace(/\[url=[^\]]+\]/g, '').replace(/\[\/url\]/g, '')}
            </p>
          )}
          {artistInfo?.urls && artistInfo.urls.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {artistInfo.urls.slice(0, 4).map((url, i) => {
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
        {artistListings.length} record{artistListings.length !== 1 ? 's' : ''} for sale
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {artistListings.map((listing) => {
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
