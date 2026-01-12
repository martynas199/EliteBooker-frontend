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

  const locationButtonBottom = useMemo(() => {
    if (viewportWidth >= 1024) return "24px"; // desktop: keep near bottom right
    return `calc(${drawerHeight}vh + 12px)`; // sit just above the drawer on mobile
  }, [viewportWidth, drawerHeight]);

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

  // Error state with inline styles for mobile compatibility
  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#fee",
          padding: "20px",
          overflow: "auto",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ color: "red", marginBottom: "10px" }}>
          Error loading search page
        </h1>
        <p style={{ marginBottom: "20px" }}>{error}</p>
        <Link
          to="/"
          style={{
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "white",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  // Simple loading state with inline styles
  if (loading && venues.length === 0) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #7c3aed",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "20px", color: "#666" }}>Loading venues...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
        className="fixed inset-0 bg-white flex flex-col"
        style={{ minHeight: "100vh", height: "100dvh" }}
      >
        <header
          ref={headerRef}
          className={`absolute lg:relative top-0 left-0 right-0 z-[110] flex-shrink-0 transition-opacity duration-300 bg-transparent lg:bg-white ${
            drawerHeight > 80 ? "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto" : "opacity-100"
          }`}
        >
          <div className="px-4 lg:px-6 py-4 lg:py-5">
            <div className="flex items-center gap-3 lg:gap-4 max-w-screen-2xl mx-auto lg:justify-center">
              <Link
                to="/"
                className="w-10 h-10 lg:w-10 lg:h-10 flex items-center justify-center rounded-full lg:rounded-full bg-white shadow-lg lg:shadow-none lg:bg-gray-50 hover:bg-gray-50 lg:hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900"
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
              <div className="flex-1 lg:flex-initial max-w-2xl lg:max-w-none lg:w-[700px] relative">
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
                  className="w-full pl-11 pr-4 py-3 lg:py-3 bg-white lg:bg-white/70 lg:backdrop-blur-md border border-gray-300 lg:border-gray-200 rounded-full focus:outline-none focus:ring-0 focus:border-gray-900 lg:focus:border-gray-300 text-sm lg:text-base transition-all shadow-lg"
                  style={{ fontSize: "16px", touchAction: "manipulation" }}
                />
              </div>
              <button
                type="button"
                onClick={() => navigate("/menu")}
                className="w-10 h-10 lg:w-10 lg:h-10 rounded-full bg-white lg:bg-gray-50 flex items-center justify-center hover:bg-gray-200 lg:hover:bg-gray-100 transition-colors flex-shrink-0 border border-gray-200 lg:border-transparent shadow-lg lg:shadow-none"
                aria-label="Open menu"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 lg:text-gray-800"
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
        <div className="flex-1 overflow-hidden relative flex flex-row">
          <div className="hidden lg:flex lg:flex-col lg:w-[850px] xl:w-[900px] 2xl:w-[950px] h-full bg-white overflow-hidden">
            <div className="flex-shrink-0 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong className="font-semibold text-gray-900">
                      {filteredVenuesWithDistance.length}k+
                    </strong>{" "}
                    venues nearby
                  </p>
                </div>
                <div className="flex gap-2">
                  <FilterChip
                    label="Filters"
                    active={false}
                    onClick={() => {}}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
                  />
                  <FilterChip
                    label="Hide map"
                    active={false}
                    onClick={() => {}}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
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
                      className="rounded-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className="h-32 bg-gray-100 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 w-2/3 bg-gray-100 animate-pulse rounded" />
                        <div className="h-2 w-1/2 bg-gray-100 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVenuesWithDistance.length === 0 ? (
                <div className="text-center py-20 col-span-2">
                  <p className="text-gray-900 font-medium mb-2">
                    No venues found
                  </p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filters
                  </p>
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
          <div className="absolute lg:relative inset-0 lg:inset-auto lg:flex-1 h-full w-full bg-white lg:p-4">
            <div ref={mapRef} className="w-full h-full lg:rounded-2xl lg:overflow-hidden lg:shadow-sm" />
            <button
              type="button"
              onClick={recenterToUser}
              className="absolute right-4 lg:right-8 bottom-4 lg:bottom-8 z-[200] w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-transform"
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
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-lg z-[100] transition-all flex flex-col"
          style={{
            height: `${drawerHeight}vh`,
            transition: isDragging ? "none" : "height 0.25s ease-out",
          }}
        >
          <div
            className="drawer-handle flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`w-10 h-1 rounded-full ${
                isDragging ? "bg-gray-400" : "bg-gray-300"
              }`}
            />
          </div>
          <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
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
            <div className="pt-2">
              <p className="text-xs text-gray-600">
                <strong className="font-semibold text-gray-900">
                  {filteredVenuesWithDistance.length}
                </strong>{" "}
                venues
              </p>
            </div>
          </div>
          <div
            ref={contentScrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 pb-32"
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
                    className="rounded-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="h-36 bg-gray-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded" />
                      <div className="h-10 w-full bg-gray-100 animate-pulse rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVenuesWithDistance.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-900 font-medium mb-2">
                  No venues found
                </p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
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

const FilterChip = React.memo(function FilterChip({ label, active, onClick, icon }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 ${
        active
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:border-gray-900 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
});
