/**
 * Help / About - Centralized hub for platform info, docs, FAQs, onboarding, support.
 */
import { useState, useMemo } from 'react'
import { Gavel } from 'lucide-react'
import {
  SectionCard,
  DocLinkList,
  FAQAccordion,
  OnboardingGuideCard,
  SupportTicketForm,
  LegalBlockComponent,
  SearchBar,
  FooterNote,
} from '@/components/help'
import { useHelpDocs, useHelpFaqs, useHelpOnboarding } from '@/hooks/use-help'
import { Skeleton } from '@/components/ui/skeleton'
import type { OnboardingGuide } from '@/types/help'

function filterByQuery<T extends { title?: string; question?: string; description?: string; answer?: string }>(
  items: T[],
  query: string
): T[] {
  if (!query.trim()) return items
  const q = query.toLowerCase()
  return items.filter((i) => {
    const title = (i.title ?? '').toLowerCase()
    const question = (i.question ?? '').toLowerCase()
    const desc = (i.description ?? '').toLowerCase()
    const answer = (i.answer ?? '').toLowerCase()
    return title.includes(q) || question.includes(q) || desc.includes(q) || answer.includes(q)
  })
}

export function HelpAboutPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: docs = [], isLoading: docsLoading } = useHelpDocs()
  const { data: faqs = [], isLoading: faqsLoading } = useHelpFaqs()
  const { data: guides = [], isLoading: guidesLoading } = useHelpOnboarding()

  const docsList = Array.isArray(docs) ? docs : []
  const faqsList = Array.isArray(faqs) ? faqs : []
  const guidesList = Array.isArray(guides) ? guides : []

  const filteredDocs = useMemo(() => filterByQuery(docsList, searchQuery), [docsList, searchQuery])
  const filteredFaqs = useMemo(() => filterByQuery(faqsList, searchQuery), [faqsList, searchQuery])

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="container px-4 py-12 md:px-6">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Help & About
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Platform information, documentation, and support for ProBid
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </header>

        <div className="space-y-12">
          {/* Platform Overview */}
          <section id="overview" className="animate-in-up">
            <SectionCard
              title="Platform Overview"
              id="overview"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary">
                  <Gavel className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ProBid is an enterprise-grade real-time B2B auction platform for physical assets.
                    Sellers list assets with AI-validated intake; buyers bid in live auctions with
                    proxy bids and anti-sniping. We handle inspections, payments, and logistics with
                    full audit trails and RBAC.
                  </p>
                </div>
              </div>
            </SectionCard>
          </section>

          {/* Documentation & Guides */}
          <section id="docs" className="animate-in-up" style={{ animationDelay: '0.1s' } as React.CSSProperties}>
            <SectionCard title="Documentation & Guides" id="docs">
              {docsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <DocLinkList items={filteredDocs} />
              )}
            </SectionCard>
          </section>

          {/* FAQs */}
          <section id="faqs" className="animate-in-up" style={{ animationDelay: '0.15s' } as React.CSSProperties}>
            <h2 className="mb-6 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              <SectionCard title="For Sellers" id="faqs-seller">
                {faqsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <FAQAccordion items={filteredFaqs} category="seller" />
                )}
              </SectionCard>
              <SectionCard title="For Buyers" id="faqs-buyer">
                {faqsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <FAQAccordion items={filteredFaqs} category="buyer" />
                )}
              </SectionCard>
            </div>
          </section>

          {/* Onboarding Guides */}
          <section id="onboarding" className="animate-in-up" style={{ animationDelay: '0.2s' } as React.CSSProperties}>
            <h2 className="mb-6 text-2xl font-bold text-foreground">Onboarding Guides</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {guidesLoading ? (
                <>
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </>
              ) : (
                (guidesList ?? []).map((guide: OnboardingGuide) => (
                  <OnboardingGuideCard key={guide.id} guide={guide} />
                ))
              )}
            </div>
          </section>

          {/* Support & Contact */}
          <section id="support" className="animate-in-up" style={{ animationDelay: '0.25s' } as React.CSSProperties}>
            <SectionCard title="Support & Contact" id="support">
              <SupportTicketForm />
            </SectionCard>
          </section>

          {/* About, Privacy, Terms, Certifications */}
          <section id="legal" className="animate-in-up" style={{ animationDelay: '0.3s' } as React.CSSProperties}>
            <h2 className="mb-6 text-2xl font-bold text-foreground">About & Compliance</h2>
            <LegalBlockComponent />
            <FooterNote className="mt-6">
              ProBid is committed to security, privacy, and compliance. For questions about our
              policies or certifications, contact support.
            </FooterNote>
          </section>
        </div>
      </div>
    </div>
  )
}
