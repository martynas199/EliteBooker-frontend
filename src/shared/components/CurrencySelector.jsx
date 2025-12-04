import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCurrency } from "../contexts/CurrencyContext";

export default function CurrencySelector({ className = "" }) {
  const { currency, setCurrency, allCurrencies, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  // Close modal with ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (currencyCode) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  const currentCurrency = allCurrencies[currency];

  return (
    <div className={`${className}`}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand-300 transition-all duration-200 shadow-sm hover:shadow group whitespace-nowrap"
        aria-label="Select currency"
      >
        <span
          className="text-base leading-none"
          role="img"
          aria-label={currentCurrency.name}
        >
          {currentCurrency.flag}
        </span>
        <span className="font-semibold text-gray-700 group-hover:text-brand-700 text-sm transition-colors leading-none">
          {currentCurrency.code}
        </span>
        {isLoading && (
          <div className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        )}
        <svg
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-brand-600 transition-all duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Modal - Rendered via Portal */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />

            {/* Modal Content */}
            <div
              className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-scale-in"
              style={{ position: "relative", zIndex: 10 }}
            >
              {/* Mobile drag indicator */}
              <div className="sm:hidden flex justify-center pt-2 pb-1">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-brand-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-base sm:text-lg font-bold text-brand-700">
                      Select Currency
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 sm:p-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                    aria-label="Close"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
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

              {/* Currency Options */}
              <div
                className="py-1 sm:py-2 overflow-y-auto"
                style={{ maxHeight: "calc(85vh - 180px)" }}
              >
                {Object.entries(allCurrencies).map(([code, info]) => {
                  const isSelected = currency === code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleSelect(code)}
                      className={`w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-all duration-150 touch-manipulation active:scale-[0.98] ${
                        isSelected
                          ? "bg-gradient-to-r from-brand-50 to-brand-100 border-l-4 border-brand-600"
                          : "hover:bg-gray-50 active:bg-gray-100 border-l-4 border-transparent hover:border-brand-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span
                          className={`text-2xl sm:text-3xl transition-transform duration-200 ${
                            isSelected ? "scale-110" : ""
                          }`}
                          role="img"
                          aria-label={info.name}
                        >
                          {info.flag}
                        </span>
                        <div className="text-left">
                          <div
                            className={`text-sm sm:text-base font-bold ${
                              isSelected ? "text-brand-700" : "text-gray-700"
                            }`}
                          >
                            {code}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 font-medium">
                            {info.name}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Info */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 safe-area-bottom">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Prices are converted from GBP using{" "}
                    <span className="font-semibold text-brand-700">
                      live exchange rates
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
