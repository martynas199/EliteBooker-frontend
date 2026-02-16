import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    bg: "bg-green-50",
    text: "text-green-900",
    border: "border-green-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    bg: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-900",
    border: "border-red-200",
    icon: XCircle,
  },
};

function formatLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({
  status,
  className = "",
  showIcon = true,
}) {
  const key = String(status || "").toLowerCase();
  const config = statusConfig[key] || {
    label: formatLabel(status) || "Unknown",
    bg: "bg-gray-50",
    text: "text-gray-900",
    border: "border-gray-200",
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
      {config.label}
    </span>
  );
}
