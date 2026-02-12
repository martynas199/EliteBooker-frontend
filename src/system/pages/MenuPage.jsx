import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";

const itemClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50";

export default function MenuPage() {
  const navigate = useNavigate();
  const { client, isAuthenticated, logout } = useClientAuth();
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehaviorY;

    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehaviorY = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehaviorY = previousOverscroll;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (logoutError) {
      setError(logoutError.message || "Unable to sign out");
    }
  };

  const customerLinks = isAuthenticated
    ? [
        { label: "Find a business", href: "/search" },
        { label: "Help and support", href: "/help" },
      ]
    : [
        { label: "Log in or sign up", href: "/client/login", primary: true },
        { label: "Find a business", href: "/search" },
        { label: "Help and support", href: "/help" },
      ];

  const businessLinks = [
    { label: "List your business", href: "/signup" },
    { label: "Business log in", href: "/admin/login" },
    { label: "Join referral program", href: "/join-referral-program" },
  ];

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f6f2ea] p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 text-center shadow-xl sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
            !
          </div>
          <h1 className="mb-2 text-xl font-semibold text-slate-950">
            Something went wrong
          </h1>
          <p className="mb-6 text-sm text-slate-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-900/10 to-transparent" />
      <div className="relative flex h-full flex-col">
        <div
          className="border-b border-slate-200/80 bg-white/90 px-4 pb-3 pt-4 backdrop-blur"
          style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
        >
          <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Navigation
              </p>
              <h1 className="text-base font-semibold text-slate-900">Menu</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 pb-6 pt-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
        >
          <div className="mx-auto w-full max-w-md space-y-4">
            {isAuthenticated ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-sm font-semibold text-white">
                      {client?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {client?.name || "My Account"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Manage profile, bookings and settings
                      </p>
                    </div>
                  </div>
                  <ProfileMenu
                    client={client}
                    onLogout={handleLogout}
                    variant="mobile"
                    onGiftCardClick={() => setShowGiftCardModal(true)}
                  />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Quick Links
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/search")}
                      className={itemClass}
                    >
                      Find a business
                    </button>
                    <button onClick={() => navigate("/help")} className={itemClass}>
                      Help and support
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    For Customers
                  </p>
                  <div className="space-y-2">
                    {customerLinks.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => navigate(link.href)}
                        className={`${itemClass} ${
                          link.primary
                            ? "border-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-700"
                            : ""
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    For Businesses
                  </p>
                  <div className="space-y-2">
                    {businessLinks.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => navigate(link.href)}
                        className={itemClass}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showGiftCardModal && (
          <GiftCardModal
            isOpen={showGiftCardModal}
            onClose={() => setShowGiftCardModal(false)}
            onSuccess={() => {}}
          />
        )}
      </div>
    </div>
  );
}
