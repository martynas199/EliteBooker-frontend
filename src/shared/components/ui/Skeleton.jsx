/**
 * Skeleton loading components for better UX during data fetching
 * Noble, minimal shimmer animation
 */

const shimmerClass =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

/**
 * Generic skeleton box
 */
export function SkeletonBox({ className = "", ...props }) {
  return (
    <div
      className={`${shimmerClass} rounded-xl ${className}`}
      style={{ animationDuration: "1.5s" }}
      {...props}
    />
  );
}

/**
 * Service card skeleton
 */
export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Image skeleton */}
      <SkeletonBox className="w-full h-64" />

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <SkeletonBox className="h-6 w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-5/6" />
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between pt-4">
          <SkeletonBox className="h-8 w-24" />
          <SkeletonBox className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Beautician card skeleton
 */
export function BeauticianCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      {/* Avatar */}
      <SkeletonBox className="w-20 h-20 rounded-full mx-auto" />

      {/* Name */}
      <SkeletonBox className="h-5 w-32 mx-auto" />

      {/* Bio */}
      <div className="space-y-2">
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-4/5 mx-auto" />
      </div>

      {/* Button */}
      <SkeletonBox className="h-10 w-full rounded-xl" />
    </div>
  );
}

/**
 * Dashboard stats skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
      {/* Icon */}
      <SkeletonBox className="w-12 h-12 rounded-xl" />

      {/* Value */}
      <SkeletonBox className="h-8 w-24" />

      {/* Label */}
      <SkeletonBox className="h-4 w-32" />
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="border-b border-gray-100 py-4 flex items-center gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBox
          key={i}
          className="h-5"
          style={{ width: i === 0 ? "40%" : "20%" }}
        />
      ))}
    </div>
  );
}

/**
 * Product card skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Image */}
      <SkeletonBox className="w-full h-80" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-6 w-20" />
        <SkeletonBox className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Generic list skeleton
 */
export function ListSkeleton({ count = 3, itemHeight = "h-20" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBox key={i} className={`w-full ${itemHeight} rounded-xl`} />
      ))}
    </div>
  );
}
