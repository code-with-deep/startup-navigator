import { ExternalLink, Wrench, FileText, BookOpen, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string | null;
    url: string;
    type: 'tool' | 'template' | 'guide' | 'video';
    tags: string[];
    isFeatured: boolean;
    topic?: { name: string; slug: string } | null;
  };
  className?: string;
}

const typeConfig = {
  tool: { icon: Wrench, label: 'Tool', color: 'text-blue-600 dark:text-blue-400' },
  template: { icon: FileText, label: 'Template', color: 'text-purple-600 dark:text-purple-400' },
  guide: { icon: BookOpen, label: 'Guide', color: 'text-green-600 dark:text-green-400' },
  video: { icon: Video, label: 'Video', color: 'text-red-600 dark:text-red-400' },
};

export function ResourceCard({ resource, className }: ResourceCardProps) {
  const { icon: TypeIcon, label, color } = typeConfig[resource.type];

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-shadow flex flex-col h-full',
        resource.isFeatured && 'ring-1 ring-primary/20',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <TypeIcon className={cn('size-4 shrink-0', color)} />
            <span className={cn('text-xs font-medium', color)}>{label}</span>
          </div>
          {resource.isFeatured && (
            <Badge variant="secondary" className="text-xs shrink-0">
              Featured
            </Badge>
          )}
        </div>
        <h3 className="font-semibold leading-snug mt-2">{resource.title}</h3>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {resource.description}
          </p>
        )}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {resource.tags.slice(0, 3).map((tag) => (
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

      <CardFooter className="pt-3 border-t border-border flex items-center justify-between">
        {resource.topic && (
          <span className="text-xs text-muted-foreground">{resource.topic.name}</span>
        )}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Open <ExternalLink className="size-3" />
        </a>
      </CardFooter>
    </Card>
  );
}
