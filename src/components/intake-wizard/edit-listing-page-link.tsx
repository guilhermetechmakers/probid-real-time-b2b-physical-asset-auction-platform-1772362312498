/**
 * EditListingPageLink - Navigate to Edit / Manage Listing page.
 */

import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditListingPageLinkProps {
  listingId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  children?: React.ReactNode
}

export function EditListingPageLink({
  listingId,
  variant = 'outline',
  size = 'default',
  children,
}: EditListingPageLinkProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <Link to={`/dashboard/seller/listings/${listingId}/edit`}>
        {children ?? (
          <>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Listing
          </>
        )}
      </Link>
    </Button>
  )
}
