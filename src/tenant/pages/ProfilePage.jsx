import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/contexts/AuthContext";
import { getUserBookings, getUserOrders, cancelBooking } from "./profile.api";
import { getWishlist, removeFromWishlist } from "./wishlist.api";
import {
  getFavorites,
  removeFromFavorites,
} from "../../shared/api/favorites.api";
import {
  getPurchasedGiftCards,
  getReceivedGiftCards,
} from "../../shared/api/giftCards.api";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import Chip from "../../shared/components/ui/Chip";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../shared/components/ui/PageTransition";
import { ListSkeleton } from "../../shared/components/ui/Skeleton";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const {
    user,
    token,
    logout,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [purchasedGiftCards, setPurchasedGiftCards] = useState([]);
  const [receivedGiftCards, setReceivedGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const [error, setError] = useState("");
  const [dataFetched, setDataFetched] = useState(false);

  // Redirect if not authenticated (but wait for auth to finish loading first)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch data on mount only (wait for auth loading to complete)
  useEffect(() => {
    if (!authLoading && isAuthenticated && token && !dataFetched) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, token, dataFetched]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        bookingsData,
        ordersData,
        wishlistData,
        favoritesData,
        purchasedData,
        receivedData,
      ] = await Promise.all([
        getUserBookings(token),
        getUserOrders(token),
        getWishlist(token),
        getFavorites().catch(() => ({ favorites: [] })),
        getPurchasedGiftCards().catch(() => ({ giftCards: [] })),
        getReceivedGiftCards().catch(() => ({ giftCards: [] })),
      ]);
      setBookings(bookingsData.bookings || []);
      setOrders(ordersData.orders || []);
      setWishlist(wishlistData.wishlist || []);
      setFavorites(favoritesData.favorites || []);
      setPurchasedGiftCards(purchasedData.giftCards || []);
      setReceivedGiftCards(receivedData.giftCards || []);
      setDataFetched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const reason = prompt(
        "Please provide a reason for cancellation (optional):"
      );
      const loadingToast = toast.loading("Cancelling booking...");
      await cancelBooking(token, bookingId, reason);
      // Update booking status locally instead of fetching all data again
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled_full_refund" }
            : booking
        )
      );
      toast.dismiss(loadingToast);
      toast.success("Booking cancelled successfully");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const handleRebook = (booking) => {
    // Navigate to booking page with pre-filled service and specialist
    navigate(
      `/booking?serviceId=${booking.serviceId._id}&specialistId=${booking.specialistId._id}`
    );
  };

  const handleRefreshOrders = async () => {
    try {
      setLoadingOrders(true);
      const ordersData = await getUserOrders(token);
      setOrders(ordersData.orders || []);
      toast.success("Orders refreshed");
    } catch (err) {
      toast.error("Failed to refresh orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleRefreshWishlist = async () => {
    try {
      setLoadingWishlist(true);
      const wishlistData = await getWishlist(token);
      setWishlist(wishlistData.wishlist || []);
      toast.success("Wishlist refreshed");
    } catch (err) {
      toast.error("Failed to refresh wishlist");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(token, productId);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove from wishlist");
    }
  };

  const getProductPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      return Math.min(...product.variants.map((v) => v.price));
    }
    return product.price;
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "green",
      completed: "blue",
      reserved_unpaid: "yellow",
      cancelled_full_refund: "gray",
      cancelled_no_refund: "gray",
      cancelled_partial_refund: "gray",
      no_show: "red",
    };
    return colors[status] || "gray";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelBooking = (booking) => {
    if (!["confirmed", "reserved_unpaid"].includes(booking.status))
      return false;
    const appointmentTime = new Date(booking.start);
    const now = new Date();
    return appointmentTime > now;
  };

  // Show loading while auth is loading OR while fetching profile data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <ListSkeleton count={4} itemHeight="h-32" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-wide">
            My Profile
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 font-light">
            Welcome back, {user?.name}! Manage your bookings and account
            settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="grid grid-cols-2 sm:flex sm:border-b sm:border-gray-200 gap-2 sm:gap-0 sm:space-x-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`${
                activeTab === "bookings"
                  ? "bg-rose-50 border-rose-500 text-rose-600 sm:bg-transparent sm:border-b-2 sm:border-t-0 sm:border-x-0"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 sm:bg-transparent sm:border-transparent sm:border-b-2"
              } py-3 px-3 sm:px-1 border-2 sm:border-0 sm:border-b-2 rounded-lg sm:rounded-none font-medium text-xs sm:text-sm transition-all sm:-mb-px`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                <span>Bookings</span>
                <span className="text-xs sm:text-sm">({bookings.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`${
                activeTab === "orders"
                  ? "bg-rose-50 border-rose-500 text-rose-600 sm:bg-transparent sm:border-b-2 sm:border-t-0 sm:border-x-0"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 sm:bg-transparent sm:border-transparent sm:border-b-2"
              } py-3 px-3 sm:px-1 border-2 sm:border-0 sm:border-b-2 rounded-lg sm:rounded-none font-medium text-xs sm:text-sm transition-all sm:-mb-px`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                <span>Orders</span>
                <span className="text-xs sm:text-sm">({orders.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`${
                activeTab === "wishlist"
                  ? "bg-rose-50 border-rose-500 text-rose-600 sm:bg-transparent sm:border-b-2 sm:border-t-0 sm:border-x-0"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 sm:bg-transparent sm:border-transparent sm:border-b-2"
              } py-3 px-3 sm:px-1 border-2 sm:border-0 sm:border-b-2 rounded-lg sm:rounded-none font-medium text-xs sm:text-sm transition-all sm:-mb-px`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                <span>Wishlist</span>
                <span className="text-xs sm:text-sm">({wishlist.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`${
                activeTab === "favorites"
                  ? "bg-rose-50 border-rose-500 text-rose-600 sm:bg-transparent sm:border-b-2 sm:border-t-0 sm:border-x-0"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 sm:bg-transparent sm:border-transparent sm:border-b-2"
              } py-3 px-3 sm:px-1 border-2 sm:border-0 sm:border-b-2 rounded-lg sm:rounded-none font-medium text-xs sm:text-sm transition-all sm:-mb-px`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                <span>Favorites</span>
                <span className="text-xs sm:text-sm">({favorites.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("gift-cards")}
              className={`${
                activeTab === "gift-cards"
                  ? "bg-rose-50 border-rose-500 text-rose-600 sm:bg-transparent sm:border-b-2 sm:border-t-0 sm:border-x-0"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 sm:bg-transparent sm:border-transparent sm:border-b-2"
              } py-3 px-3 sm:px-1 border-2 sm:border-0 sm:border-b-2 rounded-lg sm:rounded-none font-medium text-xs sm:text-sm transition-all sm:-mb-px`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                <span>Gift Cards</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`${
                activeTab === "settings"
                  ? "bg-rose-50 border-rose-500 text-rose-600 sm:bg-transparent sm:border-b-2 sm:border-t-0 sm:border-x-0"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 sm:bg-transparent sm:border-transparent sm:border-b-2"
              } py-3 px-3 sm:px-1 border-2 sm:border-0 sm:border-b-2 rounded-lg sm:rounded-none font-medium text-xs sm:text-sm transition-all sm:-mb-px`}
            >
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    You haven't made any bookings yet.
                  </p>
                  <Button onClick={() => navigate("/services")}>
                    Book a Service
                  </Button>
                </Card>
              ) : (
                <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bookings.map((booking) => (
                    <StaggerItem key={booking._id}>
                      <Card hoverable className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words flex-1 min-w-0">
                            {booking.serviceId?.name || "Service"}
                          </h3>
                          <Chip
                            color={getStatusColor(booking.status)}
                            className="self-start"
                          >
                            {booking.status.replace(/_/g, " ")}
                          </Chip>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                          <p className="flex items-center break-words">
                            <span className="font-medium mr-2 flex-shrink-0">
                              👤
                            </span>
                            <span className="break-words">
                              {booking.specialistId?.name || "Specialist"}
                            </span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2 flex-shrink-0">
                              📅
                            </span>
                            <span>{formatDate(booking.start)}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2 flex-shrink-0">
                              🕐
                            </span>
                            <span>
                              {formatTime(booking.start)} -{" "}
                              {formatTime(booking.end)}
                            </span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium mr-2 flex-shrink-0">
                              💷
                            </span>
                            <span>{formatPrice(booking.price || 0)}</span>
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {canCancelBooking(booking) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          )}
                          {booking.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRebook(booking)}
                              className="flex-1"
                            >
                              Rebook
                            </Button>
                          )}
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Refresh Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  My Orders
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshOrders}
                  disabled={loadingOrders}
                  className="flex items-center gap-2"
                >
                  <svg
                    className={`w-4 h-4 ${loadingOrders ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </Button>
              </div>

              {orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    You haven't placed any orders yet.
                  </p>
                  <Button onClick={() => navigate("/shop")}>
                    Browse Products
                  </Button>
                </Card>
              ) : (
                <StaggerContainer className="grid grid-cols-1 gap-4">
                  {orders.map((order) => (
                    <StaggerItem key={order._id}>
                      <Card hoverable className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                              Order #{order.orderNumber || order._id.slice(-8)}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end flex-wrap">
                            <Chip
                              color={
                                order.paymentStatus === "paid"
                                  ? "green"
                                  : "yellow"
                              }
                            >
                              {order.orderStatus}
                            </Chip>
                            {order.isCollection && (
                              <Chip
                                color={
                                  order.collectionStatus === "ready"
                                    ? "green"
                                    : order.collectionStatus === "collected"
                                    ? "gray"
                                    : "blue"
                                }
                              >
                                {order.collectionStatus === "ready"
                                  ? "Ready for Pickup!"
                                  : order.collectionStatus === "collected"
                                  ? "Collected"
                                  : "Collection Pending"}
                              </Chip>
                            )}
                          </div>
                        </div>

                        {/* Collection Info Banner */}
                        {order.isCollection &&
                          order.collectionStatus === "ready" && (
                            <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <svg
                                  className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                                    Your order is ready for collection!
                                  </h4>
                                  <p className="text-xs sm:text-sm text-green-800 break-words">
                                    <strong>Collection Address:</strong>{" "}
                                    {order.collectionAddress ||
                                      "12 Blackfriars Rd, PE13 1AT"}
                                  </p>
                                  <p className="text-xs sm:text-sm text-green-800 mt-1">
                                    <strong>Opening Hours:</strong>{" "}
                                    Monday-Sunday, 9am-5pm
                                  </p>
                                  {order.collectionReadyAt && (
                                    <p className="text-xs text-green-700 mt-2">
                                      Ready since:{" "}
                                      {new Date(
                                        order.collectionReadyAt
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        {order.isCollection &&
                          order.collectionStatus !== "ready" &&
                          order.collectionStatus !== "collected" && (
                            <div className="mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <svg
                                  className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5"
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
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                                    Collection Order
                                  </h4>
                                  <p className="text-xs sm:text-sm text-blue-800 break-words">
                                    We're preparing your order. You'll receive
                                    an email when it's ready for collection.
                                  </p>
                                  <p className="text-xs sm:text-sm text-blue-800 mt-1 break-words">
                                    <strong>Collection Address:</strong>{" "}
                                    {order.collectionAddress ||
                                      "12 Blackfriars Rd, PE13 1AT"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="border-t border-gray-200 pt-3 sm:pt-4">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 sm:gap-3 py-2 items-start sm:items-center"
                            >
                              {/* Product Image */}
                              {(item.image?.url ||
                                item.productId?.image?.url) && (
                                <img
                                  src={
                                    item.image?.url ||
                                    item.productId?.image?.url
                                  }
                                  alt={item.title || item.productId?.title}
                                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-base font-medium break-words">
                                  {item.title || item.productId?.title}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                  Qty: {item.quantity}
                                  {item.size && ` • Size: ${item.size}`}
                                </p>
                              </div>
                              <p className="text-sm sm:text-base font-medium whitespace-nowrap flex-shrink-0">
                                £{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                          <div className="flex justify-between items-center">
                            <p className="text-base sm:text-lg font-bold">
                              Total
                            </p>
                            <p className="text-base sm:text-lg font-bold">
                              £{order.total?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-4">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/order-success/${
                                  order.orderNumber || order._id.slice(-8)
                                }`,
                                { state: { fromProfile: true } }
                              )
                            }
                            className="w-full"
                          >
                            View Order
                          </Button>
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="space-y-4">
              {/* Refresh Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  My Wishlist
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshWishlist}
                  disabled={loadingWishlist}
                  className="flex items-center gap-1 sm:gap-2"
                >
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      loadingWishlist ? "animate-spin" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>

              {wishlist.length === 0 ? (
                <Card className="p-8 text-center">
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">Your wishlist is empty</p>
                  <Button onClick={() => navigate("/products")}>
                    Browse Products
                  </Button>
                </Card>
              ) : (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {wishlist.map((product) => (
                    <StaggerItem key={product._id}>
                      <Card
                        hoverable
                        className="group relative overflow-hidden"
                      >
                        {/* Product Image */}
                        <div
                          className="relative h-48 overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/products`)}
                        >
                          {product.image?.url ? (
                            <img
                              src={product.image.url}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg
                                className="w-12 h-12 text-gray-400"
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

                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWishlist(product._id);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="currentColor"
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

                          {/* Featured Badge */}
                          {product.featured && (
                            <div className="absolute top-2 left-2 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded">
                              Featured
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-3 sm:p-4">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 break-words">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-base sm:text-lg font-bold text-brand-600">
                              {formatPrice(getProductPrice(product))}
                            </span>
                            {product.variants &&
                              product.variants.length > 1 && (
                                <span className="text-xs text-gray-500">
                                  from
                                </span>
                              )}
                          </div>
                          {product.category && (
                            <p className="text-xs text-gray-500 mt-1">
                              {product.category}
                            </p>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/products`)}
                            className="w-full mt-3"
                          >
                            View Product
                          </Button>
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <Card className="p-8 text-center">
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
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No favorite salons yet</p>
                  <Button onClick={() => navigate("/")}>Explore Salons</Button>
                </Card>
              ) : (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((salon) => (
                    <StaggerItem key={salon._id}>
                      <Card hoverable className="p-4 group">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 flex-1">
                            {salon.name}
                          </h3>
                          <button
                            onClick={async () => {
                              try {
                                await removeFromFavorites(salon._id);
                                setFavorites((prev) =>
                                  prev.filter((f) => f._id !== salon._id)
                                );
                                toast.success("Removed from favorites");
                              } catch (error) {
                                toast.error("Failed to remove from favorites");
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          </button>
                        </div>
                        {salon.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {salon.description}
                          </p>
                        )}
                        {salon.address && (
                          <p className="text-xs text-gray-500 mb-4">
                            📍 {salon.address.city || salon.address.street}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to tenant using slug
                            if (salon.slug) {
                              window.location.href = `/${salon.slug}`;
                            }
                          }}
                          className="w-full"
                        >
                          Visit Salon
                        </Button>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          )}

          {/* Gift Cards Tab */}
          {activeTab === "gift-cards" && (
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Purchased Gift Cards
                </h3>
                {loadingGiftCards ? (
                  <ListSkeleton count={2} />
                ) : purchasedGiftCards.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Gift Cards Purchased
                      </h3>
                      <p className="text-gray-600 mb-4">
                        You haven't purchased any gift cards yet
                      </p>
                    </div>
                  </Card>
                ) : (
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchasedGiftCards.map((giftCard) => (
                      <StaggerItem key={giftCard._id}>
                        <Card className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Gift Card Code
                              </p>
                              <p className="text-lg font-mono font-bold text-brand-600">
                                {giftCard.code}
                              </p>
                            </div>
                            <Chip
                              variant={
                                giftCard.status === "redeemed"
                                  ? "success"
                                  : giftCard.status === "sent"
                                  ? "info"
                                  : "warning"
                              }
                            >
                              {giftCard.status}
                            </Chip>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-semibold">
                                {formatPrice(giftCard.amount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Recipient:</span>
                              <span className="font-semibold">
                                {giftCard.recipientName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="text-xs">
                                {giftCard.recipientEmail}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Purchased:</span>
                              <span>
                                {new Date(
                                  giftCard.purchaseDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {giftCard.message && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-gray-600 text-xs italic">
                                  "{giftCard.message}"
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Received Gift Cards
                </h3>
                {loadingGiftCards ? (
                  <ListSkeleton count={2} />
                ) : receivedGiftCards.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Gift Cards Received
                      </h3>
                      <p className="text-gray-600 mb-4">
                        You haven't received any gift cards yet
                      </p>
                    </div>
                  </Card>
                ) : (
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {receivedGiftCards.map((giftCard) => (
                      <StaggerItem key={giftCard._id}>
                        <Card className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Gift Card Code
                              </p>
                              <p className="text-lg font-mono font-bold text-brand-600">
                                {giftCard.code}
                              </p>
                            </div>
                            <Chip
                              variant={
                                giftCard.status === "redeemed"
                                  ? "success"
                                  : giftCard.status === "sent"
                                  ? "info"
                                  : "warning"
                              }
                            >
                              {giftCard.status}
                            </Chip>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-semibold">
                                {formatPrice(giftCard.amount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">From:</span>
                              <span className="font-semibold">
                                {giftCard.purchaserName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expires:</span>
                              <span>
                                {new Date(
                                  giftCard.expiryDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {giftCard.message && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-gray-600 text-xs italic">
                                  "{giftCard.message}"
                                </p>
                              </div>
                            )}
                            {giftCard.status === "sent" && (
                              <div className="pt-3 grid grid-cols-2 gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(
                                        giftCard.code
                                      );
                                      toast.success("Gift card code copied");
                                    } catch {
                                      toast.error("Failed to copy code");
                                    }
                                  }}
                                >
                                  Copy Code
                                </Button>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    const targetSlug = giftCard?.tenantId?.slug;
                                    if (targetSlug) {
                                      navigate(`/salon/${targetSlug}`);
                                      return;
                                    }
                                    toast.error("Business link unavailable");
                                  }}
                                >
                                  Book Now
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{user?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-900">{user.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">
                      Member since:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile/edit")}
                    className="w-full sm:w-auto"
                  >
                    Edit Profile
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full sm:w-auto"
                  >
                    Sign Out
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
