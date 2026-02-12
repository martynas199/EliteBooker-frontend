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

    if (action === "gift-card") {
      if (onGiftCardClick) {
        onGiftCardClick();
      } else if (path) {
        navigate(path);
      }
      return;
    }

    if (path) {
      navigate(path);
    }
  };

  const handleLogoutClick = async () => {
    if (onItemClick) onItemClick();
    await onLogout();
  };

  const menuItems = [
    { icon: UserCircle, label: "Profile", path: "/client/profile" },
    { icon: Calendar, label: "Appointments", path: "/client/appointments" },
    { icon: Wallet, label: "Wallet", path: "/client/wallet" },
    { icon: Heart, label: "Favourites", path: "/client/favourites" },
    {
      icon: Gift,
      label: "Send a gift card",
      path: "/gift-cards",
      action: "gift-card",
    },
    { icon: FileText, label: "Forms", path: "/client/forms" },
    { icon: Package, label: "Product orders", path: "/client/orders" },
    { icon: Settings, label: "Settings", path: "/client/settings" },
  ];

  const bottomItems = [
    { icon: LogOut, label: "Log out", action: "logout" },
    { icon: Globe, label: "Find a business", path: "/search" },
    { icon: Download, label: "Download the app", path: "/download" },
    { icon: HelpCircle, label: "Help and support", path: "/help" },
    { icon: Globe, label: "English", path: "/language" },
  ];

  const businessItem = { label: "For businesses", path: "/admin/login" };
  const isSidebar = variant === "sidebar";
  const isMobile = variant === "mobile";

  if (isMobile) {
    return (
      <div className="min-h-full bg-white">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
            Wallet
          </p>
          <p className="mb-3 text-3xl font-bold">GBP 0.00</p>
          <button className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/25">
            View wallet
          </button>
        </div>

        <div className="mt-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path, item.action)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">
                    {item.label}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        <div className="mt-3 border-t border-slate-200 pt-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() =>
                  item.action === "logout"
                    ? handleLogoutClick()
                    : handleNavigation(item.path)
                }
                className="mb-1 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50 last:mb-0"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">
                    {item.label}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        <div className="mt-3 border-t border-slate-200 pt-3">
          <button
            onClick={() => handleNavigation(businessItem.path)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50"
          >
            <span className="text-sm font-semibold text-slate-900">
              {businessItem.label}
            </span>
            <ArrowRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>
    );
  }

  if (isSidebar) {
    return (
      <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {client?.name || "User"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path, item.action)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-200">
          <nav className="space-y-1 px-3 py-4">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() =>
                    item.action === "logout"
                      ? handleLogoutClick()
                      : handleNavigation(item.path)
                  }
                  className="w-full rounded-lg px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="px-3 pb-4">
            <button
              onClick={() => handleNavigation(businessItem.path)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              <span className="text-sm">{businessItem.label}</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[320px] py-2">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="font-semibold text-gray-900">{client?.name || "User"}</p>
      </div>

      <div className="py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path, item.action)}
              className="w-full px-4 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap text-sm">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 py-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() =>
                item.action === "logout"
                  ? handleLogoutClick()
                  : handleNavigation(item.path)
              }
              className="w-full px-4 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap text-sm">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 px-4 py-2">
        <button
          onClick={() => handleNavigation(businessItem.path)}
          className="flex w-full items-center justify-between py-2.5 text-left font-medium text-gray-900 transition-colors hover:text-violet-600"
        >
          <span className="whitespace-nowrap text-sm">{businessItem.label}</span>
          <ArrowRight className="h-4 w-4 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
