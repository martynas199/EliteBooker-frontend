/**
 * TableSkeleton - Loading skeleton for table views
 * Provides a skeleton for table headers and rows
 */
export default function TableSkeleton({
  columns = 4,
  rows = 5,
  showHeader = true,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header Skeleton */}
      {showHeader && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-300 h-4 rounded"
                style={{
                  width: i === 0 ? "30%" : `${70 / (columns - 1)}%`,
                  flex: i === 0 ? "0 0 30%" : "1",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Table Body Skeleton */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="animate-pulse bg-gray-200 h-5 rounded"
                  style={{
                    width: colIndex === 0 ? "30%" : `${70 / (columns - 1)}%`,
                    flex: colIndex === 0 ? "0 0 30%" : "1",
                    animationDelay: `${rowIndex * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
