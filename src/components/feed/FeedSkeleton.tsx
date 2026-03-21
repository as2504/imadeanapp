import { Skeleton } from "@/components/ui/skeleton";

const FeedCardSkeleton = () => (
  <div className="bg-background border border-border/50 rounded-2xl p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-xl" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
    <div className="flex justify-between items-center pt-2 border-t border-border/30">
      <div className="flex gap-3">
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-12 rounded-lg" />
        <Skeleton className="h-7 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>
  </div>
);

const FeedSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <FeedCardSkeleton key={i} />
    ))}
  </div>
);

export default FeedSkeleton;
