import { useParams, Link } from 'react-router-dom'
import { Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ListingDetailPage() {
  const { id } = useParams()

  return (
    <div className="container space-y-8 px-4 py-8 md:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video rounded-2xl bg-secondary flex items-center justify-center">
            <Gavel className="h-24 w-24 text-muted-foreground" />
          </div>
          <div className="mt-6">
            <h1 className="text-2xl font-bold">Listing {id ?? 'N/A'}</h1>
            <p className="mt-2 text-muted-foreground">
              Full listing details and auction info will appear here.
            </p>
          </div>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold">Auction Summary</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current bid</span>
                  <span className="font-bold">$0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ends</span>
                  <span>—</span>
                </div>
              </div>
              <Button className="mt-6 w-full" asChild>
                <Link to="/login">Log in to bid</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
