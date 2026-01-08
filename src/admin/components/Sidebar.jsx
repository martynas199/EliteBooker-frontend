import { useState, useEffect } from "react";
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
  LogOut,
  Users,
  CreditCard,
  Headphones,
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
  Users,
  CreditCard,
  Headphones,
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
      { label: "Appointment List", path: "/admin/appointments" },
      { label: "Revenue Analytics", path: "/admin/revenue" },
    ],
  },
  {
    label: "Clients",
    icon: "Users",
    path: "/admin/clients",
  },
  {
    label: "Take Payment",
    icon: "CreditCard",
    path: "/admin/take-payment",
    condition: "payOnTapEnabled",
  },
  {
    label: "Booking Setup",
    icon: "Settings",
    items: [
      {
        label: "Locations",
        path: "/admin/locations",
        condition: "multiLocation",
      },
      { label: "Services", path: "/admin/services" },
      { label: "Staff", path: "/admin/staff", condition: "notSpecialist" },
      { label: "Custom Working Hours", path: "/admin/schedule" },
      { label: "Time Off", path: "/admin/timeoff" },
      { label: "Booking Policies", path: "/admin/cancellation" },
    ],
  },
  {
    label: "Store / E-commerce",
    icon: "ShoppingBag",
    condition: "ecommerceEnabled",
    items: [
      { label: "Products", path: "/admin/products" },
      { label: "Orders", path: "/admin/orders" },
      { label: "Profit Analytics", path: "/admin/profit-analytics" },
      { label: "Product Hero Image", path: "/admin/products-hero" },
      { label: "Shipping Rates", path: "/admin/shipping-rates" },
      { label: "Subscriptions", path: "/admin/subscription" },
    ],
  },
  {
    label: "Seminars & Masterclasses",
    icon: "Package",
    condition: "seminarsEnabled",
    items: [{ label: "All Seminars", path: "/admin/seminars" }],
  },
  {
    label: "Website Builder",
    icon: "Layout",
    condition: "notSpecialist",
    items: [
      { label: "Hero Sections", path: "/admin/hero-sections" },
      { label: "About Us Page", path: "/admin/about-us" },
      { label: "Contact Page", path: "/admin/settings" },
      // { label: "Blog Posts", path: "/admin/blog-posts" },
    ],
  },
  {
    label: "Configuration",
    icon: "Sliders",
    items: [
      { label: "Stripe Connect", path: "/admin/stripe-connect" },
      { label: "Features & Subscriptions", path: "/admin/platform-features" },
      {
        label: "Admin Links",
        path: "/admin/admin-links",
        condition: "notSpecialist",
      },
    ],
  },
  {
    label: "Support",
    icon: "Headphones",
    condition: "supportRole",
    items: [{ label: "All Registered Businesses", path: "/admin/tenants" }],
  },
];

const SidebarItem = ({
  item,
  isNested = false,
  onClose,
  userRole,
  isMobile = false,
}) => {
  const location = useLocation();
  const { ecommerceEnabled, multiLocation, seminarsEnabled, payOnTapEnabled } =
    useTenantSettings();
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if section should be hidden based on conditions
  if (item.condition === "ecommerceEnabled" && !ecommerceEnabled) {
    return null;
  }

  // Hide items based on multiLocation feature
  if (item.condition === "multiLocation" && !multiLocation) {
    return null;
  }

  // Hide items based on seminars feature
  if (item.condition === "seminarsEnabled" && !seminarsEnabled) {
    return null;
  }

  // Hide items based on payOnTap feature
  if (item.condition === "payOnTapEnabled" && !payOnTapEnabled) {
    return null;
  }

  // Hide Support menu for non-support users
  if (item.condition === "supportRole" && userRole !== "support") {
    return null;
  }

  // Hide items for specialist role
  if (item.condition === "notSpecialist" && userRole === "specialist") {
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
    // Mobile: Clean minimal design
    if (isMobile) {
      return (
        <div className="mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-900 bg-gray-50 rounded-xl transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5 text-gray-700" />}
              <span className="font-semibold">{item.label}</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
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
                <div className="mt-1 space-y-1 pl-4">
                  {item.items
                    .filter((child) => {
                      if (
                        child.condition === "multiLocation" &&
                        !multiLocation
                      ) {
                        return false;
                      }
                      if (
                        child.condition === "ecommerceEnabled" &&
                        !ecommerceEnabled
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((child, idx) => (
                      <SidebarItem
                        key={idx}
                        item={child}
                        isNested
                        onClose={onClose}
                        userRole={userRole}
                        isMobile={isMobile}
                      />
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Desktop: Gradient design
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
            hasActiveChild
              ? "bg-gray-50 text-gray-900"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                className={`w-5 h-5 transition-colors ${
                  hasActiveChild
                    ? "text-gray-900"
                    : "text-gray-600 group-hover:text-gray-900"
                }`}
              />
            )}
            <span
              className={`font-medium ${hasActiveChild ? "font-semibold" : ""}`}
            >
              {item.label}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-all duration-200 ${
              hasActiveChild ? "text-gray-700" : "text-gray-400"
            } ${isExpanded ? "rotate-0" : "-rotate-90"}`}
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
              <div className="ml-7 mt-1.5 space-y-0.5 border-l-2 border-gray-200 pl-4">
                {item.items
                  .filter((child) => {
                    if (child.condition === "multiLocation" && !multiLocation) {
                      return false;
                    }
                    if (
                      child.condition === "ecommerceEnabled" &&
                      !ecommerceEnabled
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((child, idx) => (
                    <SidebarItem
                      key={idx}
                      item={child}
                      isNested
                      onClose={onClose}
                      userRole={userRole}
                      isMobile={isMobile}
                    />
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Leaf item - Mobile clean design
  if (isMobile) {
    return (
      <Link
        to={item.path}
        onClick={onClose}
        className={`
          flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200
          ${
            isActive
              ? "bg-gray-900 text-white font-semibold"
              : "text-gray-700 hover:bg-gray-50"
          }
          ${isNested ? "text-[13px]" : ""}
        `}
      >
        {!isNested && Icon && (
          <Icon
            className={`w-5 h-5 flex-shrink-0 ${
              isActive ? "text-white" : "text-gray-500"
            }`}
          />
        )}
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  // Leaf item - Desktop gradient design
  return (
    <Link
      to={item.path}
      onClick={onClose}
      className={`
        flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group
        ${
          isActive
            ? "bg-gray-900 text-white font-semibold"
            : "text-gray-700 hover:bg-gray-50"
        }
        ${isNested ? "text-[13px] py-2" : ""}
      `}
    >
      {!isNested && Icon && (
        <Icon
          className={`w-5 h-5 transition-colors flex-shrink-0 ${
            isActive ? "text-white" : "text-gray-600 group-hover:text-gray-900"
          }`}
        />
      )}
      <span className="truncate">{item.label}</span>
    </Link>
  );
};

export default function Sidebar({
  tenant,
  admin,
  onLogout,
  onClose,
  isMobile = false,
}) {
  const { loadSettings } = useTenantSettings();

  // Load tenant settings when sidebar mounts
  useEffect(() => {
    loadSettings().catch((err) => {
      console.error("Failed to load tenant settings in Sidebar:", err);
    });
  }, []);

  // Mobile: Return navigation items only (no wrapper, header, or footer)
  if (isMobile) {
    return (
      <>
        {navigationConfig.map((section, idx) => (
          <SidebarItem
            key={idx}
            item={section}
            onClose={onClose}
            userRole={admin?.role}
            isMobile={true}
          />
        ))}
      </>
    );
  }

  // Desktop: Full sidebar with wrapper
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          {tenant?.branding?.logo?.url ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={tenant.branding.logo.url}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white text-base font-bold">
                {tenant?.name?.[0]?.toUpperCase() || "B"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">
              {tenant?.name || "Elite Booker"}
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 p-3 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        <div className="space-y-1">
          {navigationConfig.map((section, idx) => (
            <div key={idx}>
              <SidebarItem
                item={section}
                onClose={onClose}
                userRole={admin?.role}
              />
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 pb-52 lg:pb-3 border-t border-gray-200 flex-shrink-0 space-y-1">
        <Link
          to="/admin/profile"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
        >
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {admin?.name?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <span className="text-sm font-medium">Account Settings</span>
        </Link>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-3 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
