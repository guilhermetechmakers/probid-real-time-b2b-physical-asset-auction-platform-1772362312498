/**
 * Marketplace / Listing Browse types.
 * All types support runtime safety with optional fields and array guards.
 */

export type MarketplaceListingStatus = 'live' | 'pending' | 'closed' | 'scheduled' | 'sold' | 'unsold'

export interface MarketplaceListing {
  id: string
  title: string
  identifier?: string
  category?: string
  condition?: string
  make?: string
  model?: string
  year?: number
  price?: number
  reservePrice?: number
  startingPrice?: number
  currentBid?: number
  auctionStart?: string
  auctionEnd?: string
  thumbnailUrl?: string
  imageUrls: string[]
  location?: string
  geolocation?: { lat: number; lon: number } | null
  status: MarketplaceListingStatus
  gated?: boolean
  createdAt: string
  auction?: {
    listingId: string
    currentBid?: number
    bidCount?: number
    remainingTime?: number
    status: 'active' | 'ended' | 'scheduled' | 'cancelled'
  }
}

export interface ListingFilters {
  q?: string
  category?: string
  condition?: string
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  auctionDateStart?: string
  auctionDateEnd?: string
  location?: string
  status?: MarketplaceListingStatus | MarketplaceListingStatus[]
}

export type ListingSortOption =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'remaining_time'
  | 'relevance'

export interface ListingsResponse {
  data: MarketplaceListing[]
  total: number
}

export interface SuggestResult {
  id: string
  type: 'keyword' | 'identifier' | 'location'
  text: string
  listingId?: string
}
