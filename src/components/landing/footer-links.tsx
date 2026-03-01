import { Link } from 'react-router-dom'
import type { FooterSection } from '@/content/landing-content'

export interface FooterLinksProps {
  sections: FooterSection[]
}

export function FooterLinks({ sections }: FooterLinksProps) {
  const items = Array.isArray(sections) ? sections : []

  if (items.length === 0) {
    return null
  }

  return (
    <div className="grid gap-8 md:col-span-3 md:grid-cols-3">
      {items.map((section) => (
        <div key={section.title}>
          <h4 className="mb-4 text-sm font-semibold text-[#181818]">
            {section.title}
          </h4>
          <ul className="space-y-2 text-sm text-[#7E7E7E]">
            {(section.links ?? []).map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="transition-colors hover:text-[#181818] focus:outline-none focus:ring-2 focus:ring-[#EFFD2D] focus:ring-offset-2 rounded"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
