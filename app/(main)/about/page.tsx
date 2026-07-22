import Link from 'next/link';
import { ArrowRight, BookOpen, Bot, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Startup Navigator — the AI-powered knowledge platform for founders.',
  openGraph: { title: 'About | Startup Navigator', description: 'Learn about Startup Navigator — the AI-powered knowledge platform for founders.' },
  twitter: { card: 'summary_large_image' },
};

const features = [
  {
    icon: BookOpen,
    title: 'Expert Knowledge Base',
    description:
      'Curated guides written by experienced founders and startup ecosystem professionals, covering every stage of the journey.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Search',
    description:
      'Ask questions in plain English. Our RAG pipeline retrieves the most relevant content from the knowledge base and synthesizes an answer with citations.',
  },
  {
    icon: Shield,
    title: 'Trusted & Up-to-Date',
    description:
      'All content is reviewed and updated regularly. We clearly distinguish between legal information and legal advice.',
  },
  {
    icon: Zap,
    title: 'Built for Speed',
    description:
      'Server-side rendering, edge caching, and semantic search ensure you get answers fast — no matter where you are.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">About Startup Navigator</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We built Startup Navigator because navigating the early stages of a startup is genuinely
          hard. Legal jargon, conflicting advice, expensive consultants — founders deserve better.
        </p>
      </div>

      <section className="rounded-2xl bg-primary/5 border border-primary/20 p-8 mb-16 text-center">
        <h2 className="text-xl font-bold mb-3">Our Mission</h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          To democratize startup knowledge — making it as easy as having a smart friend who happens
          to know everything about company registration, fundraising, employment law, and scaling.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">What makes us different</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 p-5 rounded-xl border border-border">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Built with</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'Next.js 16',
            'TypeScript',
            'Tailwind CSS v4',
            'Drizzle ORM',
            'PostgreSQL + pgvector',
            'OpenAI GPT-4o',
            'text-embedding-3-small',
            'JWT Auth',
            'Supabase',
            'Vercel',
          ].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to navigate?</h2>
        <p className="text-muted-foreground mb-6">
          Start exploring our knowledge base or ask the AI your first question.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button render={<Link href="/explore" />} className="gap-2">
            Explore Topics <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" render={<Link href="/ai-search" />}>
            Try AI Search
          </Button>
        </div>
      </div>
    </div>
  );
}
