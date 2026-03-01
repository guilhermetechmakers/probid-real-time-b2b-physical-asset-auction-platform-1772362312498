import { Link } from 'react-router-dom'
import {
  HeroSection,
  FeatureCardGrid,
  HowItWorks,
  PricingTeaser,
  TrustBadges,
} from '@/components/landing'
import { Button } from '@/components/ui/button'
import { landingContent } from '@/content/landing-content'

export function LandingPage() {
  const hero = landingContent?.hero
  const features = Array.isArray(landingContent?.features)
    ? landingContent.features
    : []
  const steps = Array.isArray(landingContent?.howItWorks)
    ? landingContent.howItWorks
    : []
  const tiers = Array.isArray(landingContent?.pricingTeaser)
    ? landingContent.pricingTeaser
    : []
  const trustLogos = Array.isArray(landingContent?.trustLogos)
    ? landingContent.trustLogos
    : []

  return (
    <main className="min-h-screen" role="main">
      {hero ? (
        <HeroSection
          title={hero.title}
          subtitle={hero.subtitle}
          ctaPrimary={hero.ctaPrimary}
          ctaSecondary={hero.ctaSecondary}
          media={hero.media}
        />
      ) : (
        <section className="container px-5 py-24 md:px-6">
          <p className="text-center text-[#7E7E7E]">Hero content unavailable.</p>
        </section>
      )}

      <FeatureCardGrid features={features} />
      <HowItWorks steps={steps} />
      <PricingTeaser tiers={tiers} />
      <TrustBadges logos={trustLogos} />

      {/* Final CTA */}
      <section
        className="container px-5 py-20 md:px-6"
        aria-labelledby="cta-heading"
      >
        <div className="rounded-2xl border border-[#E5E5EA] bg-gradient-to-r from-[#EFFD2D]/20 to-[#FFFACD]/20 p-12 text-center shadow-[0_2px_8px_rgba(22,22,22,0.07)]">
          <h2 id="cta-heading" className="text-2xl font-bold text-[#181818] md:text-3xl">
            Ready to list or bid?
          </h2>
          <p className="mt-4 text-[#7E7E7E]">
            Join ProBid and start trading physical assets with confidence.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-[#EFFD2D] text-[#161616] hover:bg-[#EFFD2D]/90 hover:shadow-[0_0_24px_rgba(239,253,45,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-2 border-[#E5E5EA] hover:border-[#EFFD2D] hover:shadow-[0_0_16px_rgba(239,253,45,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Link to="/learn-more">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
