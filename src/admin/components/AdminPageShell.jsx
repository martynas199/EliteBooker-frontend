import Card from "../../shared/components/ui/Card";

const maxWidthClasses = {
  full: "max-w-none",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
};

export function AdminPageHeader({
  title,
  description,
  action,
  className = "",
}) {
  if (!title && !description && !action) return null;

  return (
    <div
      className={[
        "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between",
        className,
      ]
        .join(" ")
        .trim()}
    >
      <div className="min-w-0">
        {title && (
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            {title}
          </h1>
        )}
        {description && (
          <p className="mt-1 text-sm text-gray-600 sm:text-base">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function AdminSectionCard({
  children,
  className = "",
  padding = "p-4 sm:p-6",
  ...props
}) {
  return (
    <Card
      className={["border-gray-200 shadow-sm", padding, className].join(" ").trim()}
      {...props}
    >
      {children}
    </Card>
  );
}

export default function AdminPageShell({
  title,
  description,
  action,
  maxWidth = "2xl",
  className = "",
  headerClassName = "",
  contentClassName = "space-y-6",
  children,
}) {
  return (
    <div
      className={[
        "mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
        maxWidthClasses[maxWidth] || maxWidthClasses["2xl"],
        className,
      ]
        .join(" ")
        .trim()}
    >
      <AdminPageHeader
        title={title}
        description={description}
        action={action}
        className={headerClassName}
      />
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
