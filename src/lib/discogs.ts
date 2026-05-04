import type {
  DiscogsInventoryResponse,
  DiscogsRelease,
  DiscogsListing,
} from '@/types'

const DISCOGS_BASE = 'https://api.discogs.com'
const USER_AGENT = 'RepeatDanceRecordStore/1.0 +https://repeatdance.com'

function getHeaders(): HeadersInit {
  const token = process.env.DISCOGS_TOKEN
  if (!token) throw new Error('DISCOGS_TOKEN environment variable is not set')
  return {
    Authorization: `Discogs token=${token}`,
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.discogs.v2.plaintext+json',
  }
}

function getUsername(): string {
  const username = process.env.DISCOGS_USERNAME
  if (!username) throw new Error('DISCOGS_USERNAME environment variable is not set')
  return username
}

async function discogsRequest<T>(
  path: string,
  params?: Record<string, string>,
  revalidate = 300
): Promise<T> {
  const url = new URL(`${DISCOGS_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    headers: getHeaders(),
    next: { revalidate },
  })

  if (res.status === 429) {
    throw new Error('Discogs rate limit exceeded. Please try again in a moment.')
  }

  if (!res.ok) {
    throw new Error(`Discogs API error ${res.status}: ${await res.text()}`)
  }

  return res.json() as Promise<T>
}

export interface InventoryOptions {
  page?: number
  perPage?: number
  sort?: 'listed' | 'price' | 'item' | 'artist' | 'label' | 'catno' | 'audio' | 'status' | 'location'
  sortOrder?: 'asc' | 'desc'
}

export async function getInventory(
  options: InventoryOptions = {}
): Promise<DiscogsInventoryResponse> {
  const { page = 1, perPage = 50, sort = 'listed', sortOrder = 'desc' } = options
  const username = getUsername()

  return discogsRequest<DiscogsInventoryResponse>(
    `/users/${username}/inventory`,
    {
      page: page.toString(),
      per_page: perPage.toString(),
      sort,
      sort_order: sortOrder,
      status: 'For Sale',
    },
    180 // 3 minute cache for inventory
  )
}

export async function getRelease(releaseId: string): Promise<DiscogsRelease> {
  return discogsRequest<DiscogsRelease>(`/releases/${releaseId}`, {}, 3600)
}

export async function getListing(listingId: string): Promise<DiscogsListing> {
  return discogsRequest<DiscogsListing>(
    `/marketplace/listings/${listingId}`,
    {},
    60 // 1 minute cache — listings can sell
  )
}

export async function markListingAsSold(listingId: string): Promise<void> {
  const token = process.env.DISCOGS_TOKEN
  if (!token) throw new Error('DISCOGS_TOKEN is not set')

  const res = await fetch(`${DISCOGS_BASE}/marketplace/listings/${listingId}`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'Sold' }),
  })

  if (!res.ok) {
    console.error(`Failed to mark listing ${listingId} as sold:`, await res.text())
  }
}

// Extract the primary image URL from a listing
export function getListingImageUrl(listing: DiscogsListing): string {
  if (listing.release.images && listing.release.images.length > 0) {
    const primary = listing.release.images.find((img) => img.type === 'primary')
    return primary?.uri || listing.release.images[0].uri
  }
  return listing.release.thumbnail || '/placeholder-record.svg'
}

// Parse artist name (Discogs sometimes appends " (N)" for disambiguation)
export function cleanArtistName(name: string): string {
  return name.replace(/\s*\(\d+\)$/, '')
}

// Fetch all inventory across pages (for filtering)
export async function getAllInventory(maxItems = 200): Promise<DiscogsListing[]> {
  const username = getUsername()
  const perPage = 100
  const allListings: DiscogsListing[] = []
  let page = 1

  while (allListings.length < maxItems) {
    const data = await discogsRequest<DiscogsInventoryResponse>(
      `/users/${username}/inventory`,
      {
        page: page.toString(),
        per_page: perPage.toString(),
        sort: 'listed',
        sort_order: 'desc',
        status: 'For Sale',
      },
      180
    )
    allListings.push(...(data.listings || []))
    if (!data.pagination || page >= data.pagination.pages) break
    page++
  }

  return allListings.slice(0, maxItems)
}

// Search Discogs for an artist by name and return their profile
export async function getDiscogsArtistByName(name: string): Promise<{
  id: number
  name: string
  profile: string
  images?: Array<{ uri: string; type: string; uri150: string }>
  urls?: string[]
} | null> {
  try {
    const searchRes = await discogsRequest<{
      results: Array<{ id: number; title: string; type: string }>
    }>('/database/search', { q: name, type: 'artist', per_page: '5' }, 86400)

    if (!searchRes.results?.length) return null

    const match =
      searchRes.results.find(
        (r) => r.title.toLowerCase() === name.toLowerCase()
      ) || searchRes.results[0]

    return discogsRequest<{
      id: number
      name: string
      profile: string
      images?: Array<{ uri: string; type: string; uri150: string }>
      urls?: string[]
    }>(`/artists/${match.id}`, {}, 86400)
  } catch {
    return null
  }
}

// Search Discogs for a label by name and return its profile
export async function getDiscogsLabelByName(name: string): Promise<{
  id: number
  name: string
  profile: string
  images?: Array<{ uri: string; type: string; uri150: string }>
  urls?: string[]
} | null> {
  try {
    const searchRes = await discogsRequest<{
      results: Array<{ id: number; title: string; type: string }>
    }>('/database/search', { q: name, type: 'label', per_page: '5' }, 86400)

    if (!searchRes.results?.length) return null

    const match =
      searchRes.results.find(
        (r) => r.title.toLowerCase() === name.toLowerCase()
      ) || searchRes.results[0]

    return discogsRequest<{
      id: number
      name: string
      profile: string
      images?: Array<{ uri: string; type: string; uri150: string }>
      urls?: string[]
    }>(`/labels/${match.id}`, {}, 86400)
  } catch {
    return null
  }
}
