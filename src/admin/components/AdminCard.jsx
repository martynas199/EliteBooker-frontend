import { motion } from "framer-motion";

export default function AdminCard({
  children,
  className = "",
  hover = true,
  padding = "p-6",
  gradient = false,
  onClick,
}) {
  const baseClasses = `bg-white rounded-2xl shadow-lg border border-gray-100 ${padding} ${className}`;
  const hoverClasses = hover
    ? "hover:shadow-xl hover:border-brand-200 transition-all duration-300 hover:scale-[1.01]"
    : "";
  const gradientClasses = gradient
    ? "bg-gradient-to-br from-white via-brand-50/20 to-purple-50/20"
    : "";

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2 } : {}}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, subtitle, icon, action }) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-md">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardSection({ title, children, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}
