import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';

const footerLinks = {
  Explore: [
    { label: 'All Topics', href: '/explore' },
    { label: 'AI Search', href: '/ai-search' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
  ],
  Topics: [
    { label: 'Company Registration', href: '/explore/company-registration' },
    { label: 'Funding & Investment', href: '/explore/funding' },
    { label: 'Legal & Compliance', href: '/explore/legal' },
    { label: 'Hiring & HR', href: '/explore/hiring' },
  ],
  Account: [
    { label: 'Sign In', href: '/sign-in' },
    { label: 'Create Account', href: '/sign-up' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-24">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-base mb-3">
              <span className="size-7 rounded-md bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                SN
              </span>
              Startup Navigator
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              AI-powered knowledge platform helping founders navigate the startup journey.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X / Twitter"
              >
                X <ExternalLink className="size-3" />
              </a>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                GitHub <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold mb-3">{heading}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Startup Navigator. Built for founders.</p>
          <div className="flex items-center gap-4">
            <span>Next.js · Drizzle · OpenAI · pgvector</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
