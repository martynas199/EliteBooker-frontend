import { Package, RefreshCw, Search } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getUserOrders } from "../../tenant/pages/profile.api";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = useMemo(() => localStorage.getItem("clientToken"), []);

  const loadOrders = async () => {
    if (!token) {
      setLoading(false);
      setError("Please sign in to view your orders");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await getUserOrders(token);
      setOrders(response?.orders || []);
    } catch (err) {
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <>
      <SEOHead title="Product Orders - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Product orders"
        description="Track your product purchases"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">{orders.length} orders</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadOrders}
              loading={loading}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!loading && orders.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No product orders yet
              </h2>
              <p className="text-gray-600 mb-6">
                Your product order history will appear here.
              </p>
              <Button variant="secondary" onClick={() => navigate("/search")}>
                <Search className="w-4 h-4" />
                Find a business
              </Button>
            </div>
          ) : null}

          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Order #{order.orderNumber || order._id?.slice(-8)}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50">
                      {order.orderStatus || "pending"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">
                          {item.title || item.productId?.title || "Product"} ×{" "}
                          {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          £
                          {((item.price || 0) * (item.quantity || 0)).toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">
                      £{(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </ClientAccountPageShell>
    </>
  );
}
