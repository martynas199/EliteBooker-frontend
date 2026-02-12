import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import SEOHead from "../../shared/components/seo/SEOHead";
import BottomDrawer from "../components/BottomDrawer";
import React from "react";
import { useSuperclusterVenues } from "../hooks/useSuperclusterVenues";
import VenueCard from "../components/search/VenueCard";
import MapPopoverCard from "../components/search/MapPopoverCard";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";

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
      existingScript.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function SearchPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useClientAuth();
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVenueId, setActiveVenueId] = useState(null);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    distance: "all",
    priceRange: "all",
    rating: "all",
    availability: "all",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(60); // percentage of viewport height
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 0
  );
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isContentAtTop, setIsContentAtTop] = useState(true);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const contentScrollRef = useRef(null);
  const headerRef = useRef(null);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const overlayRef = useRef(null);
  const markerMapRef = useRef(new Map());
  const nativeMarkersRef = useRef(new Map());
  const lastClusterKeysRef = useRef("");
  const cardRefs = useRef({});
  const cardContainerRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const pendingRecenterRef = useRef(false);
  const userLocationMarkerRef = useRef(null);

  // Add console log to debug
  useEffect(() => {
    console.log("[SearchPage] Component mounted");

    // Force page to top and prevent body scroll
    window.scrollTo(0, 0);
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyOverscroll = document.body.style.overscrollBehaviorY;
    const prevHtmlOverscroll =
      document.documentElement.style.overscrollBehaviorY;

    document.body.style.overflow = "hidden";
    // Prevent downward swipe from triggering browser pull-to-refresh and stealing scroll.
    document.body.style.overscrollBehaviorY = "none";
    document.documentElement.style.overscrollBehaviorY = "none";

    return () => {
      console.log("[SearchPage] Component unmounted");
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overscrollBehaviorY = prevBodyOverscroll;
      document.documentElement.style.overscrollBehaviorY = prevHtmlOverscroll;

      // Cleanup native markers
      for (const [, marker] of nativeMarkersRef.current.entries()) {
        try {
          marker.setMap(null);
        } catch {}
      }
      nativeMarkersRef.current.clear();

      if (userLocationMarkerRef.current) {
        try {
          userLocationMarkerRef.current.setMap(null);
        } catch {}
        userLocationMarkerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const getUserLocation = useCallback(() => {
    const defaultLat = parseFloat(
      import.meta.env.VITE_DEFAULT_LAT || "51.5074"
    );
    const defaultLng = parseFloat(
      import.meta.env.VITE_DEFAULT_LNG || "-0.1278"
    );
    if (!navigator.geolocation) {
      setUserLocation({ lat: defaultLat, lng: defaultLng });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setUserLocation({ lat: defaultLat, lng: defaultLng });
      }
    );
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 3959;
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

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/tenants/public");
      console.log("Fetched venues:", response.data);
      if (response.data.success && Array.isArray(response.data.tenants)) {
        // Geocode venues that don't have coordinates
        const venuesWithCoords = await Promise.all(
          response.data.tenants.map(async (venue) => {
            // Check if venue already has valid coordinates
            if (
              Array.isArray(venue.location?.coordinates) &&
              venue.location.coordinates.length === 2
            ) {
              return venue;
            }

            // Try to geocode from address
            if (venue.address) {
              try {
                const addressStr =
                  typeof venue.address === "string"
                    ? venue.address
                    : [
                        venue.address.street,
                        venue.address.city,
                        venue.address.postalCode,
                        venue.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ");

                if (addressStr && window.google?.maps) {
                  const geocoder = new window.google.maps.Geocoder();
                  const result = await new Promise((resolve) => {
                    geocoder.geocode(
                      { address: addressStr },
                      (results, status) => {
                        if (status === "OK" && results?.[0]) {
                          const location = results[0].geometry.location;
                          resolve({
                            ...venue,
                            location: {
                              type: "Point",
                              coordinates: [location.lng(), location.lat()],
                            },
                          });
                        } else {
                          resolve(venue);
                        }
                      }
                    );
                  });
                  return result;
                }
              } catch (err) {
                console.warn("Geocoding failed for venue:", venue.name, err);
              }
            }

            return venue;
          })
        );

        setVenues(venuesWithCoords);
        console.log("Set venues:", venuesWithCoords.length);
        const firstVenue = venuesWithCoords[0];
        console.log(
          "First venue location after geocoding:",
          firstVenue?.location
        );
      } else {
        setVenues([]);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
      setError(error.message || "Failed to load venues");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredVenues = useMemo(
    () =>
      venues.filter((venue) => {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
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
        if (filters.rating !== "all") {
          const minRating = parseFloat(filters.rating);
          if ((venue.rating || 0) < minRating) return false;
        }
        return true;
      }),
    [venues, filters.search, filters.rating]
  );

  const filteredVenuesWithDistance = useMemo(
    () =>
      filteredVenues
        .map((venue) => {
          if (userLocation) {
            let venueLat, venueLng;

            // Support multiple location formats
            if (Array.isArray(venue.location?.coordinates)) {
              [venueLng, venueLat] = venue.location.coordinates;
            } else if (
              venue.location?.lat != null &&
              venue.location?.lng != null
            ) {
              venueLat = venue.location.lat;
              venueLng = venue.location.lng;
            } else if (
              venue.location?.latitude != null &&
              venue.location?.longitude != null
            ) {
              venueLat = venue.location.latitude;
              venueLng = venue.location.longitude;
            } else if (venue.lat != null && venue.lng != null) {
              venueLat = venue.lat;
              venueLng = venue.lng;
            }

            if (venueLat != null && venueLng != null) {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                venueLat,
                venueLng
              );
              return { ...venue, distance };
            }
          }
          return venue;
        })
        .filter((venue) => {
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

  const { index: superclusterIndex } = useSuperclusterVenues(
    filteredVenuesWithDistance
  );
  const selectedVenue = useMemo(() => {
    if (!selectedVenueId) return null;
    return (
      filteredVenuesWithDistance.find((v) => v._id === selectedVenueId) || null
    );
  }, [selectedVenueId, filteredVenuesWithDistance]);

  const initializeMap = useCallback(async () => {
    console.log("initializeMap called", { hasMapRef: !!mapRef.current });
    if (!mapRef.current) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log("Google Maps API Key:", apiKey ? "present" : "missing");
    if (!apiKey) return;
    await loadGoogleMapsScript(apiKey);
    if (!window.google?.maps) return;
    const defaultLat = parseFloat(
      import.meta.env.VITE_DEFAULT_LAT || "51.5074"
    );
    const defaultLng = parseFloat(
      import.meta.env.VITE_DEFAULT_LNG || "-0.1278"
    );
    const mapCenter = userLocation || { lat: defaultLat, lng: defaultLng };
    console.log("Creating map with center:", mapCenter);
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
          featureType: "landscape.natural",
          elementType: "geometry.fill",
          stylers: [{ color: "#B8D4A8" }],
        },
        {
          featureType: "landscape.natural.landcover",
          elementType: "geometry.fill",
          stylers: [{ color: "#C2DDB4" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry.fill",
          stylers: [{ color: "#A1D0A2" }],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#64B5F6" }, { lightness: 25 }],
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#E0E0E0" }, { weight: 0.5 }],
        },
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    googleMapRef.current = map;
    console.log("Map created successfully", map);
    const overlay = new window.google.maps.OverlayView();
    overlay.onAdd = function () {};
    overlay.draw = function () {};
    overlay.onRemove = function () {};
    overlay.setMap(map);
    overlayRef.current = overlay;
    console.log("Overlay created and set to map");
    setMapReady(true);
  }, [userLocation]);

  const getMapBBox = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return null;
    const bounds = map.getBounds();
    if (!bounds) return null;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    return [sw.lng(), sw.lat(), ne.lng(), ne.lat()];
  }, []);

  const positionMarker = useCallback((div, feature) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const projection = overlay.getProjection();
    if (!projection) return;
    const [lng, lat] = feature.geometry.coordinates;
    const point = projection.fromLatLngToDivPixel(
      new window.google.maps.LatLng(lat, lng)
    );
    if (!point) return;
    div.style.left = `${point.x}px`;
    div.style.top = `${point.y}px`;
  }, []);

  const updateMarkerAppearance = useCallback(
    (div, venueId) => {
      const isActive = venueId === activeVenueId;
      const size = isActive ? 60 : 38;
      const fill = isActive ? "#EF4444" : "#111111";
      div.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" style="filter: drop-shadow(0 8px 12px rgba(0,0,0,0.25));">
        <path
          d="M16 0C10.477 0 6 4.477 6 10c0 8.5 10 22 10 22s10-13.5 10-22c0-5.523-4.477-10-10-10z"
          fill="${fill}"
          stroke="#ffffff"
          stroke-width="2"
        />
        <circle cx="16" cy="10" r="4" fill="#ffffff" />
      </svg>
    `;
    },
    [activeVenueId]
  );

  const renderClusterMarkers = useCallback(() => {
    const map = googleMapRef.current;
    const overlay = overlayRef.current;
    console.log("renderClusterMarkers called", {
      map: !!map,
      overlay: !!overlay,
      superclusterIndex: !!superclusterIndex,
    });
    if (!map || !overlay || !superclusterIndex) return;
    const bbox = getMapBBox();
    if (!bbox) return;
    const zoom = Math.round(map.getZoom() || 12);
    const clusters = superclusterIndex.getClusters(bbox, zoom);
    console.log("Clusters found:", clusters.length, clusters);
    const keys = clusters
      .map((c) =>
        c.properties.cluster
          ? `c:${c.id}:${c.properties.point_count}`
          : `p:${c.properties.venueId}`
      )
      .join("|");
    if (keys === lastClusterKeysRef.current) return;
    lastClusterKeysRef.current = keys;
    const nextKeys = new Set();
    clusters.forEach((feature) => {
      const isCluster = feature.properties.cluster;
      const key = isCluster
        ? `cluster:${feature.id}`
        : `venue:${feature.properties.venueId}`;
      nextKeys.add(key);
      const existing = markerMapRef.current.get(key);
      if (existing) {
        existing.feature = feature;
        positionMarker(existing.div, feature);
        if (!isCluster) {
          updateMarkerAppearance(existing.div, feature.properties.venueId);
        }
        return;
      }
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.transform = isCluster
        ? "translate(-50%, -50%)"
        : "translate(-50%, -100%)";
      div.style.cursor = "pointer";
      if (isCluster) {
        const count = feature.properties.point_count;
        div.innerHTML = `
          <div style="
            width: 40px; height: 40px;
            border-radius: 9999px;
            background: #111;
            color: #fff;
            display:flex;
            align-items:center;
            justify-content:center;
            border: 3px solid #fff;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            font-weight: 700;
            font-size: 13px;
          ">${count}</div>
        `;
        div.addEventListener("click", () => {
          const expansionZoom = Math.min(
            superclusterIndex.getClusterExpansionZoom(feature.id),
            18
          );
          const [lng, lat] = feature.geometry.coordinates;
          map.setZoom(expansionZoom);
          map.panTo({ lat, lng });
        });
      } else {
        const venueId = feature.properties.venueId;
        updateMarkerAppearance(div, venueId);
        div.addEventListener("click", () => {
          setActiveVenueId(venueId);
          setSelectedVenueId(venueId);
          const cardElement = cardRefs.current[venueId];
          if (cardElement && cardContainerRef.current) {
            cardElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        });
      }
      const markerOverlay = new window.google.maps.OverlayView();
      markerOverlay.onAdd = function () {
        const panes = this.getPanes();
        panes?.overlayMouseTarget?.appendChild(div);
      };
      markerOverlay.draw = function () {
        positionMarker(div, feature);
      };
      markerOverlay.onRemove = function () {
        div.remove();
      };
      markerOverlay.setMap(map);
      markerMapRef.current.set(key, { overlay: markerOverlay, div, feature });
    });
    for (const [key, value] of markerMapRef.current.entries()) {
      if (!nextKeys.has(key)) {
        try {
          value.overlay.setMap(null);
        } catch {}
        markerMapRef.current.delete(key);
      }
    }
  }, [getMapBBox, superclusterIndex, activeVenueId, updateMarkerAppearance]);

  const mobileDrawerHeightPx = useMemo(() => {
    const vh =
      viewportHeight ||
      (typeof window !== "undefined" ? window.innerHeight : 0);
    if (!vh) return 0;
    return Math.round((drawerHeight / 100) * vh);
  }, [drawerHeight, viewportHeight]);

  const locationButtonBottom = useMemo(() => {
    if (viewportWidth >= 1024) return "28px";
    const offset = Math.max(88, mobileDrawerHeightPx + 14);
    return `${offset}px`;
  }, [viewportWidth, mobileDrawerHeightPx]);

  const recenterToUser = useCallback(() => {
    const map = googleMapRef.current;
    if (!map) return;

    if (userLocation) {
      map.panTo(userLocation);
      const currentZoom = map.getZoom() || 12;
      if (currentZoom < 14) map.setZoom(14);
      return;
    }

    // If we don't have a location yet, fetch it and recenter once available.
    pendingRecenterRef.current = true;
    getUserLocation();
  }, [userLocation, getUserLocation]);

  const popoverRef = useRef(null);

  const positionPopover = useCallback(() => {
    const map = googleMapRef.current;
    const overlay = overlayRef.current;
    const venue = selectedVenue;
    const popEl = popoverRef.current;
    if (!map || !overlay || !venue || !popEl) return;

    let venueLat, venueLng;
    // Support multiple location formats
    if (Array.isArray(venue.location?.coordinates)) {
      [venueLng, venueLat] = venue.location.coordinates;
    } else if (venue.location?.lat != null && venue.location?.lng != null) {
      venueLat = venue.location.lat;
      venueLng = venue.location.lng;
    } else if (
      venue.location?.latitude != null &&
      venue.location?.longitude != null
    ) {
      venueLat = venue.location.latitude;
      venueLng = venue.location.longitude;
    } else if (venue.lat != null && venue.lng != null) {
      venueLat = venue.lat;
      venueLng = venue.lng;
    } else {
      return; // No valid location
    }

    const projection = overlay.getProjection();
    if (!projection) return;
    const point = projection.fromLatLngToDivPixel(
      new window.google.maps.LatLng(venueLat, venueLng)
    );
    if (!point) return;

    const popWidth = popEl.offsetWidth || 0;
    const popHeight = popEl.offsetHeight || 0;
    const headerBottom = headerRef.current
      ? headerRef.current.getBoundingClientRect().bottom
      : 0;
    const viewportW = window.innerWidth || 0;
    const viewportH = window.innerHeight || 0;
    const margin = 12;

    const minX = margin + popWidth / 2;
    const maxX = Math.max(minX, viewportW - margin - popWidth / 2);
    const clampedX = Math.min(Math.max(point.x, minX), maxX);

    const desiredAboveTop = point.y - popHeight - 14;
    const desiredBelowBottom = point.y + 14 + popHeight;

    // Prefer above; flip below if it would be hidden under the header.
    let mode = "above";
    if (desiredAboveTop < headerBottom + margin) mode = "below";

    // If below would overflow bottom, pin just under the header.
    if (mode === "below" && desiredBelowBottom > viewportH - margin) {
      popEl.style.left = `${clampedX}px`;
      popEl.style.top = `${Math.round(headerBottom + margin)}px`;
      popEl.style.transform = "translate(-50%, 0px)";
      return;
    }

    popEl.style.left = `${clampedX}px`;
    popEl.style.top = `${point.y}px`;
    popEl.style.transform =
      mode === "below"
        ? "translate(-50%, 14px)"
        : "translate(-50%, calc(-100% - 14px))";
  }, [selectedVenue]);

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
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      for (const [, value] of markerMapRef.current.entries()) {
        try {
          value.overlay.setMap(null);
        } catch {}
      }
      markerMapRef.current.clear();

      for (const [, marker] of nativeMarkersRef.current.entries()) {
        try {
          marker.setMap(null);
        } catch {}
      }
      nativeMarkersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (mapsLoaded) fetchVenues();
  }, [mapsLoaded, fetchVenues]);

  useEffect(() => {
    if (
      mapsLoaded &&
      filteredVenuesWithDistance.length &&
      mapRef.current &&
      !googleMapRef.current
    ) {
      initializeMap();
    }
  }, [mapsLoaded, filteredVenuesWithDistance.length, initializeMap]);

  useEffect(() => {
    const map = googleMapRef.current;
    if (!map) return;
    const onIdle = window.google?.maps?.event?.addListener(map, "idle", () => {
      renderClusterMarkers();
    });
    return () => {
      if (onIdle) onIdle.remove();
    };
  }, [renderClusterMarkers]);

  // Fallback markers: if the custom overlay cluster markers aren't showing for any reason,
  // render basic Google Maps markers so venues are always visible on the map.
  useEffect(() => {
    const map = googleMapRef.current;
    if (!mapsLoaded || !mapReady) return;
    if (!map || !window.google?.maps) return;

    // If the custom overlay markers are present, don't render duplicates.
    if (markerMapRef.current.size > 0) {
      for (const [, marker] of nativeMarkersRef.current.entries()) {
        try {
          marker.setMap(null);
        } catch {}
      }
      nativeMarkersRef.current.clear();
      return;
    }

    const nextIds = new Set();
    for (const venue of filteredVenuesWithDistance) {
      let venueLat;
      let venueLng;

      if (Array.isArray(venue.location?.coordinates)) {
        [venueLng, venueLat] = venue.location.coordinates;
      } else if (venue.location?.lat != null && venue.location?.lng != null) {
        venueLat = venue.location.lat;
        venueLng = venue.location.lng;
      } else if (
        venue.location?.latitude != null &&
        venue.location?.longitude != null
      ) {
        venueLat = venue.location.latitude;
        venueLng = venue.location.longitude;
      } else if (venue.lat != null && venue.lng != null) {
        venueLat = venue.lat;
        venueLng = venue.lng;
      }

      if (venueLat == null || venueLng == null) continue;

      nextIds.add(venue._id);
      const existing = nativeMarkersRef.current.get(venue._id);
      if (existing) {
        try {
          existing.setPosition({ lat: venueLat, lng: venueLng });
        } catch {}
        continue;
      }

      try {
        const marker = new window.google.maps.Marker({
          position: { lat: venueLat, lng: venueLng },
          map,
          title: venue.name,
        });
        marker.addListener("click", () => {
          setActiveVenueId(venue._id);
          setSelectedVenueId(venue._id);
        });
        nativeMarkersRef.current.set(venue._id, marker);
      } catch (e) {
        // ignore marker failures
      }
    }

    for (const [id, marker] of nativeMarkersRef.current.entries()) {
      if (!nextIds.has(id)) {
        try {
          marker.setMap(null);
        } catch {}
        nativeMarkersRef.current.delete(id);
      }
    }
  }, [filteredVenuesWithDistance, mapsLoaded, mapReady]);

  useEffect(() => {
    if (!googleMapRef.current) return;
    lastClusterKeysRef.current = "";
    renderClusterMarkers();
  }, [filteredVenuesWithDistance, renderClusterMarkers]);

  useEffect(() => {
    const map = googleMapRef.current;
    if (!map) return;
    positionPopover();
    const onIdle = window.google?.maps?.event?.addListener(map, "idle", () => {
      positionPopover();
    });
    return () => {
      if (onIdle) onIdle.remove();
    };
  }, [positionPopover, selectedVenueId]);

  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !window.google?.maps) return;

    if (!userLocation) {
      if (userLocationMarkerRef.current) {
        try {
          userLocationMarkerRef.current.setMap(null);
        } catch {}
        userLocationMarkerRef.current = null;
      }
      return;
    }

    const icon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#2563eb",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
    };

    if (!userLocationMarkerRef.current) {
      try {
        userLocationMarkerRef.current = new window.google.maps.Marker({
          position: userLocation,
          map,
          icon,
          zIndex: 1200,
        });
      } catch {}
    } else {
      try {
        userLocationMarkerRef.current.setPosition(userLocation);
        userLocationMarkerRef.current.setIcon(icon);
        userLocationMarkerRef.current.setMap(map);
      } catch {}
    }
  }, [userLocation, mapReady]);

  useEffect(() => {
    if (pendingRecenterRef.current && userLocation && googleMapRef.current) {
      googleMapRef.current.panTo(userLocation);
      const currentZoom = googleMapRef.current.getZoom() || 12;
      if (currentZoom < 14) googleMapRef.current.setZoom(14);
      pendingRecenterRef.current = false;
    }
  }, [userLocation]);

  const handleScroll = useCallback(() => {
    if (!cardContainerRef.current || !filteredVenuesWithDistance.length) return;
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const container = cardContainerRef.current;
      const cards = Object.values(cardRefs.current);
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
          mostVisibleVenue = card.getAttribute("data-venue-id");
        }
      });
      if (mostVisibleVenue && mostVisibleVenue !== activeVenueId) {
        setActiveVenueId(mostVisibleVenue);
      }
    }, 120);
  }, [activeVenueId, filteredVenuesWithDistance.length]);

  const handleContentScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setIsContentAtTop(scrollTop <= 5);
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      const touch = e.touches[0];
      dragStartY.current = touch.clientY;
      dragStartHeight.current = drawerHeight;
      setIsDragging(true);
    },
    [drawerHeight]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaY = dragStartY.current - touch.clientY;
      const vh = viewportHeight || window.innerHeight;
      const deltaPercent = (deltaY / vh) * 100;
      const newHeight = Math.max(
        25,
        Math.min(83, dragStartHeight.current + deltaPercent)
      );
      setDrawerHeight(newHeight);
    },
    [isDragging, viewportHeight]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    // Snap to nearest position
    if (drawerHeight < 42.5) {
      setDrawerHeight(25); // collapsed
    } else if (drawerHeight < 77.5) {
      setDrawerHeight(60); // mid
    } else {
      setDrawerHeight(83); // expanded - leave room for browser chrome
    }
  }, [drawerHeight]);

  const resetFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      distance: "all",
      rating: "all",
      priceRange: "all",
      availability: "all",
    }));
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f6f2ea] p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 text-center shadow-xl sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
            !
          </div>
          <h1 className="mb-2 text-xl font-semibold text-slate-950">
            Error loading search page
          </h1>
          <p className="mb-6 text-sm text-slate-600">{error}</p>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (loading && venues.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f6f2ea] px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading venues near you...
        </p>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Discover Beauty & Wellness - EliteBooker"
        description="Find and book beauty salons, spas, and wellness businesses near you"
      />
      <div
        className="fixed inset-0 flex flex-col bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]"
        style={{ minHeight: "100vh", height: "100dvh" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-900/10 to-transparent" />
        <header
          ref={headerRef}
          className={`absolute left-0 right-0 top-0 z-[110] flex-shrink-0 transition-opacity duration-300 lg:relative lg:bg-transparent ${
            drawerHeight > 80
              ? "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto"
              : "opacity-100"
          }`}
        >
          <div
            className="px-3 pb-2 pt-3 sm:px-4 lg:px-6 lg:pt-5"
            style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
          >
            <div className="mx-auto flex max-w-screen-2xl items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/92 px-2.5 py-2 shadow-[0_16px_35px_-22px_rgba(15,23,42,0.7)] backdrop-blur-xl lg:w-[760px] lg:rounded-full lg:px-3.5">
              <Link
                to="/"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-50"
              >
                <svg
                  className="h-5 w-5 text-slate-900 lg:h-5 lg:w-5"
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
              <div className="relative flex-1 lg:w-[640px]">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                  style={{ fontSize: "16px", touchAction: "manipulation" }}
                />
              </div>
              <button
                type="button"
                onClick={() => navigate("/menu")}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                aria-label="Open menu"
              >
                <svg
                  className="h-5 w-5 text-slate-700 lg:h-5 lg:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <div className="relative flex flex-1 flex-row overflow-hidden">
          <div className="hidden h-full overflow-hidden border-r border-slate-200/80 bg-white/95 lg:flex lg:w-[850px] lg:flex-col xl:w-[900px] 2xl:w-[950px]">
            <div className="flex-shrink-0 px-5 py-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Search results
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    <strong className="font-semibold text-slate-900">
                      {filteredVenuesWithDistance.length.toLocaleString()}
                    </strong>{" "}
                    venues nearby
                  </p>
                </div>
                <div className="flex gap-2">
                  <FilterChip
                    label="Filters"
                    active={false}
                    onClick={() => {}}
                    icon={
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
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    }
                  />
                  <FilterChip
                    label="Hide map"
                    active={false}
                    onClick={() => {}}
                    icon={
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
                    }
                  />
                </div>
              </div>
            </div>
            <div
              ref={cardContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide"
            >
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <div className="h-32 animate-pulse bg-slate-100" />
                      <div className="space-y-2 p-3">
                        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                        <div className="h-2 w-1/2 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVenuesWithDistance.length === 0 ? (
                <div className="col-span-2 mx-auto mt-10 max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                  <p className="mb-2 text-lg font-semibold text-slate-900">
                    No venues found
                  </p>
                  <p className="text-sm text-slate-500">
                    Try adjusting your search or filters
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {filteredVenuesWithDistance.map((venue, index) => (
                      <motion.div
                        key={venue._id}
                        ref={(el) => (cardRefs.current[venue._id] = el)}
                        data-venue-id={venue._id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{
                          delay: index * 0.03,
                          type: "spring",
                          stiffness: 280,
                          damping: 24,
                        }}
                        onMouseEnter={() => setActiveVenueId(venue._id)}
                      >
                        <VenueCard
                          venue={venue}
                          active={venue._id === activeVenueId}
                          onClick={() => {
                            setActiveVenueId(venue._id);
                            setSelectedVenueId(venue._id);
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          <div className="absolute inset-0 h-full w-full bg-[#f6f2ea] lg:relative lg:inset-auto lg:flex-1 lg:p-4">
            <div
              ref={mapRef}
              className="h-full w-full lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-slate-200/80 lg:shadow-[0_24px_48px_-30px_rgba(15,23,42,0.45)]"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent lg:hidden" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent lg:hidden" />
            <button
              type="button"
              onClick={recenterToUser}
              className="absolute right-4 z-[200] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-[0_14px_26px_-16px_rgba(15,23,42,0.7)] transition-transform active:scale-95 hover:bg-slate-50 lg:right-8"
              style={{ bottom: locationButtonBottom }}
              aria-label="Center on your location"
            >
              <svg
                className="w-5 h-5 text-gray-800"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M20.48 3.52a.75.75 0 0 0-.86-.15l-15 7a.75.75 0 0 0 .1 1.4l6.22 1.6 1.6 6.22a.75.75 0 0 0 1.4.1l7-15a.75.75 0 0 0-.15-.86Z"
                />
              </svg>
            </button>
            {selectedVenue && (
              <div
                ref={popoverRef}
                className="absolute z-[1000]"
                style={{ left: 0, top: 0 }}
              >
                <MapPopoverCard
                  venue={selectedVenue}
                  onClose={() => setSelectedVenueId(null)}
                />
              </div>
            )}
          </div>
        </div>
        <div
          className="fixed bottom-0 left-0 right-0 z-[120] flex flex-col rounded-t-[30px] border border-white/70 bg-white/95 shadow-[0_-22px_48px_-30px_rgba(15,23,42,0.7)] backdrop-blur-xl transition-all lg:hidden"
          style={{
            height: mobileDrawerHeightPx
              ? `${mobileDrawerHeightPx}px`
              : `${drawerHeight}vh`,
            transition: isDragging ? "none" : "height 0.25s ease-out",
            paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
          }}
        >
          <div
            className="drawer-handle flex cursor-grab items-center justify-center pb-2 pt-3 active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`h-1.5 w-12 rounded-full ${
                isDragging ? "bg-slate-500" : "bg-slate-300"
              }`}
            />
          </div>
          <div className="flex-shrink-0 border-b border-slate-200/90 px-4 pb-3 pt-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Nearby venues
              </p>
              <p className="text-xs text-slate-600">
                <strong className="font-semibold text-slate-900">
                  {filteredVenuesWithDistance.length.toLocaleString()}
                </strong>{" "}
                results
              </p>
            </div>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              <FilterChip
                label="All distances"
                active={filters.distance === "all"}
                onClick={() => setFilters((p) => ({ ...p, distance: "all" }))}
              />
              <FilterChip
                label="Within 5 mi"
                active={filters.distance === "5"}
                onClick={() => setFilters((p) => ({ ...p, distance: "5" }))}
              />
              <FilterChip
                label="Within 10 mi"
                active={filters.distance === "10"}
                onClick={() => setFilters((p) => ({ ...p, distance: "10" }))}
              />
              <FilterChip
                label="4+ stars"
                active={filters.rating === "4"}
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    rating: p.rating === "4" ? "all" : "4",
                  }))
                }
              />
              <FilterChip
                label="4.5+ stars"
                active={filters.rating === "4.5"}
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    rating: p.rating === "4.5" ? "all" : "4.5",
                  }))
                }
              />
            </div>
          </div>
          <div
            ref={contentScrollRef}
            className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-3 pb-20"
            style={{
              WebkitOverflowScrolling: "touch",
              overflowY: "auto",
              overscrollBehaviorY: "contain",
              touchAction: "auto",
              position: "relative",
            }}
            onScroll={handleContentScroll}
            onTouchStartCapture={(e) => {
              // Keep scroll gestures inside the list; don't let them bubble to the drawer drag handlers.
              e.stopPropagation();
              if (isDragging) setIsDragging(false);
            }}
            onTouchMoveCapture={(e) => {
              e.stopPropagation();
            }}
          >
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="h-36 animate-pulse bg-slate-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                      <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVenuesWithDistance.length === 0 ? (
              <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                <p className="mb-2 text-lg font-semibold text-slate-900">
                  No venues found
                </p>
                <p className="text-sm text-slate-500">
                  Try adjusting your search or filters
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredVenuesWithDistance.map((venue) => (
                <VenueCard
                  key={venue._id}
                  venue={venue}
                  active={venue._id === activeVenueId}
                  onClick={() => {
                    setActiveVenueId(venue._id);
                    setSelectedVenueId(venue._id);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const FilterChip = React.memo(function FilterChip({
  label,
  active,
  onClick,
  icon,
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex h-10 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[13px] font-semibold transition-all ${
        active
          ? "border-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-[0_10px_20px_-14px_rgba(15,23,42,0.9)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
});
