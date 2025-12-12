import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";
import SEOHead from "../../shared/components/seo/SEOHead";

// Google Maps loader
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
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

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(window.innerWidth >= 768);
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    location: searchParams.get("location") || "Current location",
    date: searchParams.get("date") || "Any time",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const initGoogleMaps = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        try {
          await loadGoogleMapsScript(apiKey);
          setMapsLoaded(true);
        } catch (error) {
          console.error("Failed to load Google Maps:", error);
        }
      }
    };

    initGoogleMaps();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (mapsLoaded) {
      fetchVenues();
    }
  }, [mapsLoaded]);

  useEffect(() => {
    if (venues.length > 0 && showMap && mapRef.current) {
      initializeMap();
    }
  }, [venues, showMap, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied, using default location");
          // Default to London
          setUserLocation({ lat: 51.5074, lng: -0.1278 });
        }
      );
    } else {
      // Default to London
      setUserLocation({ lat: 51.5074, lng: -0.1278 });
    }
  };

  const initializeMap = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return;
    }

    try {
      await loadGoogleMapsScript(apiKey);

      const mapCenter = userLocation || { lat: 51.5074, lng: -0.1278 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      googleMapRef.current = map;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add markers for each venue
      venues.forEach((venue) => {
        if (venue.location?.coordinates) {
          const [lng, lat] = venue.location.coordinates;

          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: venue.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#000000",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${
                  venue.name
                }</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${
                  venue.address || ""
                }</p>
                <a href="/salon/${
                  venue.slug
                }" style="color: #0066cc; font-size: 12px; text-decoration: none;">View details →</a>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        }
      });

      // Add user location marker if available
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          title: "Your location",
        });
      }
    } catch (error) {
      console.error("Failed to load Google Maps:", error);
    }
  };

  const fetchVenues = async () => {
    try {
      setLoading(true);
      // Fetch all public tenants
      const response = await api.get("/tenants/public");
      console.log("Fetched venues:", response.data);

      if (response.data.success && Array.isArray(response.data.tenants)) {
        // Geocode venues that don't have coordinates
        const venuesWithCoords = await Promise.all(
          response.data.tenants.map(async (venue) => {
            if (!venue.location?.coordinates && venue.address) {
              const coords = await geocodeAddress(venue.address);
              if (coords) {
                return {
                  ...venue,
                  location: {
                    type: "Point",
                    coordinates: [coords.lng, coords.lat],
                  },
                };
              }
            }
            return venue;
          })
        );
        setVenues(venuesWithCoords);
      } else {
        console.error("Unexpected response format:", response.data);
        setVenues([]);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !window.google?.maps) return null;

    try {
      const geocoder = new window.google.maps.Geocoder();
      const addressString = [
        typeof address === "string" ? address : null,
        address.street,
        address.city,
        address.state,
        address.postalCode,
        address.country,
      ]
        .filter(Boolean)
        .join(", ");

      return new Promise((resolve) => {
        geocoder.geocode({ address: addressString }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
          } else {
            console.log(`Geocoding failed for: ${addressString}`);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleSearchChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Radius of Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredVenues = venues.filter((venue) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      venue.name?.toLowerCase().includes(searchLower) ||
      venue.address?.toLowerCase().includes(searchLower) ||
      venue.description?.toLowerCase().includes(searchLower) ||
      venue.services?.some((service) =>
        service.name?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Calculate distance from user location if available
  const venuesWithDistance = filteredVenues
    .map((venue) => {
      if (userLocation && venue.location?.coordinates) {
        const [lng, lat] = venue.location.coordinates;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );
        return { ...venue, distance };
      }
      return venue;
    })
    .sort((a, b) => {
      // Sort by distance if available
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  return (
    <>
      <SEOHead
        title="Search Businesses - EliteBooker"
        description="Find and book beauty salons, spas, and wellness businesses near you"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>

              <div className="flex-1 flex items-center gap-2">
                {/* Search Input */}
                <div className="flex-1 max-w-md relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search treatments or businesses"
                    value={filters.search}
                    onChange={(e) =>
                      handleSearchChange("search", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                  />
                </div>

                {/* Location Selector */}
                <button className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap hidden sm:block">
                  {filters.location}
                </button>

                {/* Date Selector */}
                <button className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap hidden sm:block">
                  {filters.date}
                </button>
              </div>

              {/* User Menu */}
              <Link
                to="/client/profile"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel - Venue List */}
          <div className="flex-1 overflow-y-auto">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <strong>{venuesWithDistance.length}</strong> venues nearby
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </button>

                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  {showMap ? "Hide map" : "Show map"}
                </button>
              </div>
            </div>

            {/* Venue Cards */}
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading venues...</p>
                </div>
              ) : venuesWithDistance.length === 0 ? (
                <div>
                  <div className="text-center py-8 mb-6">
                    <p className="text-gray-600 font-medium">
                      No venues found matching your search
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try adjusting your search criteria or browse all available
                      venues below
                    </p>
                  </div>

                  {/* Show all venues if search returns nothing */}
                  {venues.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <p className="text-sm font-semibold text-gray-700">
                          All Available Venues ({venues.length})
                        </p>
                      </div>
                      {venues.map((venue) => (
                        <VenueCard key={venue._id} venue={venue} />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                venuesWithDistance.map((venue) => (
                  <VenueCard key={venue._id} venue={venue} />
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Map */}
          {showMap && (
            <div className="w-1/2 bg-gray-200 relative hidden md:block">
              <div
                ref={mapRef}
                className="absolute inset-0 w-full h-full"
              ></div>
              {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100 bg-opacity-90">
                  <div className="text-center p-6">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium">Map view unavailable</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Add VITE_GOOGLE_MAPS_API_KEY to enable maps
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function VenueCard({ venue }) {
  const defaultImage =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80";
  const venueImage =
    venue.branding?.coverImage?.url ||
    venue.branding?.logo?.url ||
    defaultImage;
  const rating = venue.rating || 5.0;
  const reviewCount = venue.reviewCount || 0;

  // Format address - handle both string and object formats
  const getAddress = () => {
    if (!venue.address) return "Address not available";

    if (typeof venue.address === "string") {
      return venue.address;
    }

    // Handle address object
    const parts = [
      venue.address.street,
      venue.address.city,
      venue.address.state,
      venue.address.postalCode,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Address not available";
  };

  return (
    <Link
      to={`/salon/${venue.slug}`}
      className="block bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={venueImage}
            alt={venue.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {venue.name}
              </h3>
              <p className="text-sm text-gray-600">{getAddress()}</p>
              {venue.distance !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  {venue.distance.toFixed(1)} miles away
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-sm ml-4">
              <svg
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewCount})</span>
            </div>
          </div>

          {/* Description */}
          {venue.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {venue.description}
            </p>
          )}

          {/* Services Preview */}
          <div className="space-y-2">
            {venue.services && venue.services.length > 0 ? (
              <>
                {venue.services.slice(0, 3).map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {service.duration} mins
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        £{service.price}
                      </p>
                    </div>
                  </div>
                ))}
                {venue.services.length > 3 && (
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    See all {venue.services.length} services
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Services information coming soon
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
