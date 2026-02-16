import Card from "./Card";
import Button from "./Button";

export default function EmptyStateCard({
  title,
  description,
  icon,
  action,
  primaryAction,
  secondaryAction,
  className = "",
  compact = false,
}) {
  return (
    <Card
      className={`text-center ${compact ? "p-8" : "p-12"} ${className}`.trim()}
    >
      {icon && (
        <div
          className={`inline-flex items-center justify-center rounded-full bg-gray-100 mb-4 ${
            compact ? "w-14 h-14" : "w-16 h-16 mb-5"
          }`}
        >
          {icon}
        </div>
      )}

      <h3
        className={`font-semibold text-gray-900 ${
          compact ? "text-base mb-1" : "text-lg mb-2"
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`text-gray-600 ${
            compact ? "text-sm mb-5" : "mb-6 max-w-md mx-auto"
          }`}
        >
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
          {secondaryAction && (
            <Button
              type="button"
              variant={secondaryAction.variant || "outline"}
              onClick={secondaryAction.onClick}
              className={
                secondaryAction.className || "w-full sm:w-auto px-5 text-sm"
              }
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              type="button"
              variant={primaryAction.variant || "brand"}
              onClick={primaryAction.onClick}
              className={
                primaryAction.className || "w-full sm:w-auto px-5 text-sm"
              }
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

      {action && <div className="mt-1">{action}</div>}
    </Card>
  );
}
