/**
 * Standardized loading spinner component
 * @param {"sm"|"md"|"lg"|"xl"} [size] - Spinner size
 * @param {string} [message] - Optional loading message
 * @param {boolean} [center] - Center in container
 * @param {string} [className] - Additional classes
 */
export default function LoadingSpinner({
  size = "md",
  message = "",
  center = false,
  className = "",
}) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const spinner = (
    <div
      className={`inline-block animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (center) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        {spinner}
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {spinner}
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}
