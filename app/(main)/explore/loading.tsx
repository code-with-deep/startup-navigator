import { TopicGridSkeleton } from '@/components/shared/LoadingSkeletons';

export default function ExploreLoading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="h-4 w-72 bg-muted/60 rounded animate-pulse" />
      </div>
      <TopicGridSkeleton count={8} />
    </div>
  );
}
