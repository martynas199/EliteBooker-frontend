import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

/**
 * SelectDrawer - A mobile-friendly bottom drawer for select inputs
 *
 * @param {boolean} open - Whether the drawer is open
 * @param {function} onClose - Function to call when drawer should close
 * @param {string} title - Title displayed at the top of the drawer
 * @param {Array} options - Array of options [{value, label, disabled}]
 * @param {string} value - Currently selected value
 * @param {function} onChange - Function called when an option is selected (value) => {}
 * @param {string} placeholder - Placeholder text for the button
 * @param {boolean} disabled - Whether the select is disabled
 * @param {boolean} required - Whether the select is required
 * @param {string} emptyMessage - Message shown when no options available
 */
export function SelectDrawer({
  open,
  onClose,
  title,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  emptyMessage = "No options available",
}) {
  // Prevent body scroll when drawer is open
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

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    onClose();
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col mb-safe"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle bar for mobile */}
            <div className="flex justify-center pt-3 pb-2 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
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

            {/* Options List */}
            <div className="overflow-y-auto flex-1 px-2 sm:px-4 py-2 pb-4">
              {options.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {emptyMessage}
                </div>
              ) : (
                <div className="space-y-1 pb-2">
                  {options.map((option) => {
                    const isSelected = option.value === value;
                    const isDisabled = option.disabled;

                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          !isDisabled && handleSelect(option.value)
                        }
                        disabled={isDisabled}
                        className={`
                          w-full text-left px-4 py-3 rounded-lg transition-all
                          ${
                            isSelected
                              ? "bg-brand-500 text-white font-semibold shadow-md"
                              : isDisabled
                              ? "text-gray-400 cursor-not-allowed bg-gray-50"
                              : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base">
                            {option.label}
                          </span>
                          {isSelected && (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * SelectButton - Button component that triggers the SelectDrawer
 * Use this with SelectDrawer for a complete select experience
 */
export function SelectButton({
  value,
  placeholder,
  disabled,
  required,
  options = [],
  onClick,
  className = "",
}) {
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const hasValue = !!value;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative appearance-none border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 
        rounded-lg w-full pl-3 pr-10 py-2 sm:pl-4 sm:pr-12 sm:py-2.5 transition-all bg-white text-sm sm:text-base 
        cursor-pointer hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50
        text-left
        ${hasValue ? "text-gray-900" : "text-gray-500"}
        ${className}
      `}
    >
      <span className="block truncate">{displayText}</span>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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
      </div>
    </button>
  );
}

export default SelectDrawer;
