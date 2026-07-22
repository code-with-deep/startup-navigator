import type { Metadata } from 'next';
import { AISearchClient } from './AISearchClient';

export const metadata: Metadata = {
  title: 'AI Search',
  description:
    'Ask any startup question and get instant, cited answers from our knowledge base.',
};

export default function AISearchPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          AI Search
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Ask anything about starting, funding, or scaling your company. Our AI searches
          the entire knowledge base and gives you a cited answer.
        </p>
      </div>

      <AISearchClient />
    </div>
  );
}
