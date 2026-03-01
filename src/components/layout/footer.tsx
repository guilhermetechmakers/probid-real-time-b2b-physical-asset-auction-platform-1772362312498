import { Link } from 'react-router-dom'
import { Gavel } from 'lucide-react'
import { FooterLinks } from '@/components/landing'
import { landingContent } from '@/content/landing-content'

export function Footer() {
  const sections = Array.isArray(landingContent?.footerSections)
    ? landingContent.footerSections
    : []

  return (
    <footer className="border-t border-[#E5E5EA] bg-[#F5F6FA]/50">
      <div className="container px-5 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFFD2D]">
                <Gavel className="h-4 w-4 text-[#161616]" />
              </div>
              <span className="font-bold text-[#181818]">ProBid</span>
            </Link>
            <p className="text-sm text-[#7E7E7E]">
              Enterprise-grade real-time B2B auction platform for physical assets.
            </p>
          </div>
          {sections.length > 0 ? (
            <FooterLinks sections={sections} />
          ) : (
            <>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-[#181818]">Product</h4>
                <ul className="space-y-2 text-sm text-[#7E7E7E]">
                  <li>
                    <Link to="/marketplace" className="hover:text-foreground">
                      Marketplace
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="hover:text-foreground">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="hover:text-foreground">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-[#181818]">Company</h4>
                <ul className="space-y-2 text-sm text-[#7E7E7E]">
                  <li>
                    <Link to="/about" className="hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="hover:text-foreground">
                      Help & Support
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-[#181818]">Legal</h4>
                <ul className="space-y-2 text-sm text-[#7E7E7E]">
                  <li>
                    <Link to="/privacy" className="hover:text-foreground">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="hover:text-foreground">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="hover:text-foreground">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
        <div className="mt-8 border-t border-[#E5E5EA] pt-8 text-center text-sm text-[#7E7E7E]">
          © {new Date().getFullYear()} ProBid. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
