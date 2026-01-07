import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Modal - A beautiful, reusable modal component
 *
 * @param {object} props
 * @param {boolean} props.open - Controls modal visibility
 * @param {function} props.onClose - Callback when modal should close
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} props.showCloseButton - Show X button in header
 * @param {boolean} props.closeOnBackdrop - Close when clicking backdrop
 * @param {boolean} props.closeOnEsc - Close when pressing Escape
 * @param {string} props.variant - Color variant: 'system' (violet/fuchsia) or 'dashboard' (blue)
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "lg",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  variant = "system",
}) {
  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEsc, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";

      // Scroll modal content to top when opening
      // Use a small delay to ensure the modal is rendered
      const timer = setTimeout(() => {
        const modalContent = document.querySelector(".modal-content-scroll");
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 50);

      return () => {
        document.body.style.overflow = "unset";
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  // Size classes
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  // Color variants for different contexts
  const variants = {
    system: {
      headerBg: "bg-gradient-to-r from-violet-50 to-fuchsia-50",
      titleGradient:
        "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600",
    },
    dashboard: {
      headerBg: "bg-white",
      titleColor: "text-gray-900 font-bold tracking-tight",
    },
  };

  const currentVariant = variants[variant] || variants.system;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center md:p-4">
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal with scale + fade animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative bg-white md:rounded-2xl shadow-2xl w-full ${sizeClasses[size]} mx-auto overflow-hidden h-[100dvh] md:h-auto md:max-h-[90vh] flex flex-col`}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 ${currentVariant.headerBg} flex-shrink-0`}
            >
              <h2
                className={`text-base sm:text-lg md:text-xl font-semibold ${
                  currentVariant.titleColor ||
                  `${currentVariant.titleGradient} bg-clip-text text-transparent`
                } line-clamp-2 pr-2`}
              >
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-red-50 rounded-full transition-colors group flex-shrink-0 border border-red-500"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:text-red-600"
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
              )}
            </div>

            {/* Content */}
            <div className="modal-content-scroll px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto flex-1">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render modal in a portal at document.body level to escape stacking context issues
  return createPortal(modalContent, document.body);
}
