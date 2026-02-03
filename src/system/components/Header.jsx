import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import MenuDropdown from "../../shared/components/ui/MenuDropdown";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import eliteLogo from "../../assets/elite.png";

export default function Header() {
  const navigate = useNavigate();
  const { client, isAuthenticated, logout } = useClientAuth();
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showCompareDropdown, setShowCompareDropdown] = useState(false);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate("/client/profile");
    } else {
      navigate("/client/login");
    }
  };

  const customerLinks = isAuthenticated
    ? [
        {
          label: client?.name || "My Profile",
          onClick: () => navigate("/client/profile"),
          primary: true,
        },
        {
          label: "My Bookings",
          onClick: () => navigate("/client/profile"),
        },
        {
          label: "Settings",
          onClick: () => navigate("/client/profile"),
        },
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
        {
          label: "Find a business",
          href: "/search",
        },
        {
          label: "Help and support",
          href: "/help",
        },
      ];

  const businessLinks = [
    {
      label: "List your business",
      href: "/signup",
    },
    {
      label: "Business log in",
      href: "/admin/login",
    },
    {
      label: "Join referral program",
      href: "/join-referral-program",
    },
  ];

  return (
    <header
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
      style={{
        top: "env(safe-area-inset-top, 0px)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4">
            <img
              src={eliteLogo}
              alt="Elite Booker Logo"
              width="140"
              height="80"
              className="h-20 sm:h-28 w-auto"
              loading="eager"
            />
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {/* Industries Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowIndustriesDropdown(true)}
              onMouseLeave={() => setShowIndustriesDropdown(false)}
            >
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1">
                Industries
                <svg
                  className="w-4 h-4"
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
                <div className="absolute left-0 top-full mt-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56 z-50">
                  <button
                    onClick={() => navigate("/industries/lash-technicians")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    Lash Technicians
                  </button>
                  <button
                    onClick={() => navigate("/industries/hair-salons")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    Hair Salons
                  </button>
                  <button
                    onClick={() => navigate("/industries/barbers")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    Barbers
                  </button>
                </div>
              )}
            </div>

            {/* Compare Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowCompareDropdown(true)}
              onMouseLeave={() => setShowCompareDropdown(false)}
            >
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1">
                Compare
                <svg
                  className="w-4 h-4"
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
              {showCompareDropdown && (
                <div className="absolute left-0 top-full mt-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56 z-50">
                  <button
                    onClick={() => navigate("/compare/vs-fresha")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    vs Fresha
                  </button>
                  <button
                    onClick={() => navigate("/compare/vs-treatwell")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    vs Treatwell
                  </button>
                </div>
              )}
            </div>

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowFeaturesDropdown(true)}
              onMouseLeave={() => setShowFeaturesDropdown(false)}
            >
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1">
                Features
                <svg
                  className="w-4 h-4"
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
              {showFeaturesDropdown && (
                <div className="absolute left-0 top-full mt-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56 z-50">
                  <button
                    onClick={() => navigate("/features/sms-reminders")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    SMS Reminders
                  </button>
                  <button
                    onClick={() => navigate("/features/no-show-protection")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    No-Show Protection
                  </button>
                  <button
                    onClick={() => navigate("/features/calendar-sync")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    Calendar Sync
                  </button>
                  <button
                    onClick={() => navigate("/features/online-booking")}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    Online Booking
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Link */}
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all"
            >
              Pricing
            </button>
          </nav>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-full text-gray-900 hover:border-gray-400 transition-all"
              >
                List your business
              </button>
            )}

            {/* Menu Button */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold hover:shadow-lg transition-all overflow-hidden"
                  title={client?.name || "Account"}
                >
                  {client?.avatar ? (
                    <img
                      src={client.avatar}
                      alt={client?.name || "User"}
                      width="40"
                      height="40"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {client?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-full text-gray-900 hover:border-gray-400 transition-all"
                >
                  Menu
                  <svg
                    className="w-4 h-4"
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

              {/* Menu Dropdown */}
              {isAuthenticated ? (
                showMenuDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-[998]"
                      onClick={() => setShowMenuDropdown(false)}
                    />
                    <div
                      className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[999]"
                      style={{ minWidth: "320px" }}
                    >
                      <ProfileMenu
                        client={client}
                        onLogout={logout}
                        variant="dropdown"
                        onItemClick={() => setShowMenuDropdown(false)}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
              >
                {client?.avatar ? (
                  <img
                    src={client.avatar}
                    alt={client?.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{client?.name?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="p-2 text-gray-600 hover:text-violet-600"
              >
                <svg
                  className="w-6 h-6"
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

            {/* Mobile Dropdown */}
            {showMenuDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[998] bg-black/20"
                  onClick={() => setShowMenuDropdown(false)}
                />
                <div className="fixed top-16 right-4 left-4 bg-white rounded-2xl shadow-2xl z-[999] p-4 max-h-[80vh] overflow-y-auto">
                  {isAuthenticated ? (
                    <ProfileMenu
                      client={client}
                      onLogout={logout}
                      variant="mobile"
                      onItemClick={() => setShowMenuDropdown(false)}
                    />
                  ) : (
                    <div className="space-y-1">
                      {/* Customer Links Section */}
                      <div className="pb-2 mb-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                          FOR CUSTOMERS
                        </div>
                        <button
                          onClick={() => {
                            handleLogin();
                            setShowMenuDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-violet-600 hover:bg-violet-50 rounded-xl font-medium"
                        >
                          Log in or sign up
                        </button>
                        <button
                          onClick={() => {
                            navigate("/search");
                            setShowMenuDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl"
                        >
                          Find a business
                        </button>
                        <button
                          onClick={() => {
                            navigate("/help");
                            setShowMenuDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl"
                        >
                          Help and support
                        </button>
                      </div>

                      {/* Business Links Section */}
                      <div className="bg-gray-50 -mx-4 px-4 py-4 rounded-xl">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                          FOR BUSINESSES
                        </div>
                        <button
                          onClick={() => {
                            navigate("/signup");
                            setShowMenuDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-900 hover:bg-white rounded-xl font-medium flex items-center justify-between"
                        >
                          <span>List your business</span>
                          <svg
                            className="w-5 h-5"
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
                        <button
                          onClick={() => {
                            navigate("/admin/login");
                            setShowMenuDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-900 hover:bg-white rounded-xl font-medium flex items-center justify-between"
                        >
                          <span>Business log in</span>
                          <svg
                            className="w-5 h-5"
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
                        <button
                          onClick={() => {
                            navigate("/join-referral-program");
                            setShowMenuDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-900 hover:bg-white rounded-xl font-medium flex items-center justify-between"
                        >
                          <span>Join referral program</span>
                          <svg
                            className="w-5 h-5"
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
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
