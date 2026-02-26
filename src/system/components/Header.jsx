import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import MenuDropdown from "../../shared/components/ui/MenuDropdown";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import eliteLogo from "../../assets/elite.png";

const navButtonClass =
  "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-100/70 hover:text-slate-900";
const desktopDropdownClass =
  "absolute left-0 top-full z-50 w-56 rounded-xl border border-sky-100 bg-white/95 py-2 shadow-xl shadow-slate-900/10 backdrop-blur";
const featuresDropdownClass =
  "absolute left-0 top-full z-50 w-56 rounded-xl border border-sky-100 bg-white/95 py-2 shadow-xl shadow-slate-900/10 backdrop-blur";
const desktopDropdownItemClass =
  "block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-sky-50";
const mobileMenuItemClass =
  "w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-slate-900";

export default function Header({ iosSafeMode = false, minimalMode = false }) {
  const navigate = useNavigate();
  const { client, isAuthenticated, logout } = useClientAuth();
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showCompareDropdown, setShowCompareDropdown] = useState(false);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);
  const headerClassName = iosSafeMode
    ? "relative z-50 border-b border-slate-200/90 bg-[#edf4ff] shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)]"
    : "relative z-50 border-b border-slate-200/90 bg-[#edf4ff] shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)] md:sticky md:bg-[#edf4ff]/92 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-[#edf4ff]/82";

  const handleLogin = () => {
    navigate(isAuthenticated ? "/client/profile" : "/client/login");
  };

  const handleMenuNavigation = (path) => {
    navigate(path);
    setShowMenuDropdown(false);
  };

  const customerLinks = isAuthenticated
    ? [
        {
          label: client?.name || "My Profile",
          onClick: () => navigate("/client/profile"),
          primary: true,
        },
        { label: "My Bookings", onClick: () => navigate("/client/profile") },
        { label: "Settings", onClick: () => navigate("/client/profile") },
        { label: "Find a business", href: "/search" },
        { label: "Help and support", href: "/help" },
        {
          label: "Log out",
          onClick: async () => {
            await logout();
            setShowMenuDropdown(false);
            window.location.replace("/");
          },
        },
      ]
    : [
        {
          label: "Log in or sign up",
          onClick: handleLogin,
          primary: true,
        },
        { label: "Find a business", href: "/search" },
        { label: "Help and support", href: "/help" },
      ];

  const businessLinks = [
    { label: "Features", href: "/features" },
    { label: "Compare platforms", href: "/compare" },
    { label: "Local solutions", href: "/solutions" },
    { label: "Pricing", href: "/pricing" },
    { label: "List your business", href: "/signup" },
    { label: "Business log in", href: "/admin/login" },
    { label: "Join referral program", href: "/join-referral-program" },
  ];
  const featureDropdownLinks = [
    { label: "SMS Reminders", href: "/features/sms-reminders" },
    { label: "No-Show Protection", href: "/features/no-show-protection" },
    { label: "Calendar Sync", href: "/features/calendar-sync" },
    { label: "Online Booking", href: "/features/online-booking" },
    { label: "See all features", href: "/features" },
  ];

  if (minimalMode) {
    return (
      <header
        className="relative z-50 border-b border-slate-200/90 bg-[#edf4ff] shadow-[0_10px_28px_-24px_rgba(15,23,42,0.45)]"
        style={{
          top: "0px",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.25rem] items-center justify-between sm:h-16">
            <Link to="/" className="flex items-center gap-4">
              <img
                src={eliteLogo}
                alt="Elite Booker Logo"
                width="140"
                height="80"
                className="h-16 w-auto sm:h-20"
                loading="eager"
              />
            </Link>

            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="hidden rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-sky-300 hover:bg-white sm:inline-flex"
                >
                  List your business
                </Link>
              )}

              <button
                onClick={() =>
                  navigate(isAuthenticated ? "/client/profile" : "/menu")
                }
                className="inline-flex h-10 items-center justify-center rounded-full border border-sky-200 bg-white/90 px-4 text-sm font-medium text-slate-800"
              >
                {isAuthenticated ? "Account" : "Menu"}
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={headerClassName}
      style={{
        top: "env(safe-area-inset-top, 0px)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.25rem] items-center justify-between sm:h-16">
          <Link to="/" className="flex items-center gap-4">
            <img
              src={eliteLogo}
              alt="Elite Booker Logo"
              width="140"
              height="80"
              className="h-16 w-auto sm:h-20"
              loading="eager"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            <div
              className="relative -mb-2 pb-2"
              onMouseEnter={() => setShowIndustriesDropdown(true)}
              onMouseLeave={() => setShowIndustriesDropdown(false)}
            >
              <button className={navButtonClass}>
                Industries
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showIndustriesDropdown && (
                <div className={desktopDropdownClass}>
                  <Link
                    to="/industries/lash-technicians"
                    className={desktopDropdownItemClass}
                    onClick={() => setShowIndustriesDropdown(false)}
                  >
                    Lash Technicians
                  </Link>
                  <Link
                    to="/industries/hair-salons"
                    className={desktopDropdownItemClass}
                    onClick={() => setShowIndustriesDropdown(false)}
                  >
                    Hair Salons
                  </Link>
                  <Link
                    to="/industries/barbers"
                    className={desktopDropdownItemClass}
                    onClick={() => setShowIndustriesDropdown(false)}
                  >
                    Barbers
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative -mb-2 pb-2"
              onMouseEnter={() => setShowCompareDropdown(true)}
              onMouseLeave={() => setShowCompareDropdown(false)}
            >
              <Link to="/compare" className={navButtonClass}>
                Compare
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              {showCompareDropdown && (
                <div className={desktopDropdownClass}>
                  <Link
                    to="/compare"
                    className={desktopDropdownItemClass}
                    onClick={() => setShowCompareDropdown(false)}
                  >
                    All Comparisons
                  </Link>
                  <Link
                    to="/compare/vs-fresha"
                    className={desktopDropdownItemClass}
                    onClick={() => setShowCompareDropdown(false)}
                  >
                    vs Fresha
                  </Link>
                  <Link
                    to="/compare/vs-treatwell"
                    className={desktopDropdownItemClass}
                    onClick={() => setShowCompareDropdown(false)}
                  >
                    vs Treatwell
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative -mb-2 pb-2"
              onMouseEnter={() => setShowFeaturesDropdown(true)}
              onMouseLeave={() => setShowFeaturesDropdown(false)}
            >
              <Link to="/features" className={navButtonClass}>
                Features
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              {showFeaturesDropdown && (
                <div className={featuresDropdownClass}>
                  {featureDropdownLinks.map((link, index) => (
                    <Link
                      key={`${link.href}-${index}`}
                      to={link.href}
                      className={`${desktopDropdownItemClass} ${
                        index === featureDropdownLinks.length - 1
                          ? "font-semibold text-slate-900"
                          : ""
                      }`}
                      onClick={() => setShowFeaturesDropdown(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/solutions"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-100/70 hover:text-slate-900"
            >
              Solutions
            </Link>
            <Link
              to="/pricing"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-100/70 hover:text-slate-900"
            >
              Pricing
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-sky-300 hover:bg-white"
              >
                List your business
              </Link>
            )}

            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-700 font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
                  title={client?.name || "Account"}
                >
                  {client?.avatar ? (
                    <img
                      src={client.avatar}
                      alt={client?.name || "User"}
                      width="40"
                      height="40"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span>{client?.name?.charAt(0).toUpperCase() || "U"}</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-sky-300 hover:bg-white"
                >
                  Menu
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}

              {isAuthenticated ? (
                showMenuDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-[998]"
                      onClick={() => setShowMenuDropdown(false)}
                    />
                    <div
                      className="absolute right-0 top-full z-[999] mt-2 overflow-hidden rounded-2xl bg-white shadow-2xl"
                      style={{ minWidth: "320px" }}
                    >
                      <ProfileMenu
                        client={client}
                        onLogout={logout}
                        variant="dropdown"
                        onItemClick={() => setShowMenuDropdown(false)}
                        onGiftCardClick={() => navigate("/gift-cards")}
                      />
                    </div>
                  </>
                )
              ) : (
                <MenuDropdown
                  isOpen={showMenuDropdown}
                  onClose={() => setShowMenuDropdown(false)}
                  customerLinks={customerLinks}
                  businessLinks={businessLinks}
                  position="right"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/menu")}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-white"
                title={client?.name || "Account"}
              >
                {client?.avatar ? (
                  <img
                    src={client.avatar}
                    alt={client?.name || "User"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {client?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-white/90 text-slate-700"
                aria-label="Open menu"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {!isAuthenticated && showMenuDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[998] bg-black/20"
                  onClick={() => setShowMenuDropdown(false)}
                />
                <div className="fixed inset-x-4 top-[max(env(safe-area-inset-top),4.5rem)] z-[999] max-h-[80vh] overflow-y-auto rounded-3xl border border-sky-100 bg-white/95 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur">
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        For Customers
                      </p>
                      <div className="space-y-1.5">
                        {customerLinks.map((link) => (
                          <button
                            key={link.label}
                            onClick={() => {
                              if (link.onClick) {
                                link.onClick();
                                setShowMenuDropdown(false);
                              } else if (link.href) {
                                handleMenuNavigation(link.href);
                              }
                            }}
                            className={`${mobileMenuItemClass} ${
                              link.primary
                                ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                                : ""
                            }`}
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        For Businesses
                      </p>
                      <div className="space-y-1.5">
                        {businessLinks.map((link) => (
                          <button
                            key={link.label}
                            onClick={() => handleMenuNavigation(link.href)}
                            className={mobileMenuItemClass}
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

