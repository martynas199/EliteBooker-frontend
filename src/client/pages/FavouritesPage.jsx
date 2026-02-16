import { Heart, MapPin, RefreshCw, Search, Trash2 } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFavorites, removeFromFavorites } from "../../shared/api/favorites.api";

export default function FavouritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getFavorites();
      setFavorites(response?.favorites || []);
    } catch (err) {
      setError(err?.message || "Failed to load favourites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (tenantId) => {
    try {
      await removeFromFavorites(tenantId);
      setFavorites((prev) => prev.filter((item) => item._id !== tenantId));
    } catch (err) {
      setError(err?.message || "Failed to remove favourite");
    }
  };

  return (
    <>
      <SEOHead title="Favourites - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Favourites"
        description="Your saved businesses and services"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">{favorites.length} saved businesses</p>
            <Button variant="secondary" size="sm" onClick={loadFavorites} loading={loading}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!loading && favorites.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No favourites yet</h2>
              <p className="text-gray-600 mb-6">Save your favourite businesses to rebook faster.</p>
              <Button variant="brand" onClick={() => navigate("/search")}>
                <Search className="w-4 h-4" />
                Find a business
              </Button>
            </div>
          ) : null}

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((salon) => (
                <div key={salon._id} className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">{salon.name}</h2>
                    <button
                      type="button"
                      onClick={() => handleRemove(salon._id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      aria-label="Remove favourite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {salon.description ? (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{salon.description}</p>
                  ) : null}

                  {salon.address ? (
                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {salon.address.city || salon.address.street}
                    </p>
                  ) : null}

                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      if (salon.slug) navigate(`/salon/${salon.slug}`);
                    }}
                  >
                    Visit business
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </ClientAccountPageShell>
    </>
  );
}
