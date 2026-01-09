import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  Calendar,
  Wallet,
  Heart,
  Gift,
  FileText,
  Package,
  Settings,
  Globe,
  LogOut,
  Download,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

/**
 * ProfileMenu Component
 * Reusable menu component for client profile - matches Fresha's design
 * Can be used in sidebar or dropdown panel
 *
 * @param {Object} props
 * @param {Object} props.client - Client data object with name and email
 * @param {Function} props.onLogout - Logout callback function
 * @param {string} props.variant - 'sidebar' | 'dropdown' (default: 'sidebar')
 * @param {Function} props.onItemClick - Optional callback when menu item is clicked
 * @param {Function} props.onGiftCardClick - Optional callback when gift card item is clicked
 */
export default function ProfileMenu({
  client,
  onLogout,
  variant = "sidebar",
  onItemClick,
  onGiftCardClick,
}) {
  const navigate = useNavigate();

  const handleNavigation = (path, action) => {
    if (onItemClick) onItemClick();
    
    // Handle special actions
    if (action === "gift-card") {
      if (onGiftCardClick) {
        onGiftCardClick();
      } else {
        console.warn("Gift card clicked but no handler provided");
      }
      return;
    }
    
    navigate(path);
  };

  const handleLogoutClick = async () => {
    if (onItemClick) onItemClick();
    await onLogout();
  };

  const menuItems = [
    {
      icon: UserCircle,
      label: "Profile",
      path: "/client/profile",
      section: "main",
    },
    {
      icon: Calendar,
      label: "Appointments",
      path: "/client/appointments",
      section: "main",
    },
    {
      icon: Wallet,
      label: "Wallet",
      path: "/client/wallet",
      section: "main",
    },
    {
      icon: Heart,
      label: "Favourites",
      path: "/client/favourites",
      section: "main",
    },
    {
      icon: Gift,
      label: "Send a gift card",
      path: "/gift-cards",
      action: "gift-card",
      section: "main",
    },
    {
      icon: FileText,
      label: "Forms",
      path: "/client/forms",
      section: "main",
    },
    {
      icon: Package,
      label: "Product orders",
      path: "/client/orders",
      section: "main",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/client/settings",
      section: "main",
    },
  ];

  const bottomItems = [
    {
      icon: LogOut,
      label: "Log out",
      action: "logout",
      section: "bottom",
    },
    {
      icon: Download,
      label: "Download the app",
      path: "/download",
      section: "bottom",
    },
    {
      icon: HelpCircle,
      label: "Help and support",
      path: "/help",
      section: "bottom",
    },
    {
      icon: Globe,
      label: "English",
      path: "/language",
      section: "bottom",
    },
  ];

  const businessItem = {
    label: "For businesses",
    path: "/admin/login",
    section: "business",
  };

  const isSidebar = variant === "sidebar";
  const isMobile = variant === "mobile";

  if (isMobile) {
    // Mobile full-screen layout
    return (
      <div className="flex flex-col bg-white min-h-full">
        {/* Wallet Card */}
        <div className="m-4 p-6 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl text-white">
          <p className="text-sm opacity-90 mb-1">Wallet balance</p>
          <p className="text-3xl font-bold mb-3">£0.00</p>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            View wallet
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.path, item.action)}
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-base text-gray-900">{item.label}</span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Bottom Items */}
        <div className="mt-4 border-t border-gray-200">
          {bottomItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() =>
                  item.action === "logout"
                    ? handleLogoutClick()
                    : handleNavigation(item.path)
                }
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-base text-gray-900">{item.label}</span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        {/* For Businesses Link */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={() => handleNavigation(businessItem.path)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <span className="text-base font-medium text-gray-900">{businessItem.label}</span>
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  } else if (isSidebar) {
    // Sidebar layout for profile page
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-lg">
            {client?.name || "User"}
          </h2>
        </div>

        {/* Main Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path, item.action)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Items */}
        <div className="border-t border-gray-200">
          <nav className="space-y-1 px-3 py-4">
            {bottomItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() =>
                    item.action === "logout"
                      ? handleLogoutClick()
                      : handleNavigation(item.path)
                  }
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* For Businesses Link */}
          <div className="px-3 pb-4">
            <button
              onClick={() => handleNavigation(businessItem.path)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-left font-medium"
            >
              <span className="text-sm">{businessItem.label}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // Dropdown layout for header menu
    return (
      <div className="py-2 min-w-[320px]">
        {/* User Name Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-semibold text-gray-900">
            {client?.name || "User"}
          </p>
        </div>

        {/* Main Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.path, item.action)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Items */}
        <div className="border-t border-gray-100 py-2">
          {bottomItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() =>
                  item.action === "logout"
                    ? handleLogoutClick()
                    : handleNavigation(item.path)
                }
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* For Businesses Link */}
        <div className="border-t border-gray-100 px-4 py-2">
          <button
            onClick={() => handleNavigation(businessItem.path)}
            className="w-full flex items-center justify-between py-2.5 text-gray-900 hover:text-violet-600 transition-colors text-left font-medium"
          >
            <span className="text-sm whitespace-nowrap">
              {businessItem.label}
            </span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>
      </div>
    );
  }
}
