import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { OrdersAPI } from "./orders.api";
import { ProductsAPI } from "./products.api";
import { calculateShippingOptions } from "../../shared/utils/shippingCalculator";
import { clearCart } from "../state/cartSlice";
import Button from "../../shared/components/ui/Button";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function ProductCheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currency, formatPrice, convertPrice } = useCurrency();
  const cartItems = useSelector((state) => state.cart.items);

  // Check for multiple specialists in cart
  const specialists = new Set(
    cartItems
      .map(
        (item) => item.product?.specialistId?._id || item.product?.specialistId
      )
      .filter(Boolean)
  );
  const hasMultipleBeauticians = specialists.size > 1;

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [products, setProducts] = useState({});
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    notes: "",
  });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(" ") : ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Load product details when component mounts
  useEffect(() => {
    if (cartItems.length > 0) {
      loadProductDetails();
    }
  }, [cartItems]);

  // Calculate shipping when postal code/city changes and products are loaded
  useEffect(() => {
    if (
      formData.postalCode &&
      formData.postalCode.length >= 5 &&
      formData.city &&
      cartItems.length > 0 &&
      Object.keys(products).length > 0
    ) {
      calculateShippingCost();
    } else {
      // Reset shipping options if postal code/city is incomplete
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }, [formData.postalCode, formData.city, cartItems, products]);

  const loadProductDetails = async () => {
    setLoadingProducts(true);
    try {
      const productMap = {};
      for (const item of cartItems) {
        if (!productMap[item.productId]) {
          const product = await ProductsAPI.get(item.productId);
          productMap[item.productId] = product;
        }
      }
      setProducts(productMap);
    } catch (error) {
      console.error("Error loading product details:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateShippingCost = async () => {
    setLoadingShipping(true);
    try {
      // Prepare items with weights for shipping calculation
      const itemsWithWeights = cartItems.map((item) => {
        const product = products[item.productId];

        // Get weight from variant or product
        let weight = 0;
        if (item.variantId && product?.variants) {
          const variant = product.variants.find(
            (v) => v._id === item.variantId
          );
          weight = variant?.weight || 0;
        } else {
          weight = product?.weight || 0;
        }

        // Convert grams to kilograms
        const weightInKg = weight / 1000 || 0.1; // Default to 100g if no weight

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          weight: weightInKg,
          productName: product?.title || "Unknown",
          weightInGrams: weight,
        };
      });

      // Calculate total weight for logging
      const totalWeight = itemsWithWeights.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      );

      console.log(
        "📦 Cart items with weights:",
        itemsWithWeights.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          weightPerItem: `${item.weightInGrams}g (${item.weight}kg)`,
          totalWeight: `${(item.weight * item.quantity).toFixed(3)}kg`,
        }))
      );

      console.log("⚖️ Total cart weight:", totalWeight.toFixed(3), "kg");

      console.log("📮 Shipping calculation:", {
        currency: currency,
        country: formData.country,
        itemCount: itemsWithWeights.length,
      });

      // Calculate shipping locally (no backend call needed)
      const result = calculateShippingOptions({
        items: itemsWithWeights,
        currency: currency, // EUR triggers EU rates, GBP triggers UK rates
        countryCode: formData.country === "United Kingdom" ? "GB" : "GB",
      });

      console.log("🚚 Shipping options calculated:", result);
      console.log("🚚 Number of options:", result.options?.length);
      console.log(
        "🚚 Options details:",
        JSON.stringify(result.options, null, 2)
      );

      if (result.options && result.options.length > 0) {
        setShippingOptions(result.options);
        // Auto-select the first (usually cheapest) option
        setSelectedShipping(result.options[0]);
      } else {
        // Fallback
        setShippingOptions([
          {
            id: "standard",
            name: "Standard Shipping",
            price: 4.99,
            estimatedDays: "3-5 business days",
            description: "Standard delivery",
          },
        ]);
        setSelectedShipping({
          id: "standard",
          name: "Standard Shipping",
          price: 4.99,
          estimatedDays: "3-5 business days",
          description: "Standard delivery",
        });
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
      // Fallback to default shipping
      const fallbackOption = {
        id: "standard",
        name: "Standard Shipping",
        price: 4.99,
        estimatedDays: "3-5 business days",
        description: "Standard delivery",
      };
      setShippingOptions([fallbackOption]);
      setSelectedShipping(fallbackOption);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  // Use selected shipping option price
  const shipping = selectedShipping?.price || 0;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
      }));

      // Create Stripe checkout session
      const response = await OrdersAPI.createCheckout({
        items: orderItems,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        isCollection: selectedShipping?.isCollection || false, // Flag if customer is collecting in person
        shippingMethod: selectedShipping
          ? {
              id: selectedShipping.id,
              name: selectedShipping.name,
              price: selectedShipping.price,
              estimatedDays: selectedShipping.estimatedDays,
            }
          : null,
        notes: formData.notes,
        currency: currency, // Use selected currency from context
        ...(user ? { userId: user._id } : {}), // Add userId if logged in
      });

      // Clear cart before redirecting to Stripe
      dispatch(clearCart());

      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to create checkout session. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before checking out
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  // Show error if multiple specialists in cart
  if (hasMultipleBeauticians) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <svg
            className="w-24 h-24 text-amber-500 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Multiple Sellers in Cart
          </h2>
          <p className="text-gray-600 mb-4">
            Your cart contains products from {specialists.size} different
            sellers.
          </p>
          <p className="text-gray-600 mb-6">
            Please checkout separately for each seller. Remove items from one
            seller to continue with the other.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
            <Button variant="outline" onClick={() => navigate("/cart")}>
              View Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Product Checkout - Noble Elegance"
        description="Complete your product order at Noble Elegance Beauty Salon."
        noindex={true}
      />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 overflow-x-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 break-words">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="overflow-x-hidden">
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Left: Shipping Form */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Shipping Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 break-words">
                    Shipping Information
                  </h2>

                  {/* Collection Notice */}
                  {selectedShipping?.isCollection && (
                    <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-red-600 mb-1">
                            Collect in Person
                          </h3>
                          <p className="text-sm text-gray-800 mb-1">
                            Your order will be ready for collection at:
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            12 Blackfriars Rd, PE13 1AT
                          </p>
                          <p className="text-xs text-gray-700 mt-2">
                            We'll notify you when your order is ready to
                            collect.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="+44 7700 900000"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Address {!selectedShipping?.isCollection && "*"}
                      </label>
                      <input
                        type="text"
                        required={!selectedShipping?.isCollection}
                        autoComplete="street-address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder={
                          selectedShipping?.isCollection
                            ? "Optional for collection"
                            : "123 Main Street, Apt 4B"
                        }
                        disabled={selectedShipping?.isCollection}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        City {!selectedShipping?.isCollection && "*"}
                      </label>
                      <input
                        type="text"
                        required={!selectedShipping?.isCollection}
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder={
                          selectedShipping?.isCollection
                            ? "Optional for collection"
                            : "London"
                        }
                        disabled={selectedShipping?.isCollection}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Postal Code {!selectedShipping?.isCollection && "*"}
                      </label>
                      <input
                        type="text"
                        required={!selectedShipping?.isCollection}
                        autoComplete="postal-code"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder={
                          selectedShipping?.isCollection
                            ? "Optional for collection"
                            : "SW1A 1AA"
                        }
                        disabled={selectedShipping?.isCollection}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Country *
                      </label>
                      <select
                        required
                        autoComplete="country-name"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none bg-white"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Lithuania">Lithuania</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        placeholder="Special delivery instructions..."
                      />
                    </div>
                  </div>

                  {/* Sign-in prompt for guests */}
                  {!user && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">ℹ️</span>
                        <div>
                          <span className="text-gray-700">
                            <Link
                              to="/login"
                              state={{ from: location.pathname }}
                              className="text-brand-600 hover:text-brand-700 font-medium underline"
                            >
                              Sign in
                            </Link>{" "}
                            or{" "}
                            <Link
                              to="/register"
                              state={{ from: location.pathname }}
                              className="text-brand-600 hover:text-brand-700 font-medium underline"
                            >
                              create an account
                            </Link>{" "}
                            to track your orders and easily reorder in the
                            future.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Place Order Button - Mobile (Sticky at bottom) */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    loading={loading}
                    disabled={loading}
                    className="w-full py-4 text-lg"
                  >
                    {loading
                      ? "Processing..."
                      : `Place Order • ${formatPrice(total)}`}
                  </Button>
                </div>

                {/* Spacer for mobile button */}
                <div className="lg:hidden h-20"></div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1 order-first lg:order-last mb-4 lg:mb-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-8 overflow-hidden">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 break-words">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-4 sm:mb-6 max-h-60 sm:max-h-80 overflow-y-auto overflow-x-hidden">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-3"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.product?.image?.url || item.product?.image ? (
                          <img
                            src={item.product.image?.url || item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 break-words line-clamp-2">
                          {item.product?.title}
                        </h3>
                        {item.product?.size && (
                          <p className="text-xs text-gray-500 break-words">
                            {item.product.size}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(
                            (item.product?.price || 0) * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Options Selector */}
                {shippingOptions.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Shipping Method
                    </h3>

                    {loadingShipping ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                        <span className="ml-2 text-xs text-gray-600">
                          Loading options...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {shippingOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedShipping(option)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedShipping?.id === option.id
                                ? "border-brand-600 bg-brand-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-2 flex-1">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                    selectedShipping?.id === option.id
                                      ? "border-brand-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedShipping?.id === option.id && (
                                    <div className="w-2 h-2 rounded-full bg-brand-600"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-gray-900 break-words">
                                      {option.name}
                                    </h4>
                                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                      {formatPrice(option.price)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 break-words">
                                    {option.estimatedDays}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <div className="text-right">
                      {loadingShipping ? (
                        <span className="text-gray-500 text-xs">
                          Calculating...
                        </span>
                      ) : selectedShipping ? (
                        <div>
                          <span className="font-medium">
                            {formatPrice(selectedShipping.price)}
                          </span>
                          <div className="text-xs text-gray-500">
                            {selectedShipping.name}
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-500">
                          Select shipping
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total
                      </span>
                      <span
                        className="text-xl font-bold"
                        style={{ color: "#76540E" }}
                      >
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {!loadingShipping &&
                  shippingOptions.length === 0 &&
                  (formData.postalCode.length < 5 || !formData.city) && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800">
                        📮 Enter city and postal code to see shipping options
                      </p>
                    </div>
                  )}

                {!loadingShipping &&
                  selectedShipping &&
                  shippingOptions.length > 1 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 {shippingOptions.length} shipping options available
                      </p>
                    </div>
                  )}

                {/* Place Order Button - Desktop */}
                <div className="hidden lg:block mt-6">
                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    loading={loading}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading
                      ? "Processing..."
                      : `Place Order • ${formatPrice(total)}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
