import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden bg-card border border-border',
        className
      )}
    >
      <div className="aspect-[2/3] skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-full rounded skeleton-shimmer" />
        <div className="h-4 w-2/3 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonEpisode({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden bg-card border border-border',
        className
      )}
    >
      <div className="aspect-video skeleton-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGallery({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden aspect-square skeleton-shimmer',
        className
      )}
    />
  );
}