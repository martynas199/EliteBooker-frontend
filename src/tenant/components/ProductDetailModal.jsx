import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addToCart, openCart } from "../state/cartSlice";
import Button from "../../shared/components/ui/Button";
import { useCurrency } from "../../shared/contexts/CurrencyContext";

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch();
  const { formatPrice, currency, getPrice, getOriginalPrice } = useCurrency();
  const [expandedSections, setExpandedSections] = useState({
    benefits: false,
    howToUse: false,
    ingredients: false,
  });
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Check if product has variants
  const hasVariants = product?.variants && product.variants.length > 0;

  // Get all images (main + gallery)
  const allImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  // Get current variant or fallback to legacy fields
  const currentVariant = hasVariants
    ? product.variants[selectedVariantIndex]
    : null;

  // Use currency-aware pricing
  const displayPrice = currentVariant
    ? currency === "EUR" && currentVariant.priceEUR != null
      ? currentVariant.priceEUR
      : currentVariant.price
    : currency === "EUR" && product?.priceEUR != null
    ? product.priceEUR
    : product?.price ?? 0;

  const displayOriginalPrice = currentVariant
    ? currency === "EUR" && currentVariant.originalPriceEUR != null
      ? currentVariant.originalPriceEUR
      : currentVariant.originalPrice
    : currency === "EUR" && product?.originalPriceEUR != null
    ? product.originalPriceEUR
    : product?.originalPrice;

  const displayStock = currentVariant?.stock ?? product?.stock ?? 0;
  const displaySize = currentVariant?.size ?? product?.size;
  const hasDiscount =
    displayOriginalPrice && displayOriginalPrice > displayPrice;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Reset selected variant, image, and quantity when product changes
  useEffect(() => {
    setSelectedVariantIndex(0);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [product]);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantIndex]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[9999] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={onClose}>
        <div
          className="flex min-h-full items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Sticky within modal, always visible */}
            <div className="sticky top-0 right-0 z-10 flex justify-end p-4 pointer-events-none">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xl transition-all duration-200 pointer-events-auto"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6 text-gray-800"
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

            <div className="grid md:grid-cols-2 gap-8 px-8 pb-8 -mt-4">
              {/* Left: Product Image Gallery */}
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[selectedImageIndex]?.url}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-24 h-24"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded">
                      SALE
                    </div>
                  )}

                  {/* Navigation Arrows (if multiple images) */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === 0 ? allImages.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === allImages.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-800"
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
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-brand-600 ring-2 ring-brand-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${product.title} ${index + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Details */}
              <div className="space-y-6 pb-24 md:pb-6">
                {/* Category */}
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {product.category}
                </div>

                {/* Title and Share Button */}
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-wide flex-1">
                    {product.title}
                  </h2>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      const productUrl = `${window.location.origin}/products/${product._id}`;
                      const shareData = {
                        title: product.title,
                        text: `Check out ${product.title} at Elite Booker`,
                        url: productUrl,
                      };

                      // Try Web Share API (mobile)
                      if (navigator.share) {
                        navigator.share(shareData).catch(() => {
                          // User cancelled, do nothing
                        });
                      } else {
                        // Fallback: Copy to clipboard
                        navigator.clipboard
                          .writeText(productUrl)
                          .then(() => {
                            toast.success("Product link copied to clipboard!");
                          })
                          .catch(() => {
                            toast.error("Failed to copy link");
                          });
                      }
                    }}
                    className="flex-shrink-0 p-2 rounded-lg border-2 border-gray-300 hover:border-brand-600 hover:bg-brand-50 text-gray-600 hover:text-brand-600 transition-all group"
                    title="Share product"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: "#76540E" }}
                  >
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(displayOriginalPrice)}
                    </span>
                  )}
                  {!hasVariants && displaySize && (
                    <span className="text-sm text-gray-500">
                      • {displaySize}
                    </span>
                  )}
                </div>

                {/* Size Selector */}
                {hasVariants && product.variants.length > 1 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Select Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {product.variants.map((variant, index) => {
                        const variantPrice =
                          currency === "EUR" && variant.priceEUR != null
                            ? variant.priceEUR
                            : variant.price;

                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedVariantIndex(index)}
                            className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                              selectedVariantIndex === index
                                ? "border-brand-600 bg-brand-50 text-brand-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            } ${
                              variant.stock === 0
                                ? "opacity-50 cursor-not-allowed line-through"
                                : ""
                            }`}
                            disabled={variant.stock === 0}
                          >
                            <div className="text-sm">{variant.size}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatPrice(variantPrice)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Single Variant - Just show size */}
                {hasVariants &&
                  product.variants.length === 1 &&
                  displaySize && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Size
                      </label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 inline-block">
                        <span className="text-sm font-medium text-gray-700">
                          {displaySize}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Description */}
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Expandable Sections */}
                <div className="border-t border-gray-200">
                  {/* Key Benefits - Only show if there are actually benefits */}
                  {product.keyBenefits &&
                    product.keyBenefits.length > 0 &&
                    product.keyBenefits.some(
                      (benefit) => benefit && benefit.trim()
                    ) && (
                      <div className="border-b border-gray-200">
                        <button
                          onClick={() => toggleSection("benefits")}
                          className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Key Benefits
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              expandedSections.benefits ? "rotate-180" : ""
                            }`}
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
                        {expandedSections.benefits && (
                          <div className="pb-4 px-1 animate-fadeIn">
                            <ul className="space-y-3">
                              {product.keyBenefits
                                .filter((benefit) => benefit && benefit.trim())
                                .map((benefit, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <svg
                                      className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-gray-700">
                                      {benefit}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                  {/* How to Apply */}
                  {product.howToApply && (
                    <div className="border-b border-gray-200">
                      <button
                        onClick={() => toggleSection("howToUse")}
                        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          How to Use
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedSections.howToUse ? "rotate-180" : ""
                          }`}
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
                      {expandedSections.howToUse && (
                        <div className="pb-4 px-1 animate-fadeIn">
                          <p className="text-gray-700 leading-relaxed">
                            {product.howToApply}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Ingredients */}
                  {product.ingredients && (
                    <div className="border-b border-gray-200">
                      <button
                        onClick={() => toggleSection("ingredients")}
                        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Key Ingredients
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedSections.ingredients ? "rotate-180" : ""
                          }`}
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
                      {expandedSections.ingredients && (
                        <div className="pb-4 px-1 animate-fadeIn">
                          <div className="space-y-4">
                            {/* Parse ingredients - assuming format "Title: Description" */}
                            {product.ingredients
                              .split("\n\n")
                              .map((section, idx) => {
                                const [title, ...descParts] =
                                  section.split("\n");
                                const description = descParts.join(" ");

                                return (
                                  <div key={idx}>
                                    <h4 className="font-bold text-gray-900 mb-1">
                                      {title}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      {description}
                                    </p>
                                  </div>
                                );
                              })}
                          </div>

                          {/* Full ingredient list if available */}
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Full Ingredient List
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {product.ingredients}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="border-t border-gray-200 pt-6">
                  {displayStock > 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">In Stock</span>
                      {displayStock < 10 && (
                        <span className="text-sm text-gray-600">
                          (Only {displayStock} left)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                {displayStock > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-brand-600 hover:text-brand-600 transition-colors"
                        disabled={quantity <= 1}
                      >
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
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={displayStock}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(Math.max(1, val), displayStock));
                        }}
                        className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-brand-600 focus:ring-2 focus:ring-brand-200 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(displayStock, q + 1))
                        }
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-brand-600 hover:text-brand-600 transition-colors"
                        disabled={quantity >= displayStock}
                      >
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button - Hidden on mobile as we have sticky version */}
                <div className="hidden md:block">
                  <Button
                    onClick={async () => {
                      if (displayStock === 0) return;

                      setAddingToCart(true);
                      try {
                        const variantId = hasVariants
                          ? product.variants[selectedVariantIndex]._id
                          : null;

                        dispatch(
                          addToCart({
                            productId: product._id,
                            variantId,
                            quantity,
                            // Store product details for display
                            product: {
                              title: product.title,
                              image:
                                product.image?.url || product.images?.[0]?.url,
                              price: displayPrice,
                              size: displaySize,
                            },
                          })
                        );

                        // Show success feedback
                        await new Promise((resolve) =>
                          setTimeout(resolve, 300)
                        );

                        // Open cart sidebar
                        dispatch(openCart());

                        // Close modal
                        onClose();

                        toast.success("Added to cart successfully");
                      } catch (error) {
                        console.error("Error adding to cart:", error);
                        toast.error("Failed to add item to cart");
                      } finally {
                        setAddingToCart(false);
                      }
                    }}
                    variant="brand"
                    size="lg"
                    fullWidth
                    disabled={displayStock === 0 || addingToCart}
                    loading={addingToCart}
                  >
                    {displayStock > 0 ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Add to Cart
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sticky Add to Cart Button - Only visible on mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20">
              <Button
                onClick={async () => {
                  if (displayStock === 0) return;

                  setAddingToCart(true);
                  try {
                    const variantId = hasVariants
                      ? product.variants[selectedVariantIndex]._id
                      : null;

                    dispatch(
                      addToCart({
                        productId: product._id,
                        variantId,
                        quantity,
                        // Store product details for display
                        product: {
                          title: product.title,
                          image: product.image?.url || product.images?.[0]?.url,
                          price: displayPrice,
                          size: displaySize,
                        },
                      })
                    );

                    // Show success feedback
                    await new Promise((resolve) => setTimeout(resolve, 300));

                    // Open cart sidebar
                    dispatch(openCart());

                    // Close modal
                    onClose();

                    toast.success("Added to cart successfully");
                  } catch (error) {
                    console.error("Error adding to cart:", error);
                    toast.error("Failed to add item to cart");
                  } finally {
                    setAddingToCart(false);
                  }
                }}
                variant="brand"
                size="lg"
                fullWidth
                disabled={displayStock === 0 || addingToCart}
                loading={addingToCart}
              >
                {displayStock > 0 ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </>
                ) : (
                  "Out of Stock"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
