import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { useTenant } from "../../shared/contexts/TenantContext";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";

/**
 * Navigation - Reusable navigation bar component for tenant pages
 * Clean light theme design with responsive mobile menu
 */
export default function Navigation() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    client,
    isAuthenticated: isClientAuthenticated,
    logout: clientLogout,
  } = useClientAuth();
  const { tenant } = useTenant();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);

  const salonName = tenant?.name || "Beauty Salon";
  const ecommerceEnabled = tenant?.features?.enableProducts || false;

  // Check if user is authenticated as either tenant customer OR global client
  const isAuthenticated = user || isClientAuthenticated;

  // Handle logout for whichever auth type is active
  const handleLogout = () => {
    if (user) {
      logout();
    } else if (isClientAuthenticated) {
      clientLogout();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link
            to={`/salon/${tenant?.slug}`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
            {tenant?.branding?.logo?.url ? (
              <img
                src={tenant.branding.logo.url}
                alt={salonName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-black text-lg group-hover:scale-105 transition-transform">
                  {salonName?.[0]?.toUpperCase() || "B"}
                </div>
                <span className="text-xl font-black text-gray-900 group-hover:text-black transition-colors">
                  {salonName}
                </span>
              </>
            )}
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex gap-1">
            <Link
              to={`/salon/${tenant?.slug}/services`}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all relative group"
            >
              Services
            </Link>
            <Link
              to={`/salon/${tenant?.slug}/about`}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all relative group"
            >
              About Us
            </Link>
            <Link
              to={`/salon/${tenant?.slug}/contact`}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all relative group"
            >
              Contact
            </Link>
            {ecommerceEnabled && (
              <Link
                to={`/salon/${tenant?.slug}/products`}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all relative group"
              >
                Shop
              </Link>
            )}
          </nav>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isClientAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
                    {client?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {client?.name || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
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

                {/* Profile Menu Dropdown */}
                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[998]"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div
                      className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[999]"
                      style={{ minWidth: "320px" }}
                    >
                      <ProfileMenu
                        client={client}
                        onLogout={clientLogout}
                        variant="dropdown"
                        onItemClick={() => setProfileMenuOpen(false)}
                        onGiftCardClick={() => {
                          setProfileMenuOpen(false);
                          setShowGiftCardModal(true);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : user ? (
              <div
                className="relative"
                onMouseEnter={() => setProfileMenuOpen(true)}
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  aria-label="Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 z-[100] animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
                      >
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                      >
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to={`/client/login?redirect=${encodeURIComponent(
                    location.pathname,
                  )}`}
                  className="px-5 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions - Person Icon + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {/* Person Icon - Only show when signed in, navigates to mobile menu page */}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/menu")}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black text-white font-semibold hover:shadow-lg transition-all overflow-hidden"
                title={user?.name || client?.name || "Account"}
                aria-label="Open profile menu"
              >
                {client?.avatar ? (
                  <img
                    src={client.avatar}
                    alt={user?.name || client?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm">
                    {(
                      user?.name?.[0] ||
                      client?.name?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </span>
                )}
              </button>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 animate-slide-down bg-white">
            <div className="flex flex-col gap-1">
              <Link
                to={`/salon/${tenant?.slug}/services`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                Services
              </Link>
              <Link
                to={`/salon/${tenant?.slug}/about`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                About Us
              </Link>
              <Link
                to={`/salon/${tenant?.slug}/contact`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                Contact
              </Link>
              {ecommerceEnabled && (
                <Link
                  to={`/salon/${tenant?.slug}/products`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Shop
                </Link>
              )}
              {/* Sign In link only shown when not authenticated */}
              {!isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to={`/client/login?redirect=${encodeURIComponent(
                      location.pathname,
                    )}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={(giftCard) => {}}
      />
    </header>
  );
}
