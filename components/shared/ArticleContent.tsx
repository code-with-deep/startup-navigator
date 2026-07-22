'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ArticleContentProps {
  content: string;
  className?: string;
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  return (
    <div className={cn('article-content prose prose-slate dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-7 mb-3 border-b border-border pb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-5 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-base leading-relaxed mb-4 text-foreground/90">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed text-foreground/90">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          },
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-border my-8" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
