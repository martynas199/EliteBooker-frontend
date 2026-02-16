import { Package } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Product Orders - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Product orders"
        description="Track your product purchases"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No product orders yet</h2>
          <p className="text-gray-600 mb-6">Your product order history will appear here.</p>
          <Button variant="secondary" onClick={() => navigate("/search")}>Find a business</Button>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
