import { Gift, Search } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";

export default function SendGiftCardPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Send a Gift Card - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Send a gift card"
        description="Choose a business and send a digital gift card"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Gift cards
              </h2>
              <p className="text-gray-600 mt-1">
                Find a business that offers gift cards, then purchase and send
                one instantly.
              </p>
            </div>
          </div>
          <Button variant="brand" onClick={() => navigate("/search")}>
            <Search className="w-4 h-4" />
            Find a business
          </Button>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
