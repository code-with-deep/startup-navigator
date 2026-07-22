'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

const SUGGESTED_QUERIES = [
  'How do I register an LLC?',
  'What is a SAFE agreement?',
  'How to find angel investors?',
  'When do I need to pay estimated taxes?',
  'How to hire your first employee?',
  'What equity should I give to co-founders?',
];

export function SearchInput({
  onSearch,
  isLoading,
  defaultValue = '',
  placeholder = 'Ask anything about startups…',
  className,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const q = value.trim();
    if (!q || q.length < 3 || isLoading) return;
    onSearch(q);
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSuggestion(q: string) {
    setValue(q);
    onSearch(q);
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Input box */}
      <div className="relative flex items-end gap-2 rounded-xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
        <Search className="absolute left-4 top-3.5 size-5 text-muted-foreground shrink-0 pointer-events-none" />
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={2}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent pl-12 pr-4 pt-3 pb-3 text-base focus:outline-none disabled:opacity-60 min-h-[52px] max-h-40"
        />
        <div className="flex items-center gap-2 p-2 shrink-0">
          {value && !isLoading && (
            <button
              onClick={() => setValue('')}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || value.trim().length < 3 || isLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="size-4 animate-spin" /> Searching…</>
            ) : (
              <>Ask AI</>
            )}
          </button>
        </div>
      </div>

      {/* Suggested queries (only shown when empty and not loading) */}
      {!value && !isLoading && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSuggestion(q)}
              className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
