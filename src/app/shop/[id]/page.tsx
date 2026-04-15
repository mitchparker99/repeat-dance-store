import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getListing, getRelease, cleanArtistName } from '@/lib/discogs'
import { formatPrice } from '@/lib/stripe'
import { AddToCartButton } from './AddToCartButton'

interface RecordPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: RecordPageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const listing = await getListing(id)
    const artist = cleanArtistName(listing.release.description?.split(' – ')[0] || 'Unknown')
    const parts = listing.release.description?.split(' – ') || []
    const title = parts.length > 1 ? parts.slice(1).join(' – ') : 'Unknown Title'
    return {
      title: `${artist} – ${title}`,
      description: `Buy ${artist} – ${title} on vinyl. Condition: ${listing.condition}. Ships from Tokyo, Japan.`,
    }
  } catch {
    return { title: 'Record Not Found' }
  }
}

const CONDITION_LABELS: Record<string, { full: string; desc: string }> = {
  'Mint (M)': { full: 'Mint (M)', desc: 'Absolutely perfect in every way.' },
  'Near Mint (NM or M-)': { full: 'Near Mint (NM)', desc: 'Nearly perfect, played very few times.' },
  'Very Good Plus (VG+)': { full: 'Very Good Plus (VG+)', desc: 'Shows some signs of play but plays perfectly.' },
  'Very Good (VG)': { full: 'Very Good (VG)', desc: 'Some light scratches but plays without skipping.' },
  'Good Plus (G+)': { full: 'Good Plus (G+)', desc: 'Plays through with some noise and light distortion.' },
  'Good (G)': { full: 'Good (G)', desc: 'Plays through but with significant noise.' },
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { id } = await params

  let listing: Awaited<ReturnType<typeof getListing>>
  let release: Awaited<ReturnType<typeof getRelease>> | null = null

  try {
    listing = await getListing(id)
  } catch {
    notFound()
  }

  if (listing.status !== 'For Sale') {
    notFound()
  }

  try {
    release = await getRelease(listing.release.id.toString())
  } catch {
    // Release details are optional — listing is enough
  }

  const descParts = listing.release.description?.split(' – ') || []
  const artist = cleanArtistName(
    release?.artists?.[0]?.name || descParts[0] || 'Unknown Artist'
  )
  const title =
    release?.title ||
    (descParts.length > 1 ? descParts.slice(1).join(' – ') : 'Unknown Title')

  const images = release?.images || (listing.release.thumbnail ? [{
    uri: listing.release.thumbnail,
    type: 'primary' as const,
    uri150: listing.release.thumbnail,
    resource_url: listing.release.thumbnail,
    width: 150,
    height: 150,
  }] : [])

  const primaryImage = images.find((img) => img.type === 'primary') || images[0]
  const genres = release?.genres || []
  const styles = release?.styles || []
  const labels = release?.labels || []
  const primaryLabel = labels[0]
  const year = release?.year || listing.release.year
  const tracklist = release?.tracklist || []

  const conditionInfo = CONDITION_LABELS[listing.condition] || {
    full: listing.condition,
    desc: '',
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-8">
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <Link href="/shop" className="hover:underline">Shop</Link>
        {' / '}
        <span className="text-black">{artist}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* ── Left: Image ──────────────────────────────────────────────── */}
        <div>
          <div className="aspect-square relative border border-black bg-gray-100">
            {primaryImage ? (
              <Image
                src={primaryImage.uri}
                alt={`${artist} – ${title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="w-24 h-24 text-gray-300" fill="currentColor">
                  <circle cx="40" cy="40" r="32" />
                  <circle cx="40" cy="40" r="8" fill="white" />
                  <circle cx="40" cy="40" r="3" fill="#aaa" />
                </svg>
              </div>
            )}
          </div>

          {/* Secondary images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square relative border border-black bg-gray-100">
                  <Image src={img.uri} alt={`${title} image ${i + 2}`} fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ───────────────────────────────────────────── */}
        <div className="flex flex-col">
          {/* Title */}
          <div className="border-b border-black pb-6 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
              {artist}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-2">{title}</h1>
            <div className="flex flex-wrap gap-2 text-xs">
              {year && <span className="font-medium">{year}</span>}
              {primaryLabel && (
                <span className="text-gray-500">
                  {primaryLabel.name}
                  {primaryLabel.catno && primaryLabel.catno !== 'none' ? ` · ${primaryLabel.catno}` : ''}
                </span>
              )}
              {genres.map((g) => (
                <span key={g} className="border border-black px-2 py-0.5">{g}</span>
              ))}
              {styles.slice(0, 3).map((s) => (
                <span key={s} className="border border-gray-300 px-2 py-0.5 text-gray-600">{s}</span>
              ))}
            </div>
          </div>

          {/* Price & Condition */}
          <div className="border-b border-black pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black">{formatPrice(listing.price.value)}</span>
              <span className="text-xs text-gray-500">¥ JPY</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Media</p>
                <p className="text-sm font-bold">{conditionInfo.full}</p>
                {conditionInfo.desc && (
                  <p className="text-xs text-gray-500 mt-0.5">{conditionInfo.desc}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Sleeve</p>
                <p className="text-sm font-bold">{listing.sleeve_condition || 'Not graded'}</p>
              </div>
            </div>

            {listing.comments && (
              <div className="border border-gray-200 p-3 text-xs text-gray-600 leading-relaxed">
                {listing.comments}
              </div>
            )}
          </div>

          {/* Add to Cart */}
          <AddToCartButton
            listingId={id}
            releaseId={listing.release.id.toString()}
            title={title}
            artist={artist}
            price={listing.price.value}
            condition={listing.condition}
            sleeveCondition={listing.sleeve_condition}
            imageUrl={primaryImage?.uri || '/placeholder-record.svg'}
            format={listing.release.format || 'LP'}
            year={year}
            label={primaryLabel?.name}
            catno={primaryLabel?.catno}
          />

          {/* Shipping note */}
          <div className="mt-4 p-4 border border-black bg-gray-50 text-xs text-gray-600">
            <p className="font-bold uppercase tracking-widest mb-1">Shipping from Tokyo, Japan</p>
            <p>Sent via Japan Post EMS — tracked, insured, worldwide delivery.</p>
            <p className="mt-1">Shipping cost calculated at checkout based on your location.</p>
          </div>

          {/* Format */}
          {release?.formats && release.formats.length > 0 && (
            <div className="mt-4 text-xs text-gray-500">
              <span className="font-bold uppercase tracking-widest">Format: </span>
              {release.formats.map((f) => [f.name, ...(f.descriptions || [])].join(', ')).join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* ── Tracklist ─────────────────────────────────────────────────────── */}
      {tracklist.length > 0 && (
        <div className="mt-12 border-t border-black pt-8">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4">Tracklist</h2>
          <div className="divide-y divide-gray-200">
            {tracklist.map((track, i) => (
              <div key={i} className="flex items-center gap-4 py-2 text-sm">
                <span className="text-gray-400 w-8 text-right flex-shrink-0">
                  {track.position}
                </span>
                <span className="flex-1">{track.title}</span>
                {track.duration && (
                  <span className="text-gray-400 text-xs">{track.duration}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
