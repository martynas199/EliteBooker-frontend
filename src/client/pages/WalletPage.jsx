import { CreditCard, Receipt, Wallet } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getUserOrders } from "../../tenant/pages/profile.api";

export default function WalletPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  const token = useMemo(() => localStorage.getItem("clientToken"), []);

  useEffect(() => {
    const loadActivity = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getUserOrders(token);
        setOrders(response?.orders || []);
      } catch (err) {
        setError(err?.message || "Failed to load wallet activity");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [token]);

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "paid",
  ).length;

  return (
    <>
      <SEOHead title="Wallet - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Wallet"
        description="View balance and wallet activity"
      >
        <div className="space-y-4">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-gray-700" />
                </div>
                <p className="text-sm text-gray-600">Wallet balance</p>
              </div>
              <p className="text-2xl font-semibold text-gray-900">GBP 0.00</p>
              <p className="text-xs text-gray-500 mt-1">
                Top-up and credits will appear here when enabled.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-gray-700" />
                </div>
                <p className="text-sm text-gray-600">Paid orders</p>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : paidOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total spent: £{loading ? "0.00" : totalSpent.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Wallet features are coming soon
            </h2>
            <p className="text-gray-600 mb-6">
              You can still track your spending through product orders.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate("/client/orders")}
            >
              View product orders
            </Button>
          </div>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
