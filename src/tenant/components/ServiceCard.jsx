import { memo, useState } from "react";
import Card from "../../shared/components/ui/Card";
import Modal from "../../shared/components/ui/Modal";
import { useCurrency } from "../../shared/contexts/CurrencyContext";

/**
 * ServiceCard - reusable card for displaying a service with image, name, category, description, and variants (price & duration)
 * @param {object} props
 * @param {object} props.service - The service object
 * @param {function} props.onClick - Click handler for selecting a variant (receives variant object)
 * @param {boolean} props.isSelected - Whether this service is selected
 */
function ServiceCard({ service, onClick, isSelected = false }) {
  const { formatPrice } = useCurrency();
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showVariantsModal, setShowVariantsModal] = useState(false);

  // Support both new image object and legacy imageUrl string
  const imageUrl = service.image?.url || service.imageUrl;
  const imageAlt = service.image?.alt || service.name;

  // Get price range for display
  const prices =
    service.variants?.map((v) => Number(v.price)).filter(Boolean) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  // Check if service or any variant has promo price
  const hasPromoPrice =
    service.promoPrice || service.variants?.some((v) => v.promoPrice);
  const promoPrices =
    service.variants?.map((v) => Number(v.promoPrice)).filter(Boolean) || [];
  const minPromoPrice =
    promoPrices.length > 0 ? Math.min(...promoPrices) : service.promoPrice;
  const maxPromoPrice =
    promoPrices.length > 0 ? Math.max(...promoPrices) : service.promoPrice;

  return (
    <>
      <Card
        hoverable
        className="p-0 overflow-hidden group border border-gray-200 hover:border-black bg-white hover:shadow-xl transition-all duration-300 relative hover:z-10"
      >
        <div className="flex flex-row overflow-hidden w-full">
          {/* Image - on left, compact on mobile */}
          {imageUrl && (
            <div className="relative w-28 sm:w-48 flex-shrink-0 overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              {hasPromoPrice && (
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1">
                  <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-[9px] sm:text-xs font-black rounded-lg shadow-xl flex items-center gap-1 animate-pulse">
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="uppercase tracking-wide">Sale</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0">
            {/* Header */}
            <div className="flex flex-col gap-0.5 mb-2">
              <h3 className="font-bold text-base sm:text-xl text-gray-900 leading-tight group-hover:text-black transition-colors line-clamp-1">
                {service.name}
              </h3>
              {service.category && (
                <div className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                  {service.category}
                </div>
              )}
              {(service.primaryBeauticianId?.name ||
                service.specialist?.name) && (
                <div className="text-[10px] sm:text-xs text-gray-500">
                  with{" "}
                  {service.primaryBeauticianId?.name ||
                    service.specialist?.name}
                </div>
              )}
            </div>

            {/* Description - only on desktop */}
            {service.description && (
              <div className="mb-2 space-y-0">
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-0">
                  {service.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDescriptionModal(true);
                  }}
                  className="text-gray-700 hover:text-black text-[10px] sm:text-xs font-semibold underline underline-offset-2"
                >
                  Read more
                </button>
              </div>
            )}

            {/* Variants indicator */}
            {service.variants && service.variants.length > 1 && (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 font-medium mb-2">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {service.variants.length} options
              </div>
            )}

            {/* Footer - Price and Action */}
            <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              {/* Price & Duration */}
              <div className="flex flex-col gap-0.5">
                {minPrice !== null && (
                  <div className="flex items-baseline gap-1.5">
                    {hasPromoPrice ? (
                      <>
                        <span className="text-lg sm:text-2xl font-bold text-gray-900">
                          {formatPrice(
                            service.priceVaries ? maxPromoPrice : minPromoPrice
                          )}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                          {formatPrice(
                            service.priceVaries ? maxPrice : minPrice
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg sm:text-2xl font-bold text-gray-900">
                        {formatPrice(service.priceVaries ? maxPrice : minPrice)}
                      </span>
                    )}
                    {!service.priceVaries && maxPrice > minPrice && (
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        - {formatPrice(maxPrice)}
                      </span>
                    )}
                  </div>
                )}
                {/* Duration */}
                {service.variants && service.variants.length > 0 && (
                  <div className="flex items-center gap-0.5 text-gray-500 text-[10px] sm:text-xs">
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 7v5l3 2"
                      />
                    </svg>
                    {(() => {
                      const durations = service.variants
                        .map((v) => v.durationMin)
                        .filter(Boolean);
                      const minDuration = Math.min(...durations);
                      const maxDuration = Math.max(...durations);
                      if (minDuration === maxDuration) {
                        return `${minDuration} min`;
                      }
                      return `${minDuration}-${maxDuration} min`;
                    })()}
                  </div>
                )}
              </div>

              {/* Select Button - Mobile Optimized */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (service.variants && service.variants.length > 1) {
                    setShowVariantsModal(true);
                  } else {
                    const variant = service.variants?.[0] || {
                      name: "Standard",
                      price: service.price,
                      durationMin: service.durationMin,
                    };
                    onClick?.(variant);
                  }
                }}
                className={`px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-black hover:bg-gray-900 text-white"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                <span>
                  {isSelected
                    ? "Added"
                    : service.variants && service.variants.length > 1
                    ? "Choose"
                    : "Add"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Variants Modal */}
      <Modal
        open={showVariantsModal}
        onClose={() => setShowVariantsModal(false)}
        title={`Select ${service.name} Option`}
        variant="dashboard"
      >
        <div className="p-4 sm:p-6">
          <p className="text-sm text-gray-600 mb-4">
            Choose the option that works best for you:
          </p>
          <div className="space-y-3">
            {service.variants?.map((variant) => (
              <div
                key={variant.name}
                className="border border-gray-200 rounded-xl p-4 hover:border-black transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                      {variant.name}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 7v5l3 2"
                          />
                        </svg>
                        {variant.durationMin} min
                      </div>
                      <div className="font-bold text-black">
                        {formatPrice(variant.price)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowVariantsModal(false);
                      onClick?.(variant);
                    }}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-full transition-colors whitespace-nowrap"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Description Modal */}
      <Modal
        open={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        title={service.name}
        variant="dashboard"
      >
        <div className="p-4 sm:p-6">
          {service.category && (
            <div className="text-brand-600 text-sm font-semibold uppercase tracking-wide mb-3">
              {service.category}
            </div>
          )}

          <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {service.description}
          </div>

          {/* Price Information */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <p className="text-lg font-bold text-brand-700">
                  {(() => {
                    const prices =
                      service.variants
                        ?.map((v) => Number(v.price))
                        .filter(Boolean) || [];
                    const minPrice =
                      prices.length > 0 ? Math.min(...prices) : null;
                    const maxPrice =
                      prices.length > 0 ? Math.max(...prices) : null;

                    if (minPrice === null) return "Contact for price";
                    if (minPrice === maxPrice) return formatPrice(minPrice);
                    return `${formatPrice(minPrice)} - ${formatPrice(
                      maxPrice
                    )}`;
                  })()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDescriptionModal(false);
                  // If multiple variants, show variants modal
                  if (service.variants && service.variants.length > 1) {
                    setShowVariantsModal(true);
                  } else {
                    // Single variant or no variants - select directly
                    const variant = service.variants?.[0] || {
                      name: "Standard",
                      price: service.price,
                      durationMin: service.durationMin,
                    };
                    onClick?.(variant);
                  }
                }}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
              >
                {service.variants && service.variants.length > 1
                  ? "Choose Option"
                  : "Select"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default memo(ServiceCard);
