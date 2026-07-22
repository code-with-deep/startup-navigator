import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TopicIcon } from './TopicIcon';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: {
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    articleCount?: number;
  };
  className?: string;
}

export function TopicCard({ topic, className }: TopicCardProps) {
  return (
    <Link
      href={`/explore/${topic.slug}`}
      className={cn(
        'group flex flex-col gap-4 p-5 rounded-xl border border-border bg-card',
        'hover:shadow-md hover:border-primary/30 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <TopicIcon
          icon={topic.icon ?? 'Bot'}
          color={topic.color ?? 'blue'}
          size="md"
        />
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      <div>
        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
          {topic.name}
        </h3>
        {topic.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {topic.description}
          </p>
        )}
      </div>

      {topic.articleCount !== undefined && (
        <div className="text-xs text-muted-foreground mt-auto">
          {topic.articleCount} {topic.articleCount === 1 ? 'article' : 'articles'}
        </div>
      )}
    </Link>
  );
}
