import { Link, useSearchParams } from 'react-router-dom'
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const isBuyer = searchParams.get('kyc') === 'true'

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12 sm:px-6">
      <Card className="w-full max-w-md transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Verify your email
          </CardTitle>
          <CardDescription className="mt-2">
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="flex flex-col items-center gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-6"
            role="region"
            aria-label="Email verification instructions"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-foreground">
                Check your inbox
              </p>
              <p className="text-sm text-muted-foreground">
                Click the verification link in the email we sent you. The link
                may take a few minutes to arrive.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <Link
                  to="/auth"
                  className="text-primary hover:underline"
                >
                  try again
                </Link>
                .
              </p>
            </div>
          </div>

          {isBuyer && (
            <div
              className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-4"
              role="region"
              aria-label="Buyer verification information"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Next: KYC verification
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    After verifying your email, you&apos;ll be guided through
                    identity verification to start bidding.
                  </p>
                  <Link
                    to="/how-it-works"
                    className={cn(
                      'mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'
                    )}
                  >
                    Learn about verification
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/auth?mode=login">Back to login</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
