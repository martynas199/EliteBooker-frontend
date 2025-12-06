import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  DollarSign,
  Settings,
  ShoppingBag,
  Layout,
  Sliders,
  ChevronDown,
  Package,
} from "lucide-react";
import { useTenantSettings } from "../../shared/hooks/useTenantSettings";

// Icon mapping
const iconMap = {
  Home,
  Calendar,
  DollarSign,
  Settings,
  ShoppingBag,
  Layout,
  Sliders,
  Package,
};

// Navigation configuration
const navigationConfig = [
  {
    label: "Dashboard",
    icon: "Home",
    path: "/admin",
  },
  {
    label: "Appointments",
    icon: "Calendar",
    items: [
      { label: "Calendar", path: "/admin/schedule" },
      { label: "Appointment List", path: "/admin/appointments" },
      { label: "Time Off", path: "/admin/timeoff" },
    ],
  },
  {
    label: "Sales & Payments",
    icon: "DollarSign",
    items: [
      { label: "Orders", path: "/admin/orders" },
      { label: "Revenue Analytics", path: "/admin/revenue" },
      { label: "Profit Analytics", path: "/admin/profit-analytics" },
      { label: "Stripe Connect", path: "/admin/stripe-connect" },
      { label: "Subscriptions", path: "/admin/subscription" },
    ],
  },
  {
    label: "Booking Setup",
    icon: "Settings",
    items: [
      { label: "Services", path: "/admin/services" },
      { label: "Staff", path: "/admin/staff" },
      { label: "My Schedule", path: "/admin/schedule" },
      { label: "Booking Policies", path: "/admin/cancellation" },
    ],
  },
  {
    label: "Store / E-commerce",
    icon: "ShoppingBag",
    condition: "ecommerceEnabled",
    items: [
      { label: "Products", path: "/admin/products" },
      { label: "Product Hero Image", path: "/admin/products-hero" },
      { label: "Shipping Rates", path: "/admin/shipping-rates" },
    ],
  },
  {
    label: "Website Builder",
    icon: "Layout",
    items: [
      { label: "Hero Sections", path: "/admin/hero-sections" },
      { label: "About Us Page", path: "/admin/about-us" },
      { label: "Blog Posts", path: "/admin/blog-posts" },
      { label: "Branding", path: "/admin/branding" },
    ],
  },
  {
    label: "Configuration",
    icon: "Sliders",
    items: [
      { label: "Salon Settings", path: "/admin/tenant-settings" },
      { label: "Admin Links", path: "/admin/admin-links" },
      { label: "General Settings", path: "/admin/settings" },
      { label: "Platform Features", path: "/admin/features" },
    ],
  },
];

const SidebarItem = ({ item, isNested = false }) => {
  const location = useLocation();
  const { ecommerceEnabled } = useTenantSettings();
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if section should be hidden based on conditions
  if (item.condition === "ecommerceEnabled" && !ecommerceEnabled) {
    return null;
  }

  const hasItems = item.items && item.items.length > 0;
  const Icon = iconMap[item.icon];

  // Check if current path matches this item
  const isActive = item.path && location.pathname === item.path;

  // Check if any nested item is active
  const hasActiveChild =
    hasItems && item.items.some((child) => child.path === location.pathname);

  if (hasItems) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
            )}
            <span className="font-medium">{item.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                {item.items.map((child, idx) => (
                  <SidebarItem key={idx} item={child} isNested />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Leaf item
  return (
    <Link
      to={item.path}
      className={`
        block px-3 py-2 text-sm rounded-md transition-all duration-150
        ${
          isActive
            ? "bg-gray-100 text-black font-medium"
            : "text-gray-700 hover:bg-gray-50"
        }
        ${isNested ? "text-[13px]" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        {!isNested && Icon && (
          <Icon
            className={`w-4 h-4 transition-colors ${
              isActive ? "text-black" : "text-gray-500"
            }`}
          />
        )}
        <span>{item.label}</span>
      </div>
    </Link>
  );
};

export default function Sidebar({ tenant }) {
  return (
    <aside className="w-64 min-h-screen bg-slate-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          {tenant?.branding?.logo?.url ? (
            <img
              src={tenant.branding.logo.url}
              alt={tenant.name}
              className="w-8 h-8 rounded-md object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {tenant?.name?.[0]?.toUpperCase() || "B"}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {tenant?.name || "Elite Booker"}
            </h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className="flex-1 p-4 overflow-y-auto"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="space-y-6">
          {navigationConfig.map((section, idx) => (
            <div key={idx}>
              {section.items ? (
                <div className="space-y-1">
                  <SidebarItem item={section} />
                </div>
              ) : (
                <SidebarItem item={section} />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 pb-32 lg:pb-4 border-t border-gray-200 flex-shrink-0 bg-slate-50">
        <Link
          to="/admin/profile"
          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">A</span>
            </div>
            <span className="text-sm">Account Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
