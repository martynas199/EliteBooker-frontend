/**
 * ProductsPage - Enhanced Interactive Experience
 *
 * Features:
 * 1. Grid/List View Toggle - Switch between grid and list layouts
 * 2. Quick View on Hover - Quick view button appears on product hover
 * 3. Wishlist/Favorites - Heart icon to save products (stored in localStorage)
 * 4. Price Range Slider - Interactive dual-range slider for price filtering
 * 5. Product Comparison - Compare up to 4 products side-by-side
 * 6. Active Filter Chips - Visible chips above products for easy removal
 * 7. Animated Results Count - Count animates when filters change
 * 8. Staggered Loading - Skeleton loaders with stagger animation
 * 9. Back to Top Button - Floating button appears when scrolling down
 * 10. Load More/Pagination - Progressive loading with "Load More" button
 * 11. Smooth Sort Animation - Products animate when sorting changes
 * 12. Hover Effects - Enhanced hover states with quick actions
 */

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { api } from "../../shared/lib/apiClient";
import { useAuth } from "../../shared/contexts/AuthContext";
import { toggleWishlist as toggleWishlistAPI } from "./wishlist.api";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import SEOHead from "../../shared/components/seo/SEOHead";
import { generateBreadcrumbSchema } from "../../shared/utils/schemaGenerator";

// Lazy load ProductDetailModal (only loads when user clicks a product)
const ProductDetailModal = lazy(() =>
  import("../components/ProductDetailModal")
);

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [heroImage, setHeroImage] = useState(null);
  const [heroPosition, setHeroPosition] = useState("center");
  const [heroZoom, setHeroZoom] = useState(100);

  // Filters and sorting
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 1000 });
  const [maxPrice, setMaxPrice] = useState(1000);
  const [priceFilterActive, setPriceFilterActive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // New interactive features
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [itemsToShow, setItemsToShow] = useState(12);
  const [prevFilteredCount, setPrevFilteredCount] = useState(0);

  const productsGridRef = useRef(null);

  // Embla carousel for brands with autoplay
  const autoplayOptions = {
    delay: 2500,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    playOnInit: true,
  };

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      skipSnaps: false,
      containScroll: "trimSnaps",
      duration: 25,
      dragFree: false,
      inViewThreshold: 0.7,
    },
    [Autoplay(autoplayOptions)]
  );

  useEffect(() => {
    loadProducts();
    loadHeroImage();
    if (isAuthenticated && token) {
      loadWishlist();
    }

    // Check for brand query parameter
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      setSelectedBrand(brandParam);
    }

    // Scroll listener for back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated, token, searchParams]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [
    products,
    selectedCategory,
    selectedBrand,
    sortBy,
    searchQuery,
    priceRange,
  ]);

  useEffect(() => {
    // Paginate displayed products
    setDisplayedProducts(filteredProducts.slice(0, itemsToShow));
  }, [filteredProducts, itemsToShow]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products");
      const productsData = response.data || [];
      setProducts(productsData);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(productsData.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);

      // Extract unique brands
      const uniqueBrands = [
        ...new Set(
          productsData
            .map((p) => p.brand)
            .filter((brand) => brand && brand.trim() !== "")
        ),
      ].sort();
      setBrands(uniqueBrands);

      // Calculate price range
      if (productsData.length > 0) {
        const prices = productsData.flatMap((p) => {
          if (p.variants && p.variants.length > 0) {
            return p.variants.map((v) => v.price);
          }
          return [p.price];
        });
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setPriceRange({ min, max });
        setTempPriceRange({ min, max });
        setMaxPrice(max);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadHeroImage = async () => {
    try {
      const response = await api.get("/settings");
      setHeroImage(response.data?.productsHeroImage?.url || null);
      setHeroPosition(response.data?.productsHeroImage?.position || "center");
      setHeroZoom(response.data?.productsHeroImage?.zoom || 100);
    } catch (error) {
      console.error("Failed to load hero image:", error);
    }
  };

  const loadWishlist = async () => {
    if (!isAuthenticated || !token) {
      setWishlist([]);
      return;
    }

    try {
      const response = await api.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const wishlistIds = response.data.wishlist.map((item) => item._id);
      setWishlist(wishlistIds);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setWishlist([]);
    }
  };

  const toggleWishlist = async (productId) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your wishlist");
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    try {
      const response = await toggleWishlistAPI(token, productId);

      // Update local state based on server response
      if (response.inWishlist) {
        setWishlist((prev) => [...prev, productId]);
        toast.success("Added to wishlist");
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error(error.response?.data?.error || "Failed to update wishlist");
    }
  };

  const toggleCompare = (productId) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        if (prev.length >= 4) {
          toast.error("You can compare up to 4 products");
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand !== "all") {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter((p) => {
      let productPrice = p.price;
      if (p.variants && p.variants.length > 0) {
        const prices = p.variants.map((v) => v.price);
        productPrice = Math.min(...prices);
      }
      return productPrice >= priceRange.min && productPrice <= priceRange.max;
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA =
            a.variants?.length > 0
              ? Math.min(...a.variants.map((v) => v.price))
              : a.price;
          const priceB =
            b.variants?.length > 0
              ? Math.min(...b.variants.map((v) => v.price))
              : b.price;
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA =
            a.variants?.length > 0
              ? Math.max(...a.variants.map((v) => v.price))
              : a.price;
          const priceB =
            b.variants?.length > 0
              ? Math.max(...b.variants.map((v) => v.price))
              : b.price;
          return priceB - priceA;
        });
        break;
      case "name-az":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-za":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setPrevFilteredCount(filteredProducts.length);
    setFilteredProducts(filtered);
    setItemsToShow(12); // Reset pagination
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSortBy("featured");
    setSearchQuery("");
    setTempPriceRange({ min: 0, max: maxPrice });
    setPriceRange({ min: 0, max: maxPrice });
    setPriceFilterActive(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadMoreProducts = () => {
    setItemsToShow((prev) => prev + 12);
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  };

  const getProductPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      return Math.min(...product.variants.map((v) => v.price));
    }
    return product.price;
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedBrand !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (sortBy !== "featured" ? 1 : 0) +
    (priceFilterActive ? 1 : 0);

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Beauty Products Catalog", url: "/products" },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Beauty Products Wisbech | Premium Skincare & Cosmetics - Noble Elegance"
        description="Shop premium beauty products at Noble Elegance Wisbech. Professional skincare, makeup, hair care & beauty tools. Free delivery over £50. Browse now!"
        keywords="beauty products Wisbech, buy cosmetics online, professional beauty products, skincare products Cambridgeshire, makeup shop Wisbech, beauty store March, hair care products, beauty supplies Wisbech"
        schema={breadcrumbSchema}
      />

      {/* Modern Elegant Hero Section */}
      <section
        className="relative overflow-hidden -mt-20 md:-mt-24 bg-center bg-no-repeat"
        style={{
          backgroundImage: heroImage
            ? `url(${heroImage})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "450px",
        }}
      >
        <style jsx>{`
          section {
            background-size: cover;
          }
          @media (min-width: 768px) {
            section {
              background-size: 100% 100%;
            }
          }
        `}</style>
        {/* Modern Gradient Overlay - Better for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-black/80"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8 flex items-center gap-2 text-white/70 text-xs sm:text-sm"
          >
            <span className="hover:text-white transition-colors cursor-pointer">
              Home
            </span>
            <span>/</span>
            <span className="text-white font-medium">Products</span>
          </motion.div>

          <div className="text-left max-w-3xl">
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 text-white leading-tight"
            >
              Premium Beauty Products
            </motion.h1>

            {/* Subtitle with accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="h-0.5 sm:h-1 w-12 sm:w-16 bg-brand-400 rounded-full"></div>
                <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-brand-300">
                  Curated Luxury Beauty
                </p>
              </div>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl">
                Experience the finest selection of premium beauty products.{" "}
                Discover professional skincare, luxury cosmetics, and beauty
                essentials. Complement your{" "}
                <a
                  href="/beauticians"
                  className="text-brand-300 hover:text-brand-200 underline transition-colors"
                >
                  beauty treatments
                </a>{" "}
                with our curated products.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Browse products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-100 border-0 rounded-2xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all flex items-center justify-center gap-2"
              aria-label="Toggle filters"
            >
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Grid/List View Toggle */}
            <div className="hidden md:flex gap-1 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-brand-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Grid view"
              >
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-brand-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="List view"
              >
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Brand Showcase Carousel */}
        {brands.length > 0 && (
          <div className="mb-8 py-6 border-t border-b border-gray-200">
            <div className="relative">
              {/* Gradient overlays */}
              <div
                className="absolute left-0 top-0 bottom-0 w-12 md:w-20 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to right, white, transparent)",
                }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-12 md:w-20 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to left, white, transparent)",
                }}
              />

              {/* Embla Carousel */}
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6 md:gap-8">
                  {/* Triple the brands for smooth infinite scroll */}
                  {[...Array(3)].flatMap((_, setIndex) =>
                    brands.map((brand, brandIndex) => (
                      <div
                        key={`brand-${setIndex}-${brandIndex}`}
                        className="flex-[0_0_auto] min-w-fit"
                      >
                        <button
                          onClick={() => setSelectedBrand(brand)}
                          className={`block px-3 py-2 md:px-8 md:py-4 text-base md:text-2xl font-serif font-semibold whitespace-nowrap transition-colors ${
                            selectedBrand === brand
                              ? "text-brand-600"
                              : "text-black hover:text-brand-500"
                          }`}
                        >
                          {brand}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all appearance-none bg-white cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all appearance-none bg-white cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="all">All Brands</option>
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all appearance-none bg-white cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-az">Name: A-Z</option>
                      <option value="name-za">Name: Z-A</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>

                {/* Price Range Inputs */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Min
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          £
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={tempPriceRange.max - 1}
                          value={tempPriceRange.min}
                          onChange={(e) => {
                            const value = Math.max(
                              0,
                              Math.min(
                                Number(e.target.value),
                                tempPriceRange.max - 1
                              )
                            );
                            setTempPriceRange((prev) => ({
                              ...prev,
                              min: value,
                            }));
                            setPriceRange((prev) => ({
                              ...prev,
                              min: value,
                            }));
                            setPriceFilterActive(true);
                          }}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <span className="text-gray-400 mt-6">−</span>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Max
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          £
                        </span>
                        <input
                          type="number"
                          min={tempPriceRange.min + 1}
                          max={maxPrice}
                          value={tempPriceRange.max}
                          onChange={(e) => {
                            const value = Math.max(
                              tempPriceRange.min + 1,
                              Math.min(Number(e.target.value), maxPrice)
                            );
                            setTempPriceRange((prev) => ({
                              ...prev,
                              max: value,
                            }));
                            setPriceRange((prev) => ({
                              ...prev,
                              max: value,
                            }));
                            setPriceFilterActive(true);
                          }}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Filters & Clear Button */}
                {activeFiltersCount > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600">
                        Active filters:
                      </span>
                      {selectedCategory !== "all" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-full">
                          {selectedCategory}
                          <button
                            onClick={() => setSelectedCategory("all")}
                            className="hover:text-brand-900"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedBrand !== "all" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-full">
                          {selectedBrand}
                          <button
                            onClick={() => setSelectedBrand("all")}
                            className="hover:text-brand-900"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-full">
                          "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery("")}
                            className="hover:text-brand-900"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {priceFilterActive && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-full">
                          £{priceRange.min}-£{priceRange.max}
                          <button
                            onClick={() => {
                              setTempPriceRange({ min: 0, max: maxPrice });
                              setPriceRange({ min: 0, max: maxPrice });
                              setPriceFilterActive(false);
                            }}
                            className="hover:text-brand-900"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Chips - Above Products */}
        {activeFiltersCount > 0 && !showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory !== "all" && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 text-sm rounded-full"
                >
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="hover:text-brand-900 ml-1"
                  >
                    ×
                  </button>
                </motion.span>
              )}
              {selectedBrand !== "all" && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 text-sm rounded-full"
                >
                  Brand: {selectedBrand}
                  <button
                    onClick={() => setSelectedBrand("all")}
                    className="hover:text-brand-900 ml-1"
                  >
                    ×
                  </button>
                </motion.span>
              )}
              {searchQuery && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 text-sm rounded-full"
                >
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-brand-900 ml-1"
                  >
                    ×
                  </button>
                </motion.span>
              )}
              {priceFilterActive && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 text-sm rounded-full"
                >
                  £{priceRange.min}-£{priceRange.max}
                  <button
                    onClick={() => {
                      setTempPriceRange({ min: 0, max: maxPrice });
                      setPriceRange({ min: 0, max: maxPrice });
                      setPriceFilterActive(false);
                    }}
                    className="hover:text-brand-900 ml-1"
                  >
                    ×
                  </button>
                </motion.span>
              )}
            </div>
          </motion.div>
        )}

        {/* Results Count with Animation */}
        <div className="mb-6 flex items-center justify-between">
          <motion.p
            key={filteredProducts.length}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600"
          >
            Showing{" "}
            <motion.span
              key={`count-${filteredProducts.length}`}
              initial={{ scale: 1.2, color: "#76540E" }}
              animate={{ scale: 1, color: "#000" }}
              transition={{ duration: 0.3 }}
              className="font-semibold"
            >
              {displayedProducts.length}
            </motion.span>
            {filteredProducts.length > itemsToShow && (
              <>
                {" "}
                of{" "}
                <span className="font-semibold">{filteredProducts.length}</span>
              </>
            )}{" "}
            products
          </motion.p>

          {compareList.length > 0 && (
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Compare ({compareList.length})
            </button>
          )}
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "w-full h-64 bg-gray-200"
                      : "flex gap-4 p-4"
                  }
                >
                  {viewMode === "list" && (
                    <>
                      <div className="w-32 h-32 bg-gray-200 rounded" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </>
                  )}
                  {viewMode === "grid" && (
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              ref={productsGridRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              <AnimatePresence mode="popLayout">
                {displayedProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.03, 0.5),
                    }}
                    layout
                    className="relative group"
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {viewMode === "grid" ? (
                      <div className="relative">
                        <ProductCard
                          product={product}
                          onClick={() => handleProductClick(product)}
                        />

                        {/* Wishlist, Quick View, Compare - Overlay Actions */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                          {/* Wishlist Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product._id);
                            }}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                            aria-label="Add to wishlist"
                          >
                            <svg
                              className={`w-5 h-5 transition-colors ${
                                wishlist.includes(product._id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-600"
                              }`}
                              fill={
                                wishlist.includes(product._id)
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </motion.button>

                          {/* Compare Checkbox */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(product._id);
                            }}
                            className={`w-10 h-10 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-colors ${
                              compareList.includes(product._id)
                                ? "bg-brand-600 text-white"
                                : "bg-white/90 text-gray-600 hover:bg-white"
                            }`}
                            aria-label="Add to compare"
                          >
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
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </motion.button>
                        </div>

                        {/* Quick View Button on Hover */}
                        <AnimatePresence>
                          {hoveredProduct === product._id && (
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(product);
                              }}
                              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-6 py-2.5 bg-brand-600 text-white rounded-lg shadow-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                            >
                              Quick View
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* List View */
                      <motion.div
                        onClick={() => handleProductClick(product)}
                        className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer p-4 flex gap-4"
                      >
                        <img
                          src={product.image?.url}
                          alt={product.title}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {product.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-brand-600">
                              £{getProductPrice(product)}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(product._id);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <svg
                                  className={`w-5 h-5 ${
                                    wishlist.includes(product._id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-gray-600"
                                  }`}
                                  fill={
                                    wishlist.includes(product._id)
                                      ? "currentColor"
                                      : "none"
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompare(product._id);
                                }}
                                className={`p-2 rounded-full transition-colors ${
                                  compareList.includes(product._id)
                                    ? "bg-brand-600 text-white"
                                    : "hover:bg-gray-100 text-gray-600"
                                }`}
                              >
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
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {displayedProducts.length < filteredProducts.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 text-center"
              >
                <button
                  onClick={loadMoreProducts}
                  className="px-8 py-3 bg-white border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-all font-medium"
                >
                  Load More Products
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-colors"
            aria-label="Back to top"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold">
                  Compare Products
                </h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6"
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {compareList.map((productId) => {
                  const product = products.find((p) => p._id === productId);
                  if (!product) return null;

                  return (
                    <div
                      key={product._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="relative">
                        <img
                          src={product.image?.url}
                          alt={product.title}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                        <button
                          onClick={() => removeFromCompare(product._id)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 text-red-600"
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
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {product.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold text-brand-600 ml-2">
                            £{getProductPrice(product)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2">
                            {product.category || "N/A"}
                          </span>
                        </div>
                        {product.variants && product.variants.length > 0 && (
                          <div>
                            <span className="text-gray-600">Sizes:</span>
                            <span className="ml-2">
                              {product.variants.length} available
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          handleProductClick(product);
                          setShowComparison(false);
                        }}
                        className="w-full mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setCompareList([])}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {modalOpen && selectedProduct && (
          <Suspense fallback={<div />}>
            <ProductDetailModal
              product={selectedProduct}
              isOpen={modalOpen}
              onClose={handleCloseModal}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
