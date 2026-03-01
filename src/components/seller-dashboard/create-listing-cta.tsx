/**
 * CreateListingCTA - Prominent CTA to start intake wizard.
 */

import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CreateListingCTA() {
  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5 transition-all duration-300 hover:border-primary/50 hover:shadow-accent-glow">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <PlusCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Create a new listing</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Start the intake wizard to add your asset with 15–25 photos, AI enrichment, and validation.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link to="/dashboard/seller/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Listing
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
