import { Heart } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";

export default function FavouritesPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Favourites - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Favourites"
        description="Your saved businesses and services"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No favourites yet</h2>
          <p className="text-gray-600 mb-6">Save your favourite businesses to rebook faster.</p>
          <Button variant="brand" onClick={() => navigate("/search")}>Find a business</Button>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
