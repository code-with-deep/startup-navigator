import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    readingTime: number | null;
    viewCount: number;
    createdAt: Date | string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    stage: 'idea' | 'early' | 'growth' | 'scale';
    isFeatured: boolean;
    tags: string[];
    topic?: { name: string; color: string; slug: string } | null;
  };
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const difficultyColor = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

const stageLabel = {
  idea: 'Idea Stage',
  early: 'Early Stage',
  growth: 'Growth',
  scale: 'Scaling',
};

export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className={cn(
          'group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors',
          className
        )}
      >
        <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {article.readingTime} min read
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-shadow hover:shadow-md flex flex-col h-full',
        article.isFeatured && 'ring-1 ring-primary/20',
        className
      )}
    >
      <CardHeader className="pb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {article.topic && (
            <Link
              href={`/explore/${article.topic.slug}`}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {article.topic.name}
            </Link>
          )}
          {article.isFeatured && (
            <Badge variant="secondary" className="text-xs ml-auto shrink-0">
              Featured
            </Badge>
          )}
        </div>

        <Link href={`/articles/${article.slug}`} className="block">
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {article.summary}
          </p>
        )}

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
        <span
          className={cn(
            'px-2 py-0.5 rounded-full font-medium capitalize',
            difficultyColor[article.difficulty]
          )}
        >
          {article.difficulty}
        </span>
        <span className="text-muted-foreground/50">·</span>
        <span className="text-muted-foreground/70">{stageLabel[article.stage]}</span>
        <div className="ml-auto flex items-center gap-3">
          {article.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {article.readingTime}m
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {article.viewCount}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
