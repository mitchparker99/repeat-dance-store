// ─── Discogs Types ────────────────────────────────────────────────────────────

export interface DiscogsListing {
  id: number
  status: string
  price: {
    value: number
    currency: string
  }
  condition: string
  sleeve_condition: string
  comments: string
  ships_from: string
  posted: string
  allow_offers: boolean
  release: {
    id: number
    description: string
    title: string
    year: number
    resource_url: string
    thumbnail: string
    images?: DiscogsImage[]
    artist: string
    format: string
    catalog_number: string
    stats: {
      community: {
        in_wantlist: number
        in_collection: number
      }
    }
  }
  seller: {
    id: number
    username: string
    resource_url: string
  }
}

export interface DiscogsInventoryResponse {
  listings: DiscogsListing[]
  pagination: DiscogsPagination
}

export interface DiscogsRelease {
  id: number
  title: string
  year: number
  country: string
  notes: string
  released: string
  released_formatted: string
  genres: string[]
  styles: string[]
  labels: DiscogsLabel[]
  artists: DiscogsArtist[]
  formats: DiscogsFormat[]
  tracklist: DiscogsTrack[]
  images: DiscogsImage[]
  community: {
    rating: {
      count: number
      average: number
    }
    have: number
    want: number
  }
  lowest_price?: number
  num_for_sale?: number
}

export interface DiscogsImage {
  type: 'primary' | 'secondary'
  uri: string
  resource_url: string
  uri150: string
  width: number
  height: number
}

export interface DiscogsLabel {
  id: number
  name: string
  catno: string
  resource_url: string
  entity_type_name: string
}

export interface DiscogsArtist {
  id: number
  name: string
  anv: string
  join: string
  role: string
  resource_url: string
}

export interface DiscogsFormat {
  name: string
  qty: string
  descriptions: string[]
  text?: string
}

export interface DiscogsTrack {
  position: string
  type_: string
  title: string
  duration: string
  artists?: DiscogsArtist[]
}

export interface DiscogsPagination {
  page: number
  pages: number
  items: number
  per_page: number
  urls: {
    first?: string
    prev?: string
    next?: string
    last?: string
  }
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartItem {
  listingId: string
  releaseId: string
  title: string
  artist: string
  price: number
  currency: string
  condition: string
  sleeveCondition: string
  imageUrl: string
  format: string
  year?: number
  label?: string
  catno?: string
}

// ─── Order Types ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
  country_name: string
  phone?: string
}

export interface OrderItem {
  listingId: string
  releaseId: string
  title: string
  artist: string
  price: number
  condition: string
  sleeveCondition: string
  imageUrl: string
  format: string
}

export interface Order {
  id: string
  created_at: string
  updated_at: string
  customer_email: string
  customer_name: string
  shipping_address: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shipping_cost: number
  total: number
  stripe_session_id?: string
  stripe_payment_intent_id?: string
  status: OrderStatus
  tracking_number?: string
  carrier?: string
  notes?: string
}

// ─── Shipping Types ───────────────────────────────────────────────────────────

export type ShippingZone = 1 | 2 | 3 | 4

export interface ShippingRate {
  zone: ShippingZone
  weightGrams: number
  priceJpy: number
  estimatedDays: string
  service: string
}

export interface ShippingQuote {
  cost: number
  currency: 'JPY'
  service: string
  estimatedDays: string
  zone: ShippingZone
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface AdminUser {
  username: string
}

export interface OrderFilters {
  status?: OrderStatus
  search?: string
  page?: number
  perPage?: number
}
