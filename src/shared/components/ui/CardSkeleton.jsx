/**
 * CardSkeleton - Generic loading skeleton for card layouts
 * Flexible skeleton for various card designs
 */
export default function CardSkeleton({
  hasImage = false,
  imageHeight = "h-48",
  hasAvatar = false,
  lines = 3,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Image Skeleton */}
      {hasImage && (
        <div className={`animate-pulse bg-gray-200 w-full ${imageHeight}`} />
      )}

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Avatar + Title */}
        {hasAvatar && (
          <div className="flex items-center gap-3">
            <div className="animate-pulse bg-gray-200 w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="animate-pulse bg-gray-300 h-4 w-32 rounded" />
              <div className="animate-pulse bg-gray-200 h-3 w-24 rounded" />
            </div>
          </div>
        )}

        {/* Title (if no avatar) */}
        {!hasAvatar && (
          <div className="animate-pulse bg-gray-300 h-6 w-3/4 rounded" />
        )}

        {/* Description Lines */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-4 rounded"
              style={{
                width: i === lines - 1 ? "60%" : "100%",
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <div className="animate-pulse bg-gray-200 h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
