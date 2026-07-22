import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function ArticleCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full mt-2" />
        <Skeleton className="h-5 w-4/5" />
      </CardHeader>
      <CardContent className="pb-3 flex-1 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-1 mt-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-12 ml-auto" />
        <Skeleton className="h-3 w-8" />
      </CardFooter>
    </Card>
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-border space-y-4">
      <div className="flex justify-between">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="size-4 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TopicGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TopicCardSkeleton key={i} />
      ))}
    </div>
  );
}
