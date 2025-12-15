import { useCurrency } from "../../shared/contexts/CurrencyContext";
import toast from "react-hot-toast";
import OptimizedImage from "../../shared/components/OptimizedImage";

export default function ProductCard({ product, onClick }) {
  const { formatPrice, getPrice, getOriginalPrice, currency } = useCurrency();

  const handleShare = (e) => {
    e.stopPropagation(); // Always prevent opening modal

    const productUrl = `${window.location.origin}/products/${product._id}`;
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} at Noble Elegance`,
      url: productUrl,
    };

    // Try Web Share API (mobile)
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // User cancelled, do nothing
      });
    } else {
      // Fallback: Copy to clipboard (desktop)
      navigator.clipboard
        .writeText(productUrl)
        .then(() => {
          toast.success("Product link copied!");
        })
        .catch(() => {
          toast.error("Failed to copy link");
        });
    }
  };

  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;

  // Calculate price display based on variants and currency
  let displayPrice, displayOriginalPrice, hasDiscount, showPriceRange;

  if (hasVariants) {
    // Get prices for current currency
    const prices = product.variants.map((v) =>
      currency === "EUR" && v.priceEUR != null ? v.priceEUR : v.price
    );
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    showPriceRange = prices.length > 1 && minPrice !== maxPrice;

    displayPrice = showPriceRange ? minPrice : prices[0];

    // Check if any variant has a discount for current currency
    const variantsWithDiscount = product.variants.filter((v) => {
      const price =
        currency === "EUR" && v.priceEUR != null ? v.priceEUR : v.price;
      const originalPrice =
        currency === "EUR" && v.originalPriceEUR != null
          ? v.originalPriceEUR
          : v.originalPrice;
      return originalPrice && originalPrice > price;
    });
    hasDiscount = variantsWithDiscount.length > 0;

    if (hasDiscount && !showPriceRange) {
      const firstVariant = product.variants[0];
      displayOriginalPrice =
        currency === "EUR" && firstVariant.originalPriceEUR != null
          ? firstVariant.originalPriceEUR
          : firstVariant.originalPrice;
    }
  } else {
    // Fallback to legacy fields with currency selection
    displayPrice =
      currency === "EUR" && product.priceEUR != null
        ? product.priceEUR
        : product.price;
    displayOriginalPrice =
      currency === "EUR" && product.originalPriceEUR != null
        ? product.originalPriceEUR
        : product.originalPrice;
    hasDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice;
    showPriceRange = false;
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-250 cursor-pointer group"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image?.url ? (
          <OptimizedImage
            src={product.image.url}
            alt={`${product.title} - ${
              product.brand || "Premium beauty product"
            } available at Noble Elegance Beauty Salon Wisbech`}
            preset="productCard"
            responsive
            sizes={{
              "(max-width: 640px)": "50vw",
              "(max-width: 1024px)": "33vw",
              default: "25vw",
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
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

        {/* Share Button - appears on hover (desktop only) */}
        <button
          onClick={handleShare}
          className="hidden md:block absolute top-2 left-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 transform"
          title="Share product"
        >
          <svg
            className="w-4 h-4 text-gray-700"
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

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-base font-serif font-semibold text-gray-900 mb-2 line-clamp-2 tracking-wide">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: "#76540E" }}>
            {showPriceRange && "from "}
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && !showPriceRange && displayOriginalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(displayOriginalPrice)}
            </span>
          )}
        </div>

        {/* Sizes available */}
        {hasVariants && product.variants.length > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            {product.variants.length} sizes available
          </p>
        )}
        {hasVariants &&
          product.variants.length === 1 &&
          product.variants[0].size && (
            <p className="text-xs text-gray-500 mt-1">
              {product.variants[0].size}
            </p>
          )}
        {!hasVariants && product.size && (
          <p className="text-xs text-gray-500 mt-1">{product.size}</p>
        )}
      </div>
    </div>
  );
}
