import { useState, useEffect } from "react";

export function SlowRequestWarning({ isLoading, threshold = 3000 }) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowWarning(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowWarning(true);
    }, threshold);

    return () => clearTimeout(timer);
  }, [isLoading, threshold]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 animate-slideIn z-50">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 className="text-sm font-semibold text-yellow-900 mb-1">
            This is taking longer than usual
          </h4>
          <p className="text-xs text-yellow-700">
            Please wait while we load your data. This may take a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
