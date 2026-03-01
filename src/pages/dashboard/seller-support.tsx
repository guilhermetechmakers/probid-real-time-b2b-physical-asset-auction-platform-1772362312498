import { HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SellerSupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground">
          Get help with listings, auctions, and inspections
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <HelpCircle className="h-16 w-16 text-muted-foreground" />
          <p className="mt-4 font-medium">Support & Help</p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Contact our team for assistance with your listings and auctions.
          </p>
          <Button className="mt-6" asChild>
            <a href="/help">Go to Help Center</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
