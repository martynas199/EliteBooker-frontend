const accentClasses = {
  violet: {
    active: "border-violet-600 text-violet-600",
    inactive:
      "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300",
  },
  indigo: {
    active: "border-indigo-600 text-indigo-600",
    inactive:
      "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
  },
  brand: {
    active: "border-brand-500 text-brand-600",
    inactive:
      "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
  },
};

export default function TabNav({
  tabs,
  activeKey,
  onChange,
  accent = "violet",
  mobileGrid = false,
  className = "",
  navClassName = "",
  buttonClassName = "text-sm",
  showCounts = true,
}) {
  const tone = accentClasses[accent] || accentClasses.violet;

  const defaultNavClass = mobileGrid
    ? "grid grid-cols-2 gap-2 sm:flex sm:gap-6"
    : "flex gap-6 overflow-x-auto";

  return (
    <div className={className}>
      <nav className={`${defaultNavClass} ${navClassName}`.trim()}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`py-3 px-1 border-b-2 font-medium whitespace-nowrap transition-colors ${buttonClassName} ${
              activeKey === tab.key ? tone.active : tone.inactive
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <span>{tab.label}</span>
              {showCounts && typeof tab.count === "number" && (
                <span>({tab.count})</span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
