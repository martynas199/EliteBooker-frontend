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
        className="p-0 overflow-hidden group border border-gray-300 hover:border-gray-900 bg-white hover:shadow-xl transition-all duration-300"
      >
        <div className="flex flex-row overflow-x-hidden w-full min-h-[140px]">
          {imageUrl && (
            <div className="relative w-28 sm:w-40 self-stretch overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Gradient overlay for better aesthetics */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          <div className="flex flex-col flex-1 p-2.5 sm:p-4 min-w-0 overflow-x-hidden">
            <div className="flex flex-col gap-0.5 mb-1 min-w-0 flex-shrink-0">
              <div className="font-bold text-sm sm:text-lg text-gray-900 leading-tight break-words group-hover:text-black transition-colors">
                {service.name}
              </div>
              {service.category && (
                <div className="text-gray-600 text-[9px] sm:text-xs font-medium uppercase tracking-wide truncate">
                  {service.category}
                </div>
              )}
              {(service.primaryBeauticianId?.name ||
                service.specialist?.name) && (
                <div className="text-[9px] sm:text-xs text-gray-500 truncate">
                  By{" "}
                  {service.primaryBeauticianId?.name ||
                    service.specialist?.name}
                </div>
              )}
            </div>
            {service.description && (
              <div className="mb-1.5 sm:mb-3 flex-shrink-0">
                <div className="text-gray-600 text-[11px] sm:text-sm line-clamp-2">
                  {service.description}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDescriptionModal(true);
                  }}
                  className="text-gray-700 hover:text-black text-[10px] sm:text-xs font-medium mt-0.5 underline"
                >
                  Read more
                </button>
              </div>
            )}

            {/* Variants indicator */}
            {service.variants && service.variants.length > 1 && (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 font-medium mb-1 flex-shrink-0">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{service.variants.length} options available</span>
              </div>
            )}

            {/* Price and Action Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-1.5 sm:pt-2 border-t border-gray-200 gap-2 sm:gap-3 min-w-0 flex-shrink-0">
              {/* Price and Duration Display */}
              <div className="flex flex-col gap-0.5 min-w-0 w-full sm:w-auto flex-1">
                {minPrice !== null && (
                  <>
                    <div className="flex items-baseline gap-0.5 sm:gap-1 flex-wrap">
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {service.priceVaries ? "Up to" : "From"}
                      </span>
                      {hasPromoPrice && minPromoPrice ? (
                        <>
                          <span className="text-sm sm:text-base font-medium text-gray-400 line-through">
                            {formatPrice(
                              service.priceVaries ? maxPrice : minPrice
                            )}
                          </span>
                          <span className="text-base sm:text-xl font-bold text-red-600">
                            {formatPrice(
                              service.priceVaries
                                ? maxPromoPrice
                                : minPromoPrice
                            )}
                          </span>
                          {!service.priceVaries &&
                            maxPromoPrice &&
                            maxPromoPrice > minPromoPrice && (
                              <span className="text-[10px] sm:text-xs text-gray-400">
                                - {formatPrice(maxPromoPrice)}
                              </span>
                            )}
                        </>
                      ) : (
                        <>
                          <span className="text-base sm:text-xl font-bold text-gray-900">
                            {formatPrice(
                              service.priceVaries ? maxPrice : minPrice
                            )}
                          </span>
                          {!service.priceVaries && maxPrice > minPrice && (
                            <span className="text-[10px] sm:text-xs text-gray-400">
                              - {formatPrice(maxPrice)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {hasPromoPrice && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-300 rounded-full text-[9px] sm:text-[10px] text-red-700 font-bold whitespace-nowrap w-fit">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        SPECIAL OFFER
                      </span>
                    )}
                  </>
                )}
                {service.priceVaries && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[9px] sm:text-[10px] text-amber-700 font-medium">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Price varies - consultation required
                  </span>
                )}
                {/* Duration */}
                {service.variants && service.variants.length > 0 && (
                  <div className="flex items-center gap-0.5 sm:gap-1 text-gray-600 text-[9px] sm:text-xs">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-gray-500"
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

              {/* Select/Selected Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
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
                className={`px-2 sm:px-6 py-1 sm:py-2 text-[10px] sm:text-sm font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-250 whitespace-nowrap flex-shrink-0 w-auto flex items-center gap-1 sm:gap-2 ${
                  isSelected
                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                    : "bg-black hover:bg-gray-800 text-white"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
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
                {isSelected
                  ? "Selected"
                  : service.variants && service.variants.length > 1
                  ? "Select"
                  : "Select"}
              </button>
            </div>

            {/* Variants - Hidden by default, can be shown on hover or click if needed */}
            {Array.isArray(service.variants) &&
              service.variants.length > 0 &&
              false && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto justify-end">
                  {service.variants.map((v) => (
                    <span
                      key={v.name}
                      className="inline-flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-gray-700 font-semibold shadow-sm hover:bg-brand-50 transition-colors whitespace-nowrap"
                    >
                      {v.price && (
                        <span className="flex items-center gap-0.5 text-brand-700 font-bold">
                          <span className="text-sm sm:text-base">
                            {"\u00A3"}
                          </span>
                          <span className="text-xs sm:text-sm">
                            {Number(v.price).toFixed(2)}
                          </span>
                        </span>
                      )}
                      {v.durationMin && (
                        <span className="flex items-center gap-0.5 sm:gap-1 text-gray-500">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-brand-600"
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
                          <span className="text-xs sm:text-sm">
                            {v.durationMin} min
                          </span>
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
          </div>
        </div>
      </Card>

      {/* Variants Modal */}
      <Modal
        open={showVariantsModal}
        onClose={() => setShowVariantsModal(false)}
        title={`Select ${service.name} Option`}
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
