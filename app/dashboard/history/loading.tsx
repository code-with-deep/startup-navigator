import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border border-border rounded-xl p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
