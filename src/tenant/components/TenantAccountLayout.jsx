export default function TenantAccountLayout({
  sidebar,
  title,
  description,
  onBack,
  maxWidth = "max-w-5xl",
  children,
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebar && <div className="hidden md:block">{sidebar}</div>}

      <div className="flex-1 overflow-auto">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {(onBack || title || description) && (
            <div className="mb-6 sm:mb-8">
              {onBack && (
                <button
                  onClick={onBack}
                  className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="sr-only">Go back</span>
                </button>
              )}

              {title && (
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm sm:text-base text-gray-600">
                  {description}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
