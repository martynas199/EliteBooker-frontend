import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve(window.google.maps)
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function SearchPageSimple() {
  console.log("[SearchPageSimple] Component executing");

  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    console.log("[SearchPageSimple] Mounted");

    // Force page to top and prevent scroll
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    fetchVenues();
    initMap();

    return () => {
      console.log("[SearchPageSimple] Unmounting");
      document.body.style.overflow = "";
    };
  }, []);

  const initMap = async () => {
    if (!GOOGLE_MAPS_API_KEY) return;

    try {
      await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);

      const defaultLat = parseFloat(
        import.meta.env.VITE_DEFAULT_LAT || "51.5074"
      );
      const defaultLng = parseFloat(
        import.meta.env.VITE_DEFAULT_LNG || "-0.1278"
      );

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: defaultLat, lng: defaultLng },
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load Google Maps:", error);
    }
  };

  useEffect(() => {
    if (!googleMapRef.current || venues.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add markers for venues
    const bounds = new window.google.maps.LatLngBounds();

    filteredVenues.forEach((venue) => {
      if (!venue.location?.coordinates) return;

      const [lng, lat] = venue.location.coordinates;
      const position = { lat, lng };

      const marker = new window.google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: venue.businessName,
      });

      marker.addListener("click", () => {
        const venueElement = document.getElementById(`venue-${venue._id}`);
        if (venueElement) {
          venueElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (filteredVenues.length > 0) {
      googleMapRef.current.fitBounds(bounds);
    }
  }, [venues, search]);

  const fetchVenues = async () => {
    try {
      const response = await api.get("/tenants/public");
      if (response.data.success && Array.isArray(response.data.tenants)) {
        setVenues(response.data.tenants);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      venue.name?.toLowerCase().includes(searchLower) ||
      venue.businessName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
          backgroundColor: "white",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            style={{ width: "24px", height: "24px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "16px",
            outline: "none",
          }}
        />
      </div>

      {/* Main Content - Map and List */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Map Section */}
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "40%",
            minHeight: "200px",
            backgroundColor: "#e5e7eb",
          }}
        />

        {/* List Section */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            padding: "16px",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #7c3aed",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#666",
              }}
            >
              <p>No businesses found</p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {filteredVenues.map((venue) => (
                <Link
                  key={venue._id}
                  id={`venue-${venue._id}`}
                  to={`/salon/${venue.slug}`}
                  style={{
                    display: "block",
                    padding: "16px",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "#111",
                    }}
                  >
                    {venue.businessName || venue.name}
                  </h3>
                  {venue.address && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "4px",
                      }}
                    >
                      {typeof venue.address === "string"
                        ? venue.address
                        : [
                            venue.address.street,
                            venue.address.city,
                            venue.address.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
