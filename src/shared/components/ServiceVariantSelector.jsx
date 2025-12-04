import { useState } from "react";
import Card from "./ui/Card";

export default function ServiceVariantSelector({
  service,
  onVariantSelect,
  onCancel,
  selectedBeautician,
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleConfirm = () => {
    if (selectedVariant && onVariantSelect) {
      onVariantSelect(selectedVariant, service);
    } else if (!service.variants?.length) {
      const fallbackVariant = {
        name: "Standard Service",
        price: service.price,
        durationMin: service.durationMin,
        bufferBeforeMin: 0,
        bufferAfterMin: 10,
      };
      onVariantSelect(fallbackVariant, service);
    }
  };

  const imageUrl = service.image?.url || service.imageUrl;
  const imageAlt = service.image?.alt || service.name;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto"
      onClick={onCancel}
    >
      <div
        className="bg-white sm:rounded-xl shadow-2xl w-full sm:w-auto sm:min-w-[640px] sm:max-w-2xl h-full sm:h-auto my-0 sm:my-8 flex flex-col max-h-full sm:max-h-[calc(100vh-4rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                {imageUrl && (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-serif font-bold text-gray-900 mb-1 truncate">
                    {service.name}
                  </h2>
                  {service.category && (
                    <div className="text-brand-600 text-xs sm:text-sm font-medium uppercase tracking-wide truncate">
                      {service.category}
                    </div>
                  )}
                </div>
              </div>

              {selectedBeautician && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {selectedBeautician.image?.url ? (
                      <img
                        src={selectedBeautician.image.url}
                        alt={selectedBeautician.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="truncate">
                    with {selectedBeautician.name}
                  </span>
                </div>
              )}

              {service.description && (
                <div>
                  <p
                    className={`text-gray-600 text-xs sm:text-sm mb-0 leading-relaxed ${
                      isDescriptionExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {service.description}
                  </p>
                  {!isDescriptionExpanded &&
                    service.description.length > 100 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(true)}
                        className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 mt-0 text-xs"
                      >
                        <span>Read more</span>
                        <svg
                          className="w-3 h-3"
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
                      </button>
                    )}
                  {isDescriptionExpanded &&
                    service.description.length > 100 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(false)}
                        className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 mt-1 text-xs"
                      >
                        <span>Show less</span>
                        <svg
                          className="w-3 h-3 rotate-180"
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
                      </button>
                    )}
                </div>
              )}
            </div>

            <button
              onClick={onCancel}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
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

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Choose Service Option
          </h3>

          {service.variants && service.variants.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {service.variants.map((variant, index) => (
                <Card
                  key={variant.name || index}
                  hoverable
                  className={`cursor-pointer border-2 transition-all duration-200 ${
                    selectedVariant?.name === variant.name
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-brand-300"
                  }`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {variant.name && (
                          <h4 className="font-semibold text-base text-gray-900 mb-1 truncate">
                            {variant.name}
                          </h4>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          {variant.durationMin && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-brand-600"
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
                              <span>{variant.durationMin} minutes</span>
                            </div>
                          )}

                          {variant.bufferBeforeMin > 0 && (
                            <div className="text-xs text-gray-500">
                              +{variant.bufferBeforeMin}min prep
                            </div>
                          )}

                          {variant.bufferAfterMin > 0 && (
                            <div className="text-xs text-gray-500">
                              +{variant.bufferAfterMin}min cleanup
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {variant.price && (
                          <div className="text-right">
                            {variant.promoPrice ? (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-300 rounded-full text-[10px] text-red-700 font-bold whitespace-nowrap">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    SPECIAL OFFER
                                  </span>
                                </div>
                                <div className="text-base font-medium text-gray-400 line-through">
                                  £{Number(variant.price).toFixed(2)}
                                </div>
                                <div className="text-2xl font-bold text-red-600">
                                  £{Number(variant.promoPrice).toFixed(2)}
                                </div>
                              </>
                            ) : (
                              <div className="text-2xl font-bold text-brand-700">
                                £{Number(variant.price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedVariant?.name === variant.name
                              ? "border-brand-500 bg-brand-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedVariant?.name === variant.name && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No service options configured. Using standard service.
              </p>
              <Card className="border-2 border-brand-300 bg-brand-50">
                <div className="p-4 text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Standard Service
                  </h4>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    {service.durationMin && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-brand-600"
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
                        <span>{service.durationMin} minutes</span>
                      </div>
                    )}
                    {service.price && (
                      <div className="text-xl font-bold text-brand-700">
                        £{Number(service.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={!selectedVariant && service.variants?.length > 0}
              className={
                selectedVariant || !service.variants?.length
                  ? "px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg order-1 sm:order-2"
                  : "px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 bg-gray-300 text-gray-500 cursor-not-allowed order-1 sm:order-2"
              }
            >
              <span className="hidden sm:inline">
                {selectedVariant || !service.variants?.length
                  ? "Continue to Time Selection"
                  : "Please select an option"}
              </span>
              <span className="sm:hidden">
                {selectedVariant || !service.variants?.length
                  ? "Continue"
                  : "Select option"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
