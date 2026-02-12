import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MenuDropdown({
  isOpen,
  onClose,
  customerLinks = [],
  businessLinks = [],
  position = "right",
}) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = (link) => {
    onClose();

    if (link.onClick) {
      link.onClick();
    } else if (link.href) {
      if (link.external) {
        window.location.href = link.href;
      } else {
        navigate(link.href);
      }
    }
  };

  const isMobile = position === "mobile";
  const positionClasses = position === "left" ? "left-0" : "right-0";

  const isSimpleMenu = businessLinks.length === 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-[998] ${
          isMobile ? "bg-black/20 backdrop-blur-[1px]" : ""
        }`}
        onClick={onClose}
      />

      <div
        ref={dropdownRef}
        className={
          isMobile
            ? "fixed inset-x-4 top-[max(env(safe-area-inset-top),4.5rem)] z-[999] max-h-[80vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
            : `absolute ${positionClasses} top-full z-[999] mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`
        }
        style={
          isMobile
            ? { paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }
            : { minWidth: "320px" }
        }
      >
        {customerLinks.length > 0 && (
          <div className="bg-white p-4 sm:p-5">
            {!isSimpleMenu && (
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                For Customers
              </p>
            )}
            <div className="space-y-1.5">
              {customerLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                    link.primary
                      ? "border-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-700"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                  disabled={link.disabled}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {businessLinks.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              For Businesses
            </p>
            <div className="space-y-1.5">
              {businessLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                  disabled={link.disabled}
                >
                  <span>{link.label}</span>
                  {link.showArrow !== false && (
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-slate-500"
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
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
