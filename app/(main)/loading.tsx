import { ArticleGridSkeleton, TopicGridSkeleton } from '@/components/shared/LoadingSkeletons';

export default function MainLoading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <TopicGridSkeleton count={6} />
      <ArticleGridSkeleton count={6} />
    </div>
  );
}
