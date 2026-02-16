import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useClientAuth } from "../../contexts/ClientAuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { createGiftCardCheckoutSession } from "../../api/giftCards.api";
import { api } from "../../lib/apiClient";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const PRESET_AMOUNTS = [25, 50, 100, 150, 200];
const STEP_TRANSITION = {
  initial: { opacity: 0, x: 14 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -14 },
  transition: { duration: 0.22, ease: "easeOut" },
};

const CARD_THEMES = [
  {
    key: "midnight",
    label: "Midnight",
    cardClass: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700",
    chipClass: "bg-white/25",
  },
  {
    key: "plum",
    label: "Plum",
    cardClass: "bg-gradient-to-br from-violet-800 via-fuchsia-700 to-rose-600",
    chipClass: "bg-white/30",
  },
  {
    key: "forest",
    label: "Forest",
    cardClass: "bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700",
    chipClass: "bg-white/25",
  },
];

const formatBusinessLocation = (business) => {
  if (!business) return "";
  const rawAddress = business.address;
  if (typeof rawAddress === "string") return rawAddress;
  if (rawAddress && typeof rawAddress === "object") {
    return [rawAddress.city, rawAddress.postalCode, rawAddress.country]
      .filter(Boolean)
      .join(" • ");
  }
  return "";
};

const RECENT_GIFT_CARD_BUSINESSES_KEY = "giftCardRecentBusinesses";

const getBusinessCoordinates = (business) => {
  const coordinates = business?.location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const calculateDistanceKm = (from, to) => {
  if (!from || !to) return null;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const formatDistance = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away`;
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - timezoneOffsetMs);
  return local.toISOString().slice(0, 16);
};

export default function GiftCardModal({ isOpen, onClose, onSuccess }) {
  const shouldReduceMotion = useReducedMotion();
  const { client, isAuthenticated } = useClientAuth();
  const { tenant } = useTenant();
  const hasTenantContext = Boolean(tenant?._id);
  const [availableBusinesses, setAvailableBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const [recentBusinessIds, setRecentBusinessIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(RECENT_GIFT_CARD_BUSINESSES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  });
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Review
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    amount: 50,
    customAmount: "",
    cardTheme: "midnight",
    deliveryType: "immediate",
    deliveryAt: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const selectedBusiness = useMemo(() => {
    if (!selectedBusinessId) return null;
    return (
      availableBusinesses.find(
        (business) => String(business?._id) === String(selectedBusinessId),
      ) || null
    );
  }, [availableBusinesses, selectedBusinessId]);

  const filteredBusinesses = useMemo(() => {
    const query = businessSearch.trim().toLowerCase();
    return [...availableBusinesses].filter((business) => {
      if (!query) return true;

      const label = String(
        business?.name || business?.businessName || "",
      ).toLowerCase();
      const slug = String(business?.slug || "").toLowerCase();
      const location = formatBusinessLocation(business).toLowerCase();
      return (
        label.includes(query) ||
        slug.includes(query) ||
        location.includes(query)
      );
    });
  }, [availableBusinesses, businessSearch]);

  const rankedBusinesses = useMemo(() => {
    return filteredBusinesses
      .map((business) => {
        const businessCoords = getBusinessCoordinates(business);
        const distanceKm = calculateDistanceKm(userCoordinates, businessCoords);
        const recentIndex = recentBusinessIds.findIndex(
          (businessId) => businessId === String(business._id),
        );

        return {
          ...business,
          _distanceKm: distanceKm,
          _recentIndex: recentIndex,
        };
      })
      .sort((a, b) => {
        if (a._recentIndex !== -1 || b._recentIndex !== -1) {
          if (a._recentIndex === -1) return 1;
          if (b._recentIndex === -1) return -1;
          return a._recentIndex - b._recentIndex;
        }

        const aHasDistance = Number.isFinite(a._distanceKm);
        const bHasDistance = Number.isFinite(b._distanceKm);

        if (aHasDistance && bHasDistance) {
          if (a._distanceKm !== b._distanceKm) {
            return a._distanceKm - b._distanceKm;
          }
        } else if (aHasDistance) {
          return -1;
        } else if (bHasDistance) {
          return 1;
        }

        return String(a?.name || a?.businessName || "").localeCompare(
          String(b?.name || b?.businessName || ""),
        );
      });
  }, [filteredBusinesses, recentBusinessIds, userCoordinates]);

  const effectiveTenant = hasTenantContext ? tenant : selectedBusiness;
  const isTenantReady = Boolean(effectiveTenant?._id);
  const isGiftCardsEnabled =
    effectiveTenant?.features?.enableGiftCards !== false;

  const selectedAmount = useMemo(() => {
    const rawAmount =
      formData.customAmount !== "" ? formData.customAmount : formData.amount;
    const parsedAmount = Number(rawAmount);
    if (!Number.isFinite(parsedAmount)) return 0;
    return Math.round(parsedAmount * 100) / 100;
  }, [formData.amount, formData.customAmount]);

  const selectedTheme = useMemo(() => {
    return (
      CARD_THEMES.find((theme) => theme.key === formData.cardTheme) ||
      CARD_THEMES[0]
    );
  }, [formData.cardTheme]);

  const tenantSlug = effectiveTenant?.slug || "";
  const stepTransition = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
      }
    : STEP_TRANSITION;

  useEffect(() => {
    let isMounted = true;

    const fetchBusinesses = async () => {
      if (!isOpen || hasTenantContext) return;

      setLoadingBusinesses(true);
      setApiError("");

      try {
        const response = await api.get("/tenants/public", {
          params: { limit: 200, giftCardsOnly: true },
        });

        const allBusinesses = Array.isArray(response?.data?.tenants)
          ? response.data.tenants
          : [];

        const giftCardBusinesses = allBusinesses.filter(
          (business) =>
            business?.features?.enableGiftCards === true &&
            business?.giftCardPayoutReady === true,
        );

        if (!isMounted) return;
        setAvailableBusinesses(giftCardBusinesses);

        if (!selectedBusinessId && giftCardBusinesses.length === 1) {
          setSelectedBusinessId(String(giftCardBusinesses[0]._id));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load businesses:", error);
        setApiError("Failed to load businesses. Please try again.");
      } finally {
        if (isMounted) {
          setLoadingBusinesses(false);
        }
      }
    };

    fetchBusinesses();

    return () => {
      isMounted = false;
    };
  }, [hasTenantContext, isOpen, selectedBusinessId]);

  useEffect(() => {
    if (!isOpen || hasTenantContext || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setUserCoordinates(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  }, [hasTenantContext, isOpen]);

  const handleClose = () => {
    setStep(1);
    setFormData({
      amount: 50,
      customAmount: "",
      cardTheme: "midnight",
      deliveryType: "immediate",
      deliveryAt: "",
      recipientName: "",
      recipientEmail: "",
      message: "",
    });
    setErrors({});
    setApiError("");
    setSelectedBusinessId("");
    setBusinessSearch("");
    onClose();
  };

  const validateStep1 = () => {
    const newErrors = {};
    const amount = selectedAmount;

    if (!amount || amount < 10) {
      newErrors.amount = "Minimum amount is £10";
    }
    if (amount > 500) {
      newErrors.amount = "Maximum amount is £500";
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Recipient name is required";
    }

    if (!formData.recipientEmail.trim()) {
      newErrors.recipientEmail = "Recipient email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = "Invalid email address";
    }

    if (formData.message.length > 500) {
      newErrors.message = "Message must be 500 characters or less";
    }

    if (formData.deliveryType === "scheduled") {
      if (!formData.deliveryAt) {
        newErrors.deliveryAt = "Scheduled delivery date and time is required";
      } else {
        const deliveryDate = new Date(formData.deliveryAt);
        const now = new Date();
        const minDeliveryDate = new Date(now.getTime() + 5 * 60 * 1000);
        if (Number.isNaN(deliveryDate.getTime())) {
          newErrors.deliveryAt = "Please enter a valid delivery date";
        } else if (deliveryDate < minDeliveryDate) {
          newErrors.deliveryAt = "Delivery must be at least 5 minutes from now";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    setApiError("");

    if (!isTenantReady) {
      toast.error("Please choose a business before continuing.");
      return;
    }

    if (!isGiftCardsEnabled) {
      toast.error("Gift cards are currently unavailable for this business");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to purchase a gift card");
      return;
    }

    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePurchase = async () => {
    setApiError("");
    if (!validateStep1()) return;

    if (!isTenantReady) {
      const message = "Please choose a business before continuing.";
      setApiError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      const normalizedDeliveryDate =
        formData.deliveryType === "scheduled" && formData.deliveryAt
          ? new Date(formData.deliveryAt).toISOString()
          : undefined;

      const response = await createGiftCardCheckoutSession({
        tenantId: effectiveTenant._id,
        amount: selectedAmount,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        message: formData.message || undefined,
        deliveryType: formData.deliveryType,
        deliveryAt: normalizedDeliveryDate,
      });

      if (!hasTenantContext && selectedBusinessId) {
        const nextRecentIds = [
          selectedBusinessId,
          ...recentBusinessIds.filter((id) => id !== selectedBusinessId),
        ].slice(0, 8);

        setRecentBusinessIds(nextRecentIds);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            RECENT_GIFT_CARD_BUSINESSES_KEY,
            JSON.stringify(nextRecentIds),
          );
        }
      }

      if (!response?.url) {
        throw new Error("Checkout URL not returned");
      }

      toast.success("Redirecting to secure checkout...");

      if (onSuccess) {
        onSuccess(response);
      }

      window.location.href = response.url;
    } catch (error) {
      console.error("Gift card purchase error:", error);
      const message =
        error.response?.data?.error || "Failed to start gift card checkout";
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
            }
            animate={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
            }
            exit={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
            }
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Send Gift Card
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {step === 1
                    ? "Create the gift details"
                    : "Review before secure checkout"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-4 sm:px-6 pt-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    step >= 1 ? "bg-brand-600" : "bg-gray-200"
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full ${
                    step >= 2 ? "bg-brand-600" : "bg-gray-200"
                  }`}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Details</span>
                <span>Review</span>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {!hasTenantContext && (
                <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900">
                        Choose a Business
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Search by name or city to quickly find the right
                        business.
                      </p>
                    </div>
                    <span className="text-xs rounded-full bg-white border border-gray-200 px-2 py-1 text-gray-600">
                      {rankedBusinesses.length} shown
                    </span>
                  </div>

                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={businessSearch}
                      onChange={(e) => setBusinessSearch(e.target.value)}
                      placeholder="Search businesses..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    />
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {selectedBusiness && (
                    <div className="mb-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-brand-700 uppercase tracking-wider">
                          Selected
                        </div>
                        <div className="font-semibold text-brand-900">
                          {selectedBusiness.name ||
                            selectedBusiness.businessName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBusinessId("")}
                        className="text-xs px-2 py-1 rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-100"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {loadingBusinesses ? (
                      <>
                        <div className="h-16 rounded-xl bg-white border border-gray-200 animate-pulse" />
                        <div className="h-16 rounded-xl bg-white border border-gray-200 animate-pulse" />
                        <div className="h-16 rounded-xl bg-white border border-gray-200 animate-pulse" />
                      </>
                    ) : rankedBusinesses.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600 text-center">
                        {availableBusinesses.length === 0
                          ? "No businesses with gift cards enabled are currently available."
                          : "No businesses match your search. Try another name or city."}
                      </div>
                    ) : (
                      rankedBusinesses.map((business) => {
                        const isSelected =
                          String(selectedBusinessId) === String(business._id);
                        const businessName =
                          business.name || business.businessName || "Business";
                        const location = formatBusinessLocation(business);
                        const isRecent = business._recentIndex !== -1;
                        const distanceLabel = formatDistance(
                          business._distanceKm,
                        );

                        return (
                          <button
                            key={business._id}
                            type="button"
                            onClick={() => {
                              setSelectedBusinessId(String(business._id));
                              setErrors((prev) => ({
                                ...prev,
                                business: undefined,
                              }));
                            }}
                            className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${
                              isSelected
                                ? "border-brand-500 bg-brand-50"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {businessName}
                                </div>
                                {location && (
                                  <div className="text-xs text-gray-600 mt-0.5 truncate">
                                    {location}
                                  </div>
                                )}
                                <div className="mt-1 flex items-center gap-2 flex-wrap">
                                  {isRecent && (
                                    <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-purple-100 text-purple-700">
                                      Recent
                                    </span>
                                  )}
                                  {distanceLabel && (
                                    <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-sky-100 text-sky-700">
                                      {distanceLabel}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-600 text-white shrink-0">
                                  Selected
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {!isTenantReady ? (
                <div className="text-center space-y-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a business to continue
                    </h3>
                    <p className="text-gray-600">
                      Select a business above to continue with gift card
                      purchase.
                    </p>
                  </div>
                  <Button
                    onClick={handleClose}
                    className="w-full"
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              ) : !isGiftCardsEnabled ? (
                <div className="text-center space-y-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Gift cards are unavailable
                    </h3>
                    <p className="text-gray-600">
                      This business has not enabled gift card sales yet.
                    </p>
                  </div>
                  <Button onClick={handleClose} className="w-full">
                    Close
                  </Button>
                </div>
              ) : !isAuthenticated ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sign in to purchase gift cards
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You need a client account to buy and track gift card
                      purchases.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link
                        to={
                          tenantSlug ? `/salon/${tenantSlug}/login` : "/login"
                        }
                      >
                        <Button className="w-full">Sign In</Button>
                      </Link>
                      <Link
                        to={
                          tenantSlug
                            ? `/salon/${tenantSlug}/register`
                            : "/register"
                        }
                      >
                        <Button className="w-full" variant="outline">
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <Button
                    onClick={handleClose}
                    className="w-full"
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                  <motion.div
                    whileHover={
                      shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }
                    }
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.01 }
                        : { type: "spring", stiffness: 260, damping: 20 }
                    }
                    className={`${selectedTheme.cardClass} rounded-2xl text-white p-6 shadow-lg relative overflow-hidden`}
                  >
                    <motion.div
                      aria-hidden
                      className="absolute -top-20 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                      animate={
                        shouldReduceMotion
                          ? { opacity: 0.6 }
                          : { x: [0, -12, 0], y: [0, 10, 0] }
                      }
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.2 }
                          : { duration: 7, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-white/70">
                          {effectiveTenant?.name || "Business"}
                        </div>
                        <div className="mt-1 text-2xl font-bold tracking-wide">
                          Gift Card
                        </div>
                      </div>
                      <div
                        className={`h-10 w-14 rounded-md ${selectedTheme.chipClass}`}
                      />
                    </div>

                    <div className="mt-8 text-4xl font-bold">
                      £{selectedAmount.toFixed(2)}
                    </div>

                    <div className="mt-5 text-sm tracking-[0.28em] text-white/80 uppercase">
                      Gift •••• •••• ••••
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-white/90">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Recipient
                        </div>
                        <div className="mt-1 font-semibold truncate">
                          {formData.recipientName || "Recipient Name"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Purchased by
                        </div>
                        <div className="mt-1 font-semibold truncate">
                          {client?.name || client?.email || "Client"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                      <span>Valid for 12 months</span>
                      <span>
                        {formData.deliveryType === "scheduled" &&
                        formData.deliveryAt
                          ? `Scheduled ${new Date(
                              formData.deliveryAt,
                            ).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "Secure digital delivery"}
                      </span>
                    </div>

                    <div className="mt-5 rounded-lg bg-white/10 p-3 text-sm text-white/90 min-h-[72px]">
                      {formData.message?.trim()
                        ? `“${formData.message.trim()}”`
                        : "Add a personal message to make this gift more meaningful."}
                    </div>
                  </motion.div>

                  <AnimatePresence mode="wait" initial={false}>
                    {step === 1 && (
                      <motion.div
                        key="gift-step-1"
                        {...stepTransition}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Card Theme
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            {CARD_THEMES.map((theme) => (
                              <button
                                key={theme.key}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    cardTheme: theme.key,
                                  }))
                                }
                                className={`rounded-xl border p-2 text-left transition-all ${
                                  formData.cardTheme === theme.key
                                    ? "border-brand-500 ring-2 ring-brand-200"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`${theme.cardClass} rounded-lg px-3 py-3 text-white shadow-sm`}
                                >
                                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                                    Gift Card
                                  </div>
                                  <div className="mt-1 text-sm font-semibold">
                                    {theme.label}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>

                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Amount
                          </label>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {PRESET_AMOUNTS.map((amount) => (
                              <motion.button
                                key={amount}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    amount,
                                    customAmount: "",
                                  });
                                  setErrors({ ...errors, amount: undefined });
                                }}
                                className={`py-3 px-4 rounded-xl font-semibold border transition-all ${
                                  formData.amount === amount &&
                                  !formData.customAmount
                                    ? "bg-brand-600 text-white border-brand-600 shadow-lg"
                                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                                }`}
                                whileTap={{ scale: 0.97 }}
                              >
                                £{amount}
                              </motion.button>
                            ))}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-2">
                              Custom Amount (£10-£500)
                            </label>
                            <input
                              type="number"
                              min="10"
                              max="500"
                              step="0.01"
                              placeholder="Enter custom amount"
                              value={formData.customAmount}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  customAmount: e.target.value,
                                });
                                setErrors({ ...errors, amount: undefined });
                              }}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            />
                          </div>
                          {errors.amount && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.amount}
                            </p>
                          )}
                        </div>

                        {/* Recipient Details */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Recipient Name *
                          </label>
                          <input
                            type="text"
                            value={formData.recipientName}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                recipientName: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                recipientName: undefined,
                              });
                            }}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                              errors.recipientName
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Who is this gift for?"
                          />
                          {errors.recipientName && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.recipientName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Recipient Email *
                          </label>
                          <input
                            type="email"
                            value={formData.recipientEmail}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                recipientEmail: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                recipientEmail: undefined,
                              });
                            }}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                              errors.recipientEmail
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="recipient@example.com"
                          />
                          {errors.recipientEmail && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.recipientEmail}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Personal Message (Optional)
                          </label>
                          <textarea
                            value={formData.message}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                message: e.target.value,
                              })
                            }
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                            placeholder="Add a personal message to the recipient..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.message.length}/500 characters
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Delivery Time
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  deliveryType: "immediate",
                                  deliveryAt: "",
                                }))
                              }
                              className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                                formData.deliveryType === "immediate"
                                  ? "border-brand-500 bg-brand-50 text-brand-700"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              Send Now
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  deliveryType: "scheduled",
                                  deliveryAt:
                                    prev.deliveryAt ||
                                    toDateTimeLocalValue(
                                      new Date(Date.now() + 60 * 60 * 1000),
                                    ),
                                }))
                              }
                              className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                                formData.deliveryType === "scheduled"
                                  ? "border-brand-500 bg-brand-50 text-brand-700"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              Schedule
                            </button>
                          </div>

                          {formData.deliveryType === "scheduled" && (
                            <div className="mt-3">
                              <input
                                type="datetime-local"
                                value={formData.deliveryAt}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    deliveryAt: e.target.value,
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    deliveryAt: undefined,
                                  }));
                                }}
                                min={toDateTimeLocalValue(
                                  new Date(Date.now() + 5 * 60 * 1000),
                                )}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                                  errors.deliveryAt
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.deliveryAt && (
                                <p className="text-red-600 text-sm mt-1">
                                  {errors.deliveryAt}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Recipient email will be delivered at the
                                selected date and time.
                              </p>
                            </div>
                          )}
                        </div>

                        {apiError && (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {apiError}
                          </div>
                        )}

                        <Button
                          onClick={handleNextStep}
                          className="w-full"
                          size="lg"
                        >
                          Review Gift Card
                        </Button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="gift-step-2"
                        {...stepTransition}
                        className="space-y-6"
                      >
                        <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                          <h3 className="font-semibold text-lg text-gray-900">
                            Review & Confirm
                          </h3>
                          <p className="text-sm text-gray-600">
                            You&apos;ll be redirected to secure Stripe checkout
                            to complete payment.
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Gift Card Amount
                              </span>
                              <span className="font-semibold">
                                £{selectedAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Recipient</span>
                              <span className="font-semibold">
                                {formData.recipientName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Recipient Email
                              </span>
                              <span className="font-semibold text-sm">
                                {formData.recipientEmail}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery</span>
                              <span className="font-semibold text-sm text-right">
                                {formData.deliveryType === "scheduled" &&
                                formData.deliveryAt
                                  ? new Date(
                                      formData.deliveryAt,
                                    ).toLocaleString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Send immediately"}
                              </span>
                            </div>
                            {formData.message && (
                              <div className="rounded-lg bg-white border border-gray-200 p-3 text-sm text-gray-700">
                                <span className="font-medium">Message:</span>{" "}
                                {formData.message}
                              </div>
                            )}
                            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-lg">
                              <span className="font-bold">Total</span>
                              <span className="font-bold text-brand-600">
                                £{selectedAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-lg bg-white border border-gray-200 p-3 text-xs text-gray-600">
                            <div className="font-medium text-gray-800 mb-1">
                              Secure Checkout
                            </div>
                            <div>
                              Payment is processed securely by Stripe and sent
                              to the selected business.
                            </div>
                          </div>
                        </div>

                        {apiError && (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {apiError}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handlePurchase}
                            disabled={loading}
                            className="flex-1"
                          >
                            {loading
                              ? "Redirecting..."
                              : "Continue to Secure Checkout"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
