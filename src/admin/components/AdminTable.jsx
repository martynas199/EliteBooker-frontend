export default function AdminTable({ children, className = "" }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
      {children}
    </thead>
  );
}

export function TableHeader({ children, sortable, onClick, sorted }) {
  const baseClasses =
    "px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider";
  const sortableClasses = sortable
    ? "cursor-pointer hover:bg-brand-50 hover:text-brand-700 transition-colors select-none"
    : "";

  return (
    <th className={`${baseClasses} ${sortableClasses}`} onClick={onClick}>
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <svg
            className={`w-4 h-4 transition-transform ${
              sorted === "asc" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>
    </th>
  );
}

export function TableBody({ children }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
}

export function TableRow({ children, onClick, hover = true }) {
  const hoverClasses = hover
    ? "hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-purple-50/30 hover:shadow-md transition-all duration-200"
    : "";
  const clickClasses = onClick ? "cursor-pointer" : "";

  return (
    <tr className={`${hoverClasses} ${clickClasses}`} onClick={onClick}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
    >
      {children}
    </td>
  );
}

export function StatusBadge({ status, children }) {
  const statusColors = {
    confirmed: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    reserved_unpaid: "bg-orange-100 text-orange-800 border-orange-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    cancelled_by_admin: "bg-red-100 text-red-800 border-red-200",
    cancelled_by_user: "bg-red-100 text-red-800 border-red-200",
    no_show: "bg-gray-100 text-gray-800 border-gray-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    unpaid: "bg-orange-100 text-orange-800 border-orange-200",
    refunded: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const colorClass =
    statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClass} shadow-sm`}
    >
      {children}
    </span>
  );
}

export function ActionButton({ children, onClick, variant = "primary" }) {
  const variants = {
    primary:
      "text-brand-600 hover:text-brand-700 hover:bg-brand-50 border-brand-200",
    danger: "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200",
    success:
      "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200",
    warning:
      "text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200",
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg border transition-all duration-200 hover:shadow-md ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
