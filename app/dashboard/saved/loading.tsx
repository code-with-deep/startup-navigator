import { ArticleGridSkeleton } from '@/components/shared/LoadingSkeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40" />
      <ArticleGridSkeleton count={4} />
    </div>
  );
}
