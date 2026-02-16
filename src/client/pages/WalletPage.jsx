import { Wallet } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";

export default function WalletPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Wallet - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Wallet"
        description="View balance and wallet activity"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">GBP 0.00</h2>
          <p className="text-gray-600 mb-6">No wallet activity yet.</p>
          <Button variant="secondary" onClick={() => navigate("/search")}>Find a business</Button>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
