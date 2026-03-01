/**
 * PhotoAngleGuideLinkCard - Link to Photo Angle Guide (PDF/image assets).
 */

import { FileText, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PhotoAngleGuideLinkCard() {
  return (
    <Card className="border-[rgb(var(--border))] rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">Photo Angle Guide</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Download our guide for required photo angles (Front, Side, Back, Top, etc.).
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
              asChild
            >
              <a href="/assets/photo-angle-guide.pdf" download aria-label="Download Photo Angle Guide">
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
