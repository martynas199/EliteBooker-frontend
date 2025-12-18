import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Supercluster from "supercluster";
import { api } from "../../shared/lib/apiClient";
import SEOHead from "../../shared/components/seo/SEOHead";
import BottomDrawer from "../components/BottomDrawer";
import React from "react";
import OptimizedImage from "../../shared/components/OptimizedImage";

// Google Maps loader with duplicate prevention
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api"]'
    );
    if (existingScript) {
      // Wait for existing script to load
      existingScript.addEventListener("load", () => {
        resolve(window.google.maps);
      });
      existingScript.addEventListener("error", reject);
      return;
    }

    // Create new script with loading=async parameter
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Custom Pin SVG Component
const CustomPin = ({ active, count }) => {
  if (count > 1) {
    // Cluster pin
    return (
      <div className="relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="drop-shadow-lg"
        >
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="#000000"
            stroke="#ffffff"
            strokeWidth="3"
          />
          <text
            x="20"
            y="25"
            fill="#ffffff"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
          >
            {count}
          </text>
        </svg>
      </div>
    );
  }

  // Single venue pin
  const size = active ? 48 : 32;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, y: active ? -5 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className="drop-shadow-lg"
      >
        <path
          d="M16 0C10.477 0 6 4.477 6 10c0 8.5 10 22 10 22s10-13.5 10-22c0-5.523-4.477-10-10-10z"
          fill={active ? "#EF4444" : "#000000"}
          stroke="#ffffff"
          strokeWidth="2"
        />
        <circle cx="16" cy="10" r="4" fill="#ffffff" />
      </svg>
    </motion.div>
  );
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVenueId, setActiveVenueId] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    distance: "all",
    priceRange: "all",
    rating: "all",
    availability: "all",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const cardRefs = useRef({});
  const cardContainerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  // ============================================================================
  // MEMOIZED FUNCTIONS - Defined before useEffect hooks to prevent hoisting issues
  // ============================================================================

  const getUserLocation = useCallback(() => {
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
          const defaultLat = parseFloat(
            import.meta.env.VITE_DEFAULT_LAT || "51.5074"
          );
          const defaultLng = parseFloat(
            import.meta.env.VITE_DEFAULT_LNG || "-0.1278"
          );
          setUserLocation({ lat: defaultLat, lng: defaultLng });
        }
      );
    } else {
      const defaultLat = parseFloat(
        import.meta.env.VITE_DEFAULT_LAT || "51.5074"
      );
      const defaultLng = parseFloat(
        import.meta.env.VITE_DEFAULT_LAT || "-0.1278"
      );
      setUserLocation({ lat: defaultLat, lng: defaultLng });
    }
  }, []);

  const geocodeAddress = useCallback(async (address) => {
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
            resolve(null);
          }
        });
      });
    } catch (error) {
      return null;
    }
  }, []);

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/tenants/public");

      if (response.data.success && Array.isArray(response.data.tenants)) {
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
        setVenues([]);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [geocodeAddress]);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return;
    }

    try {
      await loadGoogleMapsScript(apiKey);

      // Safety check after loading
      if (!window.google?.maps) {
        console.error("Google Maps API not available after loading");
        return;
      }

      const defaultLat = parseFloat(
        import.meta.env.VITE_DEFAULT_LAT || "51.5074"
      );
      const defaultLng = parseFloat(
        import.meta.env.VITE_DEFAULT_LNG || "-0.1278"
      );
      const mapCenter = userLocation || { lat: defaultLat, lng: defaultLng };

      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      googleMapRef.current = map;

      // Wait for map to be fully ready before adding markers
      window.google.maps.event.addListenerOnce(map, "idle", () => {
        // Add user location marker first
        if (userLocation) {
          try {
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
              zIndex: 1000,
            });
          } catch (error) {
            console.error("Error adding user location marker:", error);
          }
        }

        // Then add venue markers
        updateMarkers();
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }, [userLocation]);

  const handleMarkerClick = useCallback((venue) => {
    setActiveVenueId(venue._id);

    // Scroll to card
    const cardElement = cardRefs.current[venue._id];
    if (cardElement && cardContainerRef.current) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, []);

  const updateMarkers = useCallback(() => {
    // Strict safety checks
    if (!googleMapRef.current) {
      console.log("Map not initialized yet");
      return;
    }

    if (!window.google?.maps?.OverlayView) {
      console.log("Google Maps API not fully loaded");
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        if (marker && marker.setMap) marker.setMap(null);
      } catch (err) {
        console.error("Error removing marker:", err);
      }
    });
    markersRef.current = [];

    // Add markers for each venue
    venues.forEach((venue) => {
      if (venue.location?.coordinates) {
        try {
          const [lng, lat] = venue.location.coordinates;
          const isActive = venue._id === activeVenueId;

          // Create custom HTML marker
          const markerDiv = document.createElement("div");
          markerDiv.innerHTML = `
            <div class="custom-marker ${
              isActive ? "active" : ""
            }" style="cursor: pointer;">
              <svg width="${isActive ? 48 : 32}" height="${
            isActive ? 48 : 32
          }" viewBox="0 0 32 32" class="drop-shadow-lg">
                <path
                  d="M16 0C10.477 0 6 4.477 6 10c0 8.5 10 22 10 22s10-13.5 10-22c0-5.523-4.477-10-10-10z"
                  fill="${isActive ? "#EF4444" : "#000000"}"
                  stroke="#ffffff"
                  stroke-width="2"
                />
                <circle cx="16" cy="10" r="4" fill="#ffffff"/>
              </svg>
            </div>
          `;

          const marker = new window.google.maps.OverlayView();
          marker.onAdd = function () {
            try {
              const panes = this.getPanes();
              if (panes?.overlayMouseTarget) {
                panes.overlayMouseTarget.appendChild(markerDiv);

                // Add click handler
                markerDiv.addEventListener("click", () => {
                  handleMarkerClick(venue);
                });
              }
            } catch (error) {
              console.error("Error in marker onAdd:", error);
            }
          };

          marker.draw = function () {
            try {
              const projection = this.getProjection();
              if (!projection) return;

              const position = projection.fromLatLngToDivPixel(
                new window.google.maps.LatLng(lat, lng)
              );

              if (position) {
                const size = isActive ? 48 : 32;
                markerDiv.style.left = position.x - size / 2 + "px";
                markerDiv.style.top = position.y - size + "px";
                markerDiv.style.position = "absolute";
              }
            } catch (error) {
              console.error("Error in marker draw:", error);
            }
          };

          marker.onRemove = function () {
            try {
              if (markerDiv.parentElement) {
                markerDiv.parentElement.removeChild(markerDiv);
              }
            } catch (error) {
              console.error("Error in marker onRemove:", error);
            }
          };

          try {
            marker.setMap(googleMapRef.current);
            markersRef.current.push(marker);
          } catch (error) {
            console.error("Error setting marker on map:", error);
          }
        } catch (err) {
          console.error("Error creating marker for venue:", venue._id, err);
        }
      }
    });
  }, [venues, activeVenueId, handleMarkerClick]);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
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
  }, []);

  // ============================================================================
  // MEMOIZED COMPUTED VALUES
  // ============================================================================

  // Apply filters - MEMOIZED for performance
  const filteredVenues = useMemo(
    () =>
      venues.filter((venue) => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          // Format address for search (address is an object, not a string)
          const addressStr =
            typeof venue.address === "string"
              ? venue.address
              : venue.address?.street || venue.address?.city || "";
          const matchesSearch =
            venue.name?.toLowerCase().includes(searchLower) ||
            addressStr?.toLowerCase().includes(searchLower) ||
            venue.description?.toLowerCase().includes(searchLower) ||
            venue.services?.some((service) =>
              service.name?.toLowerCase().includes(searchLower)
            );
          if (!matchesSearch) return false;
        }

        // Rating filter
        if (filters.rating !== "all") {
          const minRating = parseFloat(filters.rating);
          if ((venue.rating || 0) < minRating) return false;
        }

        return true;
      }),
    [venues, filters.search, filters.rating]
  );

  // Calculate distance and sort - MEMOIZED for performance
  const filteredVenuesWithDistance = useMemo(
    () =>
      filteredVenues
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
        .filter((venue) => {
          // Distance filter
          if (filters.distance !== "all") {
            const maxDistance = parseFloat(filters.distance);
            if (!venue.distance || venue.distance > maxDistance) return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        }),
    [filteredVenues, userLocation, filters.distance, calculateDistance]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

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

    // Cleanup scroll timer on unmount
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mapsLoaded) {
      fetchVenues();
    }
  }, [mapsLoaded, fetchVenues]);

  useEffect(() => {
    if (
      mapsLoaded &&
      venues.length > 0 &&
      mapRef.current &&
      googleMapRef.current
    ) {
      updateMarkers();
    }
  }, [mapsLoaded, venues, userLocation, activeVenueId, updateMarkers]);

  useEffect(() => {
    if (
      mapsLoaded &&
      venues.length > 0 &&
      mapRef.current &&
      !googleMapRef.current
    ) {
      initializeMap();
    }
  }, [mapsLoaded, venues, mapRef.current, initializeMap]);

  // Handle card scroll to update active venue and map center
  const handleScroll = useCallback(() => {
    if (!cardContainerRef.current || !filteredVenuesWithDistance.length) return;

    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const container = cardContainerRef.current;
      const cards = Object.values(cardRefs.current);

      // Find which card is most visible
      let maxVisible = 0;
      let mostVisibleVenue = null;

      cards.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const visibleHeight =
          Math.min(rect.bottom, containerRect.bottom) -
          Math.max(rect.top, containerRect.top);

        if (visibleHeight > maxVisible) {
          maxVisible = visibleHeight;
          const venueId = card.getAttribute("data-venue-id");
          mostVisibleVenue = venueId;
        }
      });

      if (mostVisibleVenue && mostVisibleVenue !== activeVenueId) {
        setActiveVenueId(mostVisibleVenue);

        // Recenter map on visible card
        const venue = venues.find((v) => v._id === mostVisibleVenue);
        if (googleMapRef.current && venue?.location?.coordinates) {
          const [lng, lat] = venue.location.coordinates;
          googleMapRef.current.panTo({ lat, lng });
        }
      }
    }, 150);
  }, [venues, activeVenueId, filteredVenuesWithDistance]);

  return (
    <>
      <SEOHead
        title="Discover Beauty & Wellness - EliteBooker"
        description="Find and book beauty salons, spas, and wellness businesses near you"
      />

      {/* Prevent iOS zoom on search input focus */}
      <style>{`
        @media (max-width: 768px) {
          input[type="text"] {
            font-size: 16px !important;
          }
        }
        
        /* Custom scrollbar for desktop */
        @media (min-width: 1024px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f9fafb;
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 4px;
            transition: background 0.2s;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #d1d5db;
          }
        }
        
        /* Smooth transitions */
        * {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="fixed inset-0 bg-white flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 z-[110] flex-shrink-0">
          <div className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5">
            <div className="flex items-center gap-3 lg:gap-4 max-w-screen-2xl mx-auto">
              <Link
                to="/"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 text-gray-900"
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
              </Link>

              <div className="flex-1 max-w-2xl relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-11 pr-4 py-3 lg:py-3.5 border border-gray-300 rounded-full focus:ring-1 focus:ring-black focus:border-black text-sm lg:text-base transition-all hover:shadow-md bg-white shadow-sm"
                  style={{ fontSize: "16px", touchAction: "manipulation" }}
                />
              </div>

              <Link
                to="/client/profile"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0 border border-gray-200"
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

        {/* Desktop: Side-by-side layout, Mobile: Bottom drawer */}
        <div className="flex-1 overflow-hidden relative flex flex-row">
          {/* Listings Panel - Desktop left side, Mobile bottom drawer */}
          <div className="hidden lg:flex lg:flex-col lg:w-[400px] xl:w-[440px] 2xl:w-[480px] h-full border-r border-gray-100 bg-white overflow-hidden">
            {/* Filter Bar */}
            <div className="flex-shrink-0 px-6 xl:px-8 py-5 border-b border-gray-100">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                <FilterChip
                  label="All distances"
                  active={filters.distance === "all"}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, distance: "all" }))
                  }
                />
                <FilterChip
                  label="Within 5 mi"
                  active={filters.distance === "5"}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, distance: "5" }))
                  }
                />
                <FilterChip
                  label="Within 10 mi"
                  active={filters.distance === "10"}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, distance: "10" }))
                  }
                />
                <FilterChip
                  label="4+ stars"
                  active={filters.rating === "4"}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      rating: filters.rating === "4" ? "all" : "4",
                    }))
                  }
                />
                <FilterChip
                  label="4.5+ stars"
                  active={filters.rating === "4.5"}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      rating: filters.rating === "4.5" ? "all" : "4.5",
                    }))
                  }
                />
              </div>
              {/* Results count */}
              <div className="mt-3.5">
                <p className="text-sm lg:text-base text-gray-600">
                  <strong className="font-semibold text-gray-900">
                    {filteredVenuesWithDistance.length}
                  </strong>{" "}
                  {filteredVenuesWithDistance.length === 1 ? "venue" : "venues"} found
                </p>
              </div>
            </div>

            {/* Business Cards - Scrollable */}
            <div 
              ref={cardContainerRef} 
              className="flex-1 overflow-y-auto px-4 xl:px-5 py-4 space-y-3 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#e5e7eb #f9fafb'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 text-sm">
                      Finding venues...
                    </p>
                  </div>
                </div>
              ) : filteredVenuesWithDistance.length === 0 ? (
                <div className="text-center py-20">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                    <p className="text-gray-900 font-medium mb-2">
                      No venues found
                    </p>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredVenuesWithDistance.map((venue, index) => (
                      <motion.div
                        key={venue._id}
                        ref={(el) => (cardRefs.current[venue._id] = el)}
                        data-venue-id={venue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      >
                        <BusinessCard
                          venue={venue}
                          active={venue._id === activeVenueId}
                          onClick={() => setActiveVenueId(venue._id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
            </div>
          </div>

          {/* Map Container - Desktop right side, Mobile full screen */}
          <div className="absolute lg:relative inset-0 lg:inset-auto lg:flex-1 h-full w-full bg-gray-100">
            <div ref={mapRef} className="w-full h-full" />
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
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
                  </svg>
                  <p className="text-sm font-medium text-gray-600">
                    Map view unavailable
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Configure VITE_GOOGLE_MAPS_API_KEY
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Bottom Drawer - Hidden on desktop */}
          <div className="lg:hidden">
            <BottomDrawer
              initialSnap="mid"
              onSnapChange={(snap) => console.log("Drawer snap:", snap)}
              header={
                <div>
                  {/* Filter Bar */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
                    <FilterChip
                      label="All distances"
                      active={filters.distance === "all"}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, distance: "all" }))
                      }
                    />
                    <FilterChip
                      label="Within 5 mi"
                      active={filters.distance === "5"}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, distance: "5" }))
                      }
                    />
                    <FilterChip
                      label="Within 10 mi"
                      active={filters.distance === "10"}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, distance: "10" }))
                      }
                    />
                    <FilterChip
                      label="4+ stars"
                      active={filters.rating === "4"}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          rating: filters.rating === "4" ? "all" : "4",
                        }))
                      }
                    />
                    <FilterChip
                      label="4.5+ stars"
                      active={filters.rating === "4.5"}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          rating: filters.rating === "4.5" ? "all" : "4.5",
                        }))
                      }
                    />
                  </div>
                  {/* Results count */}
                  <div className="py-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <strong className="font-semibold text-gray-900">
                        {filteredVenuesWithDistance.length}
                      </strong>{" "}
                      venues found
                    </p>
                  </div>
                </div>
              }
            >
              {/* Business Cards */}
              <div className="px-4 py-4 space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                      <p className="mt-4 text-gray-600 text-sm">
                        Finding venues...
                      </p>
                    </div>
                  </div>
                ) : filteredVenuesWithDistance.length === 0 ? (
                  <div className="text-center py-20">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                    <p className="text-gray-900 font-medium mb-2">
                      No venues found
                    </p>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredVenuesWithDistance.map((venue, index) => (
                      <motion.div
                        key={venue._id}
                        data-venue-id={venue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      >
                        <BusinessCard
                          venue={venue}
                          active={venue._id === activeVenueId}
                          onClick={() => setActiveVenueId(venue._id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </BottomDrawer>
          </div>
        </div>
      </div>
    </>
  );
}

// Filter Chip Component - Memoized to prevent unnecessary re-renders
const FilterChip = React.memo(function FilterChip({ label, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
        active
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:border-gray-900 hover:bg-gray-50"
      }`}
    >
      {label}
    </motion.button>
  );
});

// Business Card Component - Memoized to prevent unnecessary re-renders
const BusinessCard = React.memo(
  function BusinessCard({ venue, active, onClick }) {
    const defaultImage =
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80";

    // Use centerImage from HeroSection (returned by backend /tenants/public)
    // Priority: centerImage → coverImage → default placeholder
    const venueImage =
      venue.centerImage?.url || venue.coverImage?.url || defaultImage;

    // console.log("BusinessCard venue image:", {
    //   venueName: venue.name,
    //   centerImage: venue.centerImage,
    //   venueImage,
    // });

    const rating = venue.rating || 5.0;
    const reviewCount = venue.reviewCount || 0;

    // Memoize computed values
    const address = useMemo(() => {
      if (!venue.address) return "Address not available";
      if (typeof venue.address === "string") return venue.address;

      const parts = [venue.address.street, venue.address.city].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : "Address not available";
    }, [venue.address]);

    const minPrice = useMemo(() => {
      if (!venue.services || venue.services.length === 0) return null;
      const prices = venue.services.map((s) => s.price).filter(Boolean);
      return prices.length > 0 ? Math.min(...prices) : null;
    }, [venue.services]);

    return (
      <Link
        to={`/salon/${venue.slug}`}
        onClick={onClick}
        className={`group block bg-white rounded-xl overflow-hidden transition-all duration-200 ${
          active 
            ? "ring-2 ring-black shadow-lg" 
            : "hover:shadow-md border border-gray-100 hover:border-gray-200"
        }`}
      >
        <div className="flex gap-3 p-3">
          {/* Compact Image */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <OptimizedImage
              src={venueImage}
              alt={venue.name}
              width={96}
              height={96}
              crop="fill"
              quality="auto"
              format="auto"
              loading="lazy"
              blur={false}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Distance badge */}
            {venue.distance !== undefined && (
              <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded">
                <span className="text-[10px] font-semibold text-white">
                  {venue.distance.toFixed(1)}mi
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* Header */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1 leading-tight">
                {venue.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1 mb-2">{address}</p>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5 text-gray-900 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({reviewCount})
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {minPrice ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">From</span>
                  <span className="text-sm font-semibold text-gray-900">£{minPrice}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-500">View prices</span>
              )}
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span className="text-[10px] font-medium uppercase tracking-wide">Available</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for performance
    return (
      prevProps.venue._id === nextProps.venue._id &&
      prevProps.active === nextProps.active &&
      prevProps.venue.distance === nextProps.venue.distance
    );
  }
);
