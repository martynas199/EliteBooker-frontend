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
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
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
      headerBg: "bg-gradient-to-r from-brand-50 to-blue-50",
      titleGradient:
        "bg-gradient-to-r from-brand-600 via-brand-500 to-blue-600",
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
            className={`relative bg-white md:rounded-2xl shadow-2xl w-full ${sizeClasses[size]} mx-auto overflow-hidden h-full md:h-auto md:max-h-[90vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${currentVariant.headerBg} flex-shrink-0`}
            >
              <h2
                className={`text-xl sm:text-2xl font-bold ${currentVariant.titleGradient} bg-clip-text text-transparent`}
              >
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors group"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-gray-700"
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
            <div className="px-6 py-6 overflow-y-auto flex-1">{children}</div>

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
