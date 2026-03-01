import { Link } from 'react-router-dom'
import { Search, Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function MarketplacePage() {
  return (
    <div className="container space-y-8 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover physical assets available for auction
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by identifier, title..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
            <CardContent className="p-0">
              <div className="flex h-48 items-center justify-center bg-secondary">
                <Gavel className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">Sample Listing {i}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Identifier: PLACEHOLDER-{i}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold">$0</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/listing/${i}`}>View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          More listings coming soon. Create an account to list or bid.
        </p>
        <Button asChild className="mt-4">
          <Link to="/auth?mode=signup">Get Started</Link>
        </Button>
      </div>
    </div>
  )
}
