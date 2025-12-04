import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { OrdersAPI } from "../../tenant/pages/orders.api";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";
import { formatCurrency } from "../../shared/utils/currency";

export default function Orders() {
  const { language } = useLanguage();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await OrdersAPI.list({});
      setAllOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders locally
  const orders =
    filter === "all"
      ? allOrders
      : allOrders.filter((order) => order.orderStatus === filter);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const updated = await OrdersAPI.update(orderId, {
        orderStatus: newStatus,
      });
      setAllOrders(allOrders.map((o) => (o._id === orderId ? updated : o)));
      setSelectedOrder(updated);
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async (orderId, trackingNumber) => {
    try {
      setUpdating(true);
      const updated = await OrdersAPI.update(orderId, { trackingNumber });
      setAllOrders(allOrders.map((o) => (o._id === orderId ? updated : o)));
      setSelectedOrder(updated);
      toast.success("Tracking number updated successfully");
    } catch (error) {
      console.error("Error updating tracking:", error);
      toast.error("Failed to update tracking number");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkReadyForCollection = async (orderId) => {
    try {
      setUpdating(true);
      const updated = await OrdersAPI.markReadyForCollection(orderId);
      setAllOrders(
        allOrders.map((o) => (o._id === orderId ? updated.data : o))
      );
      setSelectedOrder(updated.data);
      toast.success(
        "Order marked as ready for collection. Customer has been notified by email."
      );
    } catch (error) {
      console.error("Error marking order ready:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to mark order as ready for collection"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          <span>Cancel this order? Stock will be restored.</span>
          <button
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setUpdating(true);
                const updated = await OrdersAPI.cancel(orderId);
                setAllOrders(
                  allOrders.map((o) => (o._id === orderId ? updated : o))
                );
                setSelectedOrder(updated);
                toast.success("Order cancelled successfully");
              } catch (error) {
                console.error("Error cancelling order:", error);
                toast.error("Failed to cancel order");
              } finally {
                setUpdating(false);
              }
            }}
          >
            Yes, Cancel Order
          </button>
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
        </span>
      ),
      { duration: 8000 }
    );
  };

  const handleDeleteOrder = async (orderId) => {
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          <span>Permanently delete this order? This cannot be undone!</span>
          <button
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setUpdating(true);
                await OrdersAPI.delete(orderId);
                setAllOrders(allOrders.filter((o) => o._id !== orderId));
                if (selectedOrder?._id === orderId) {
                  setSelectedOrder(null);
                }
                toast.success("Order deleted successfully");
              } catch (error) {
                console.error("Error deleting order:", error);
                toast.error("Failed to delete order");
              } finally {
                setUpdating(false);
              }
            }}
          >
            Yes, Delete
          </button>
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
        </span>
      ),
      { duration: 8000 }
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-brand-100 text-brand-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("orders", language)}
        </h1>
        <p className="text-gray-600 mt-1">
          {t("manageCustomerOrders", language)}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: t("all", language) },
          { value: "pending", label: t("pending", language) },
          { value: "processing", label: t("processing", language) },
          { value: "shipped", label: t("shipped", language) },
          { value: "delivered", label: t("delivered", language) },
          { value: "cancelled", label: t("cancelled", language) },
        ].map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status.value
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-brand-600"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "No orders have been placed yet"
              : `No ${filter} orders found`}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Order Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            Order: {order.orderStatus}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Customer:</span>{" "}
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {order.shippingAddress.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {order.shippingAddress.phone}
                        </p>
                        <p>
                          <span className="font-medium">Items:</span>{" "}
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                        <p>
                          <span className="font-medium">Total:</span>{" "}
                          {formatCurrency(order.total, order.currency)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>

                  {order.orderStatus === "pending" && (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(order._id, "processing")
                      }
                      disabled={updating}
                    >
                      Mark Processing
                    </Button>
                  )}

                  {order.orderStatus === "processing" &&
                    (!order.isCollection ||
                      !order.collectionStatus ||
                      order.collectionStatus === "pending") && (
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() =>
                          order.isCollection
                            ? handleMarkReadyForCollection(order._id)
                            : handleUpdateStatus(order._id, "shipped")
                        }
                        disabled={updating}
                      >
                        {order.isCollection
                          ? "Mark Ready for Collection"
                          : "Mark Shipped"}
                      </Button>
                    )}

                  {order.isCollection && order.collectionStatus === "ready" && (
                    <div className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg text-green-700 text-sm font-semibold text-center shadow-sm flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Ready for Collection</span>
                    </div>
                  )}

                  {order.orderStatus === "shipped" && (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleUpdateStatus(order._id, "delivered")}
                      disabled={updating}
                    >
                      Mark Delivered
                    </Button>
                  )}

                  {!["cancelled", "delivered", "refunded"].includes(
                    order.orderStatus
                  ) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={updating}
                    >
                      Cancel Order
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={updating}
                    className="bg-red-700 hover:bg-red-800"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">
                Order {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
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

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        selectedOrder.orderStatus
                      )}`}
                    >
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Payment Error Details */}
                {selectedOrder.lastPaymentError && (
                  <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-800 mb-1">
                          Payment Failed
                        </h4>
                        <p className="text-sm text-red-700">
                          {selectedOrder.lastPaymentError.message}
                        </p>
                        {selectedOrder.lastPaymentError.declineCode && (
                          <p className="text-xs text-red-600 mt-1">
                            Decline Code:{" "}
                            {selectedOrder.lastPaymentError.declineCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg overflow-hidden"
                    >
                      <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
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
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 break-words">
                          {item.title}
                        </h4>
                        {item.productId && (
                          <p className="text-xs text-gray-400 font-mono">
                            ID:{" "}
                            {typeof item.productId === "object"
                              ? item.productId._id
                              : item.productId}
                          </p>
                        )}
                        {item.size && (
                          <p className="text-xs sm:text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Qty: {item.quantity} ×{" "}
                          {formatCurrency(item.price, selectedOrder.currency)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm sm:text-base font-semibold text-gray-900">
                          {formatCurrency(
                            item.price * item.quantity,
                            selectedOrder.currency
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedOrder.subtotal,
                        selectedOrder.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {selectedOrder.shipping === 0
                        ? "FREE"
                        : formatCurrency(
                            selectedOrder.shipping,
                            selectedOrder.currency
                          )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (20%)</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedOrder.tax,
                        selectedOrder.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        selectedOrder.total,
                        selectedOrder.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address / Collection Info */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  {selectedOrder.isCollection
                    ? "Collection Details"
                    : "Shipping Address"}
                </h3>
                {selectedOrder.isCollection && (
                  <>
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
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
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span>COLLECT IN PERSON</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Collection Address:{" "}
                        {selectedOrder.collectionAddress ||
                          "12 Blackfriars Rd, PE13 1AT"}
                      </p>
                      {selectedOrder.collectionStatus &&
                        selectedOrder.collectionStatus === "ready" && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                              <svg
                                className="w-5 h-5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div>
                                <p className="text-sm font-semibold">
                                  Ready for Collection
                                </p>
                                {selectedOrder.collectionReadyAt && (
                                  <p className="text-xs text-green-600 mt-0.5">
                                    Since{" "}
                                    {new Date(
                                      selectedOrder.collectionReadyAt
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      {selectedOrder.collectionStatus &&
                        selectedOrder.collectionStatus === "pending" && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-xs text-blue-600">
                              Status:{" "}
                              <span className="font-semibold capitalize">
                                Pending Collection
                              </span>
                            </p>
                          </div>
                        )}
                    </div>
                    {(!selectedOrder.collectionStatus ||
                      selectedOrder.collectionStatus === "pending") && (
                      <button
                        onClick={() =>
                          handleMarkReadyForCollection(selectedOrder._id)
                        }
                        disabled={updating}
                        className="w-full mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {updating
                          ? "Processing..."
                          : "Mark Ready for Collection"}
                      </button>
                    )}
                  </>
                )}
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900 break-words">
                    {selectedOrder.shippingAddress.firstName}{" "}
                    {selectedOrder.shippingAddress.lastName}
                  </p>
                  {!selectedOrder.isCollection && (
                    <>
                      <p className="break-words">
                        {selectedOrder.shippingAddress.address}
                      </p>
                      <p className="break-words">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="break-words">
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </>
                  )}
                  <p className="pt-2">
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="break-all">
                      {selectedOrder.shippingAddress.email}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span>{" "}
                    <span className="break-all">
                      {selectedOrder.shippingAddress.phone}
                    </span>
                  </p>
                </div>
              </div>

              {/* Royal Mail Postage Label Link */}
              <div>
                <a
                  href="https://send.royalmail.com/send/youritem?country=LTU&format=&weight=&weightUnit=G&CountryName=Lithuania&serviceFilter=parcelforce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Purchase Royal Mail Postage Label
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              {/* Tracking Number */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Tracking Information
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    defaultValue={selectedOrder.trackingNumber || ""}
                    placeholder="Enter tracking number"
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateTracking(selectedOrder._id, e.target.value);
                      }
                    }}
                  />
                  <Button
                    variant="brand"
                    onClick={(e) => {
                      const input = e.target
                        .closest("div")
                        .querySelector("input");
                      handleUpdateTracking(selectedOrder._id, input.value);
                    }}
                    disabled={updating}
                    className="w-full sm:w-auto flex-shrink-0"
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                    Order Notes
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 sm:p-4 rounded-lg break-words">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Timeline
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <p className="text-gray-600 break-words">
                    <span className="font-medium">Placed:</span>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  {selectedOrder.shippedAt && (
                    <p className="text-gray-600 break-words">
                      <span className="font-medium">Shipped:</span>{" "}
                      {new Date(selectedOrder.shippedAt).toLocaleString()}
                    </p>
                  )}
                  {selectedOrder.deliveredAt && (
                    <p className="text-gray-600 break-words">
                      <span className="font-medium">Delivered:</span>{" "}
                      {new Date(selectedOrder.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
