'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TYPES = [
  { value: '', label: 'All' },
  { value: 'tool', label: 'Tools' },
  { value: 'template', label: 'Templates' },
  { value: 'guide', label: 'Guides' },
  { value: 'video', label: 'Videos' },
];

interface ResourceFiltersProps {
  topics: { slug: string; name: string }[];
  activeType?: string;
  activeTopic?: string;
}

export function ResourceFilters({ topics, activeType, activeTopic }: ResourceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Type filters */}
      <div className="flex flex-wrap gap-1.5">
        {TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter('type', value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              (activeType ?? '') === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Topic filter */}
      {topics.length > 0 && (
        <select
          value={activeTopic ?? ''}
          onChange={(e) => setFilter('topic', e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
