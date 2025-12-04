/**
 * Enhanced Button component with smooth animations and loading state
 * @param {object} props
 * @param {"default"|"brand"|"outline"|"ghost"|"danger"|"success"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {boolean} [props.loading] - Show loading spinner
 * @param {boolean} [props.fullWidth] - Make button full width
 * @param {React.Component} [props.icon] - Optional icon component
 * @param {string} [props.className]
 */
export default function Button({
  variant = "default",
  size = "md",
  className = "",
  loading = false,
  fullWidth = false,
  icon: Icon,
  children,
  disabled = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transform";

  const variants = {
    default:
      "bg-black text-white hover:bg-gray-900 hover:shadow-lg focus:ring-black",
    brand:
      "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg hover:scale-[1.02] focus:ring-brand-600",
    outline:
      "border border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:ring-gray-500",
    ghost:
      "text-gray-900 hover:bg-gray-100 hover:shadow-sm focus:ring-gray-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500",
    success:
      "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg focus:ring-green-500",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4",
    lg: "h-12 px-5 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const isDisabled = disabled || loading;

  const cls = [
    base,
    variants[variant] || variants.default,
    sizes[size] || sizes.md,
    widthClass,
    className,
  ]
    .join(" ")
    .trim();

  return (
    <button className={cls} disabled={isDisabled} {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {Icon && !loading && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
