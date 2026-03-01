import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { HeroContent } from '@/content/landing-content'

export interface HeroSectionProps {
  title: string
  subtitle: string
  ctaPrimary: HeroContent['ctaPrimary']
  ctaSecondary: HeroContent['ctaSecondary']
  media?: string
}

export function HeroSection({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  media,
}: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#F5F6FA] to-[#FFFFFF]"
      aria-labelledby="hero-heading"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(239,253,45,0.2)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(239,253,45,0.1)_0%,_transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,250,205,0.15)_0%,_transparent_70%)]" />

      <div className="container relative px-5 py-24 md:px-6 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            id="hero-heading"
            className="text-4xl font-bold tracking-tight text-[#181818] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {(() => {
              const words = (title ?? '').split(' ')
              const highlightWords = words.slice(-2).join(' ')
              const prefix = words.slice(0, -2).join(' ')
              return prefix ? (
                <>
                  {prefix}{' '}
                  <span className="bg-gradient-to-r from-[#EFFD2D] to-[#FFFACD] bg-clip-text text-transparent">
                    {highlightWords}
                  </span>
                </>
              ) : (
                <span className="bg-gradient-to-r from-[#EFFD2D] to-[#FFFACD] bg-clip-text text-transparent">
                  {title}
                </span>
              )
            })()}
          </h1>
          <p className="mt-6 text-lg text-[#7E7E7E] md:text-xl" style={{ lineHeight: 1.6 }}>
            {subtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-[#EFFD2D] text-[#161616] hover:bg-[#EFFD2D]/90 hover:shadow-[0_0_24px_rgba(239,253,45,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              aria-label={ctaPrimary.label}
            >
              <Link to={ctaPrimary.href}>{ctaPrimary.label}</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-2 border-[#E5E5EA] hover:border-[#EFFD2D] hover:shadow-[0_0_16px_rgba(239,253,45,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              aria-label={ctaSecondary.label}
            >
              <Link to={ctaSecondary.href}>{ctaSecondary.label}</Link>
            </Button>
          </div>
          {media ? (
            <div className="mt-16 rounded-2xl border border-[#E5E5EA] shadow-[0_2px_8px_rgba(22,22,22,0.07)] overflow-hidden">
              <img
                src={media}
                alt="ProBid platform overview"
                className="w-full h-auto object-cover"
              />
            </div>
          ) : (
            <div
              className="mt-16 flex aspect-video w-full items-center justify-center rounded-2xl border border-[#E5E5EA] bg-[#F5F6FA] shadow-[0_2px_8px_rgba(22,22,22,0.07)]"
              aria-hidden
            >
              <span className="text-sm text-[#7E7E7E]">Platform preview</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
