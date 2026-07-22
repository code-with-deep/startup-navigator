import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="size-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
            SN
          </span>
          {siteConfig.name}
        </Link>

        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg leading-relaxed text-primary-foreground/90">
              &ldquo;Startup Navigator helped me understand what I actually needed to do to register
              my company. Saved me weeks of confusion and lawyer fees.&rdquo;
            </p>
            <footer className="text-sm text-primary-foreground/70">
              — Priya K., Founder @ BuildFast
            </footer>
          </blockquote>
        </div>

        <div className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} {siteConfig.name}. Built for founders.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <span className="size-8 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                SN
              </span>
              {siteConfig.name}
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
