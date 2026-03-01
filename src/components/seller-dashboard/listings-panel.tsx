import { Link } from 'react-router-dom'
import { PlusCircle, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ListingCard } from './listing-card'
import { useSellerListings } from '@/hooks/use-seller-dashboard'
import { useUpdateListing } from '@/hooks/use-seller-dashboard'
import { toast } from 'sonner'

export function CreateListingCTA() {
  return (
    <Card className="border-2 border-dashed border-[rgb(var(--border))] bg-transparent transition-all duration-300 hover:border-primary hover:shadow-accent-glow">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
          <PlusCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 font-semibold">Create New Listing</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Start the intake wizard to add a new asset with 15–25 photos
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard/seller/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Listing
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

interface ListingsPanelProps {
  statusFilter?: string
}

export function ListingsPanel({ statusFilter }: ListingsPanelProps) {
  const { data, isLoading, error } = useSellerListings(statusFilter)
  const listings = Array.isArray(data?.data) ? data.data : []
  const updateListing = useUpdateListing()

  const handleCancel = async (id: string) => {
    try {
      await updateListing.mutateAsync({ id, payload: { status: 'rejected' } })
      toast.success('Listing cancelled')
    } catch {
      toast.error('Failed to cancel listing')
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load listings. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Your Listings</h2>
        <Button asChild>
          <Link to="/dashboard/seller/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No listings yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Create your first listing to get started
            </p>
            <Button asChild className="mt-6">
              <Link to="/dashboard/seller/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
