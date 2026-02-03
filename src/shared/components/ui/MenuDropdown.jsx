import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * MenuDropdown Component
 * A reusable dropdown menu with sections for customers and businesses
 * Matches Fresha's design pattern
 * When user is logged in (businessLinks is empty), shows single-section menu
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls dropdown visibility
 * @param {Function} props.onClose - Callback when dropdown should close
 * @param {Array} props.customerLinks - Array of links for customer section
 * @param {Array} props.businessLinks - Array of links for business section (optional)
 * @param {string} props.position - Position of dropdown: 'left' | 'right' (default: 'right')
 */
export default function MenuDropdown({
  isOpen,
  onClose,
  customerLinks = [],
  businessLinks = [],
  position = "right",
}) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close on escape key
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

  // If no business links, show simple single-section menu (logged in state)
  const isSimpleMenu = businessLinks.length === 0;

  return (
    <>
      {/* Click outside to close dropdown */}
      <div
        className={`fixed inset-0 z-[998] ${isMobile ? "bg-black/20" : ""}`}
        onClick={onClose}
      />

      <div
        ref={dropdownRef}
        className={
          isMobile
            ? "fixed inset-4 top-16 bg-white rounded-2xl shadow-2xl overflow-y-auto z-[999]"
            : `absolute ${positionClasses} top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-[999]`
        }
        style={isMobile ? {} : { minWidth: "320px" }}
      >
        {/* For Customers Section */}
        {customerLinks.length > 0 && (
          <div className="p-6 bg-white">
            {!isSimpleMenu && (
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                FOR CUSTOMERS
              </div>
            )}
            <div className="flex flex-col gap-1">
              {customerLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-base block ${
                    link.primary
                      ? "text-violet-600 hover:bg-violet-50 font-medium"
                      : "text-gray-700"
                  }`}
                  disabled={link.disabled}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* For Businesses Section - only show if we have business links */}
        {businessLinks.length > 0 && (
          <div className="bg-gray-50 p-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              FOR BUSINESSES
            </div>
            <div className="flex flex-col gap-1">
              {businessLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-white rounded-xl transition-colors text-base font-medium"
                  disabled={link.disabled}
                >
                  <span>{link.label}</span>
                  {link.showArrow !== false && (
                    <svg
                      className="w-5 h-5 flex-shrink-0"
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
