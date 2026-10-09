import { cn } from '../../utils/format';

// Placeholders are unprinted paper: the sheet-hi tint with the board's dot screen.
export function Skeleton({ className = '' }) {
  return <div className={cn('skeleton animate-pulse', className)} />;
}

// A flyer that has not been printed yet: dashed outline, no tack, no plate.
export function PostSkeleton({ withImage = false }) {
  return (
    <div className="sheet border-dashed border-ink-3 p-4 max-sm:mr-[5px] sm:p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      {withImage && <Skeleton className="mt-6 aspect-video w-full" />}
      <div className="mt-4 flex gap-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-7.5" role="status" aria-label="Loading posts">
      {Array.from({ length: count }, (_, i) => (
        <PostSkeleton key={i} withImage={i % 2 === 1} />
      ))}
    </div>
  );
}

export function UserRowSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading people">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
