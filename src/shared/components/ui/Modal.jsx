import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal with scale + fade animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="text-lg font-semibold">{title}</div>
            </div>
            <div className="p-4 space-y-3 overflow-x-hidden max-h-[70vh] overflow-y-auto">
              {children}
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-2">
              {footer}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
