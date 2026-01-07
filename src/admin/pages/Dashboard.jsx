import { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { api } from "../../shared/lib/apiClient";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";
import CreateServiceModal from "../components/CreateServiceModal";
import CreateStaffModal from "../components/CreateStaffModal";
import Modal from "../../shared/components/ui/Modal";
import FormField from "../../shared/components/forms/FormField";
import Button from "../../shared/components/ui/Button";
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";
import DateTimePicker from "../../shared/components/DateTimePicker";

const localizer = dayjsLocalizer(dayjs);

const isCancellationError = (error) => {
  if (!error) return false;
  if (error.name === "AbortError") return true;
  if (error.code === "ERR_CANCELED") return true;
  if (error.originalError) return isCancellationError(error.originalError);
  return false;
};

export default function Dashboard() {
  const { language } = useLanguage();
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";
  const [allAppointments, setAllAppointments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState("all");
  const [showSpecialistDrawer, setShowSpecialistDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [salonSlug, setSalonSlug] = useState(null);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Support modal state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportOption, setSupportOption] = useState(null); // 'whatsapp' or 'form'
  const [supportForm, setSupportForm] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    message: "",
  });

  // Appointment details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Create appointment modal state
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] =
    useState(false);
  const [showCreateSpecialistDrawer, setShowCreateSpecialistDrawer] =
    useState(false);
  const [showCreateServiceDrawer, setShowCreateServiceDrawer] = useState(false);
  const [showCreateTimePicker, setShowCreateTimePicker] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    specialistId: "",
    serviceId: "",
    startDateTime: "",
    endDateTime: "",
    notes: "",
  });

  // Handle slot selection from DateTimePicker for create appointment
  const handleCreateSlotSelect = (slot) => {
    setCreateFormData({
      ...createFormData,
      startDateTime: slot.startISO,
      endDateTime: slot.endISO,
    });
    setShowCreateTimePicker(false);
  };

  // Handle create appointment submission
  const handleCreateAppointment = async () => {
    // Validation
    if (!createFormData.clientName || !createFormData.clientPhone) {
      toast.error("Client name and phone are required");
      return;
    }
    if (!createFormData.specialistId || !createFormData.serviceId) {
      toast.error("Specialist and service are required");
      return;
    }
    if (!createFormData.startDateTime) {
      toast.error("Please select a date and time");
      return;
    }

    setCreatingAppointment(true);

    try {
      const selectedService = services.find(
        (s) => s._id === createFormData.serviceId
      );
      const variantName = selectedService?.variants?.[0]?.name || "Standard";

      const response = await api.post("/appointments", {
        client: {
          name: createFormData.clientName,
          email: createFormData.clientEmail,
          phone: createFormData.clientPhone,
          notes: createFormData.notes,
        },
        specialistId: createFormData.specialistId,
        serviceId: createFormData.serviceId,
        variantName: variantName,
        startISO: createFormData.startDateTime,
        mode: "pay_in_salon",
        paymentStatus: "paid",
      });

      if (response.data.ok) {
        // Refresh data to show new appointment
        const controller = new AbortController();
        await fetchData(controller.signal);

        setShowCreateAppointmentModal(false);
        // Reset form
        setCreateFormData({
          clientName: "",
          clientPhone: "",
          clientEmail: "",
          specialistId: "",
          serviceId: "",
          startDateTime: "",
          endDateTime: "",
          notes: "",
        });
        toast.success("Appointment created successfully");
      }
    } catch (e) {
      setShowCreateAppointmentModal(false);
      setTimeout(() => {
        toast.error(
          e.response?.data?.error ||
            e.message ||
            "Failed to create appointment",
          { duration: 5000 }
        );
      }, 100);
    } finally {
      setCreatingAppointment(false);
    }
  };

  const fetchData = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        // Fetch appointments, specialists, and salon info with granular error tracking
        const [appointmentsResult, specialistsResult, salonResult] =
          await Promise.allSettled([
            api.get("/appointments", { signal }),
            api.get("/specialists", { params: { limit: 1000 }, signal }),
            api.get("/salon", { signal }),
          ]);

        const resultList = [appointmentsResult, specialistsResult, salonResult];

        const wasCancelled = resultList.some(
          (result) =>
            result.status === "rejected" && isCancellationError(result.reason)
        );

        if (wasCancelled) {
          return;
        }

        const requestErrors = [];

        let appointments = [];
        let specialistsData = [];
        let salonData = {};

        if (appointmentsResult.status === "fulfilled") {
          appointments = appointmentsResult.value.data || [];
        } else {
          requestErrors.push({
            endpoint: "/appointments",
            error: appointmentsResult.reason,
          });
        }

        if (specialistsResult.status === "fulfilled") {
          specialistsData = specialistsResult.value.data || [];
        } else {
          requestErrors.push({
            endpoint: "/specialists",
            error: specialistsResult.reason,
          });
        }

        if (salonResult.status === "fulfilled") {
          salonData = salonResult.value.data || {};
        } else {
          requestErrors.push({
            endpoint: "/salon",
            error: salonResult.reason,
          });
        }

        if (requestErrors.length > 0) {
          requestErrors.forEach(({ endpoint, error }) => {
            console.error(`[Dashboard] ${endpoint} request failed`, error);
          });
          throw (
            requestErrors[0].error || new Error("Dashboard data request failed")
          );
        }

        // Store salon slug for booking page link
        // Priority: use slug first, then generate from name, never use ID
        const slug =
          salonData.slug ||
          (salonData.name
            ? salonData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            : null);

        if (slug) {
          setSalonSlug(slug);
        } else {
          console.warn(
            "[Dashboard] No salon slug found in response",
            salonData
          );
        }

        // Filter appointments based on admin role and linked specialist
        if (isSuperAdmin) {
          // Super admin sees all appointments
        } else if (admin?.specialistId) {
          // Regular admin with linked specialist - only show their specialist's appointments
          const originalCount = appointments.length;
          appointments = appointments.filter(
            (apt) => apt.specialistId?._id === admin.specialistId
          );
          // Auto-select the specialist's filter
          setSelectedSpecialist(admin.specialistId);
        } else {
          // Regular admin without linked specialist - show no appointments
          appointments = [];
        }

        setAllAppointments(appointments);
        setSpecialists(specialistsData);
      } catch (error) {
        // Ignore abort/cancel errors (user navigated away or request cancelled)
        if (isCancellationError(error)) {
          return;
        }

        // Ignore 403 errors on initial load (admin not yet loaded)
        if (error.response?.status === 403) {
          console.log(
            "[Dashboard] 403 error (likely no auth token yet), will retry when admin loads"
          );
          return;
        }

        console.error("Failed to fetch data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    },
    [admin?.specialistId, isSuperAdmin]
  ); // Only recreate if these change

  useEffect(() => {
    // Don't fetch data until admin is loaded from localStorage
    if (!admin) {
      console.log("[Dashboard] Waiting for admin to load...");
      return;
    }

    const abortController = new AbortController();

    fetchData(abortController.signal);

    // Cleanup: Cancel request if component unmounts or dependencies change
    return () => {
      abortController.abort();
    };
  }, [fetchData, admin]); // Re-fetch when fetchData changes (which depends on admin and isSuperAdmin)

  useEffect(() => {
    // Handle window resize for responsive calendar
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize filtered events to prevent unnecessary recalculations
  const events = useMemo(() => {
    if (!allAppointments || allAppointments.length === 0) {
      return [];
    }

    let filtered = allAppointments;

    // Filter by specialist if selected
    if (selectedSpecialist !== "all") {
      filtered = filtered.filter(
        (apt) => apt.specialistId?._id === selectedSpecialist
      );
    }

    // Format for calendar
    return filtered
      .map((appointment) => {
        if (!appointment || !appointment.start || !appointment.end) {
          return null;
        }

        const startDate = new Date(appointment.start);
        const endDate = new Date(appointment.end);

        let backgroundColor = "#3b82f6";
        // Treat both "confirmed" and "completed" as completed (green) since confirmed appointments count as revenue
        if (
          appointment.status === "completed" ||
          appointment.status === "confirmed"
        )
          backgroundColor = "#10b981";
        else if (appointment.status === "reserved_unpaid")
          backgroundColor = "#f59e0b";
        else if (appointment.status?.includes("cancelled"))
          backgroundColor = "#ef4444";
        else if (appointment.status === "no_show") backgroundColor = "#6b7280";

        return {
          id: appointment._id,
          title: `${appointment.client?.name || "Unknown"} - ${
            appointment.serviceId?.name || appointment.variantName || "Service"
          }`,
          start: startDate,
          end: endDate,
          resource: appointment,
          style: { backgroundColor },
        };
      })
      .filter(Boolean); // Remove any null entries
  }, [selectedSpecialist, allAppointments]);

  const emptyStats = useMemo(
    () => ({
      totalRevenue: 0,
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
      revenueTrend: 0,
      totalAppointments: 0,
      appointmentsTrend: 0,
      todayAppointments: 0,
      uniqueCustomers: 0,
    }),
    []
  );

  const stats = metrics ?? emptyStats;

  const stripeSpecialist = useMemo(() => {
    if (!specialists?.length) return null;

    if (isSuperAdmin) {
      if (selectedSpecialist === "all") return null;
      return specialists.find((s) => s._id === selectedSpecialist) || null;
    }

    if (admin?.specialistId) {
      return specialists.find((s) => s._id === admin.specialistId) || null;
    }

    return null;
  }, [specialists, isSuperAdmin, selectedSpecialist, admin?.specialistId]);

  const showStripeAlert = Boolean(
    stripeSpecialist &&
      (stripeSpecialist.stripeStatus !== "connected" ||
        !stripeSpecialist.stripeAccountId)
  );

  useEffect(() => {
    if (!admin) {
      return;
    }

    const controller = new AbortController();
    const specialistFilter = isSuperAdmin
      ? selectedSpecialist
      : admin?.specialistId || "all";

    const params =
      specialistFilter && specialistFilter !== "all"
        ? { specialistId: specialistFilter }
        : undefined;

    const loadMetrics = async () => {
      try {
        setMetricsLoading(true);
        const response = await api.get("/appointments/metrics", {
          params,
          signal: controller.signal,
        });
        setMetrics(response.data || emptyStats);
      } catch (error) {
        if (isCancellationError(error)) {
          return;
        }
        console.error("Failed to fetch dashboard metrics:", error);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetrics();

    // Load services for edit modal
    api
      .get("/services", { params: { limit: 1000 } })
      .then((r) => setServices(r.data || []))
      .catch(() => {});

    return () => controller.abort();
  }, [
    admin?._id,
    admin?.specialistId,
    admin?.role,
    emptyStats,
    isSuperAdmin,
    selectedSpecialist,
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const openEditModal = (appointment) => {
    setEditingAppointment({
      _id: appointment._id,
      clientName: appointment.client?.name || "",
      clientEmail: appointment.client?.email || "",
      clientPhone: appointment.client?.phone || "",
      clientNotes: appointment.client?.notes || "",
      specialistId:
        appointment.specialistId?._id || appointment.specialistId || "",
      serviceId: appointment.serviceId?._id || appointment.serviceId || "",
      variantName: appointment.variantName || "",
      start: appointment.start
        ? new Date(appointment.start).toISOString().slice(0, 16)
        : "",
      end: appointment.end
        ? new Date(appointment.end).toISOString().slice(0, 16)
        : "",
      price: appointment.price || 0,
      services: appointment.services || null,
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingAppointment) return;
    setSubmitting(true);

    try {
      const res = await api
        .patch(`/appointments/${editingAppointment._id}`, {
          client: {
            name: editingAppointment.clientName,
            email: editingAppointment.clientEmail,
            phone: editingAppointment.clientPhone,
            notes: editingAppointment.clientNotes,
          },
          specialistId: editingAppointment.specialistId,
          serviceId: editingAppointment.serviceId,
          variantName: editingAppointment.variantName,
          start: editingAppointment.start,
          end: editingAppointment.end,
          price: Number(editingAppointment.price),
        })
        .then((r) => r.data);

      if (res.success && res.appointment) {
        // Update the appointments list
        setAllAppointments((old) =>
          old.map((x) =>
            x._id === editingAppointment._id ? res.appointment : x
          )
        );
      }

      setEditModalOpen(false);
      setEditingAppointment(null);
      toast.success("Appointment updated successfully");

      // Refresh data
      const controller = new AbortController();
      fetchData(controller.signal);
    } catch (e) {
      toast.error(
        e.response?.data?.error || e.message || "Failed to update appointment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    if (!supportForm.name || !supportForm.email || !supportForm.message) {
      toast.error("All fields are required");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/support/contact", {
        name: supportForm.name,
        email: supportForm.email,
        message: supportForm.message,
      });

      toast.success("Support message sent successfully!");
      setShowSupportModal(false);
      setSupportOption(null);
      setSupportForm({
        name: admin?.name || "",
        email: admin?.email || "",
        message: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6 md:pb-0">
      {/* Quick Stats Bar - Premium Info Strip */}
      {(isSuperAdmin || admin?.specialistId) && (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-3 shadow-lg overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white/70 text-xs font-medium">
                Live Dashboard
              </span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-brand-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-white text-sm font-semibold">
                {formatCurrency(stats.thisMonthRevenue)}
              </span>
              <span className="text-white/50 text-xs">this month</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-white text-sm font-semibold">
                {stats.todayAppointments}
              </span>
              <span className="text-white/50 text-xs">today</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-white text-sm font-semibold">
                {stats.uniqueCustomers}
              </span>
              <span className="text-white/50 text-xs">clients</span>
            </div>
          </div>
        </div>
      )}
      {/* Salon Booking Page Link - Prominent CTA */}
      {(isSuperAdmin || admin?.role === "salon-admin") && (
        <div className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 rounded-2xl p-6 shadow-xl border border-brand-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-lg mb-1">
                  Your Booking Page is Live!
                </div>
                <div className="text-white/90 text-sm">
                  Share this link with your customers to start receiving
                  bookings
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {salonSlug ? (
                <>
                  <a
                    href={`${window.location.origin}/salon/${salonSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View Booking Page
                  </a>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/salon/${salonSlug}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Link copied to clipboard!");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Link
                  </button>
                </>
              ) : (
                <div className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-sm rounded-xl">
                  Loading booking page link...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header - Specialist Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Specialist Filter - Only show for super admins */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border-2 border-gray-200 shadow-sm hover:border-brand-300 transition-all">
            <svg
              className="w-5 h-5 text-brand-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <label
              htmlFor="specialist-filter"
              className="text-sm font-semibold text-gray-700 whitespace-nowrap"
            >
              Filter:
            </label>
            <SelectButton
              onClick={() => setShowSpecialistDrawer(true)}
              placeholder={t("filterByBeautician", language)}
              value={selectedSpecialist === "all" ? "all" : selectedSpecialist}
              options={[
                { value: "all", label: t("allBeauticians", language) },
                ...specialists.map((s) => ({ value: s._id, label: s.name })),
              ]}
            />
          </div>
        )}

        {/* Show info for salon-admin without linked specialist */}
        {!isSuperAdmin &&
          !admin?.specialistId &&
          admin?.role === "salon-admin" && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-200 rounded-lg">
                  <svg
                    className="w-4 h-4 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    Welcome to your dashboard!
                  </p>
                  <p className="text-[11px] text-blue-700">
                    Start by adding staff and services
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {showStripeAlert && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {stripeSpecialist?.name || "Selected specialist"} is not
                connected to Stripe.
              </p>
              <p className="text-xs text-amber-800 mt-1">
                To receive booking payments you need to complete Stripe Connect
                onboarding for this specialist.
              </p>
            </div>
          </div>
          <Link
            to="/admin/stripe-connect"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-5 py-2 text-sm font-semibold text-amber-900 shadow-sm hover:border-amber-400"
          >
            Go to Stripe Connect
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Stats Cards - Ultra Compact Design */}
      {(isSuperAdmin || admin?.specialistId) && (
        <>
          {/* Revenue Card - Hero Card with Chart */}
          <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-600 rounded-2xl p-5 shadow-2xl overflow-hidden group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 animate-pulse"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-5 h-5 text-white/90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                      Revenue
                    </span>
                  </div>
                  <div className="text-4xl font-black text-white mb-1 tracking-tight">
                    {formatCurrency(stats.thisMonthRevenue)}
                  </div>
                  <div className="text-white/70 text-xs">
                    Total: {formatCurrency(stats.totalRevenue)}
                  </div>
                </div>
                {stats.revenueTrend !== 0 && (
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg backdrop-blur-sm ${
                      stats.revenueTrend > 0
                        ? "bg-green-400/20 text-white"
                        : "bg-red-400/20 text-white"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        stats.revenueTrend > 0 ? "" : "rotate-180"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    <span className="text-sm font-black">
                      {Math.abs(stats.revenueTrend).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Mini Revenue Chart */}
              <div className="h-16 flex items-end gap-1 mt-4">
                {[65, 72, 68, 80, 75, 85, 90, 88, 95, 92, 100, 98].map(
                  (height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white/20 hover:bg-white/40 rounded-t transition-all duration-300 group-hover:bg-white/30"
                      style={{ height: `${height}%` }}
                    ></div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Three Compact Cards Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Today's Appointments */}
            <div className="relative bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  {stats.appointmentsTrend !== 0 && (
                    <div
                      className={`ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                        stats.appointmentsTrend > 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <svg
                        className={`w-3 h-3 ${
                          stats.appointmentsTrend > 0 ? "" : "rotate-180"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      <span className="text-[10px] font-bold">
                        {Math.abs(stats.appointmentsTrend).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">
                  {stats.todayAppointments}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Today's Bookings
                </div>
              </div>
            </div>

            {/* Total Appointments */}
            <div className="relative bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg mb-3 w-fit">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">
                  {stats.totalAppointments}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  All Time
                </div>
              </div>
            </div>

            {/* Total Clients */}
            <div className="relative bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg mb-3 w-fit">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">
                  {stats.uniqueCustomers}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Total Clients
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                console.log("New Booking clicked");
                setShowCreateAppointmentModal(true);
              }}
              className="group bg-gradient-to-br from-brand-50 to-white hover:from-brand-100 hover:to-brand-50 border border-brand-200 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-brand-500 rounded-lg group-hover:bg-brand-600 transition-colors">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-brand-700">
                  New Booking
                </span>
              </div>
            </button>
            <Link
              to="/admin/clients"
              className="group bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 border border-blue-200 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-blue-700">
                  Add Client
                </span>
              </div>
            </Link>
            <Link
              to="/admin/services"
              className="group bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-purple-50 border border-purple-200 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-purple-700">
                  Services
                </span>
              </div>
            </Link>
            <Link
              to="/admin/staff"
              className="group bg-gradient-to-br from-green-50 to-white hover:from-green-100 hover:to-green-50 border border-green-200 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-green-700">
                  Staff
                </span>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* Today's Appointments Widget */}
      {(() => {
        // Don't show today's appointments if regular admin has no linked specialist
        if (!isSuperAdmin && !admin?.specialistId) {
          return null;
        }

        const today = dayjs().startOf("day");
        const todaysAppointments = allAppointments
          .filter((apt) => {
            const aptDate = dayjs(apt.start).startOf("day");
            return (
              aptDate.isSame(today) &&
              (selectedSpecialist === "all" ||
                apt.specialistId?._id === selectedSpecialist)
            );
          })
          .sort((a, b) => new Date(a.start) - new Date(b.start));

        if (todaysAppointments.length === 0) return null;

        return (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    {t("todaysAppointments", language)}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {todaysAppointments.length}{" "}
                    {todaysAppointments.length === 1
                      ? "appointment"
                      : "appointments"}{" "}
                    • {dayjs().format("MMM D, YYYY")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {todaysAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="group bg-white rounded-xl p-4 border border-gray-200 hover:border-brand-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setShowDetailsModal(true);
                  }}
                >
                  {/* Top Row: Time and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg px-3 py-1.5 shadow-md">
                      <span className="text-white text-sm font-black">
                        {dayjs(apt.start).format("h:mm A")}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        apt.status === "confirmed" || apt.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : apt.status === "reserved_unpaid"
                          ? "bg-orange-100 text-orange-700"
                          : apt.status?.includes("cancelled")
                          ? "bg-red-100 text-red-700"
                          : apt.status === "no_show"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {formatStatus(apt.status)}
                    </span>
                  </div>

                  {/* Client and Service */}
                  <div className="mb-3">
                    <div className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
                      {apt.client?.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {apt.serviceId?.name || apt.variantName}
                    </div>
                  </div>

                  {/* Bottom Row: Specialist and Duration */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-1.5 text-brand-600">
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold line-clamp-1">
                        {apt.specialistId?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        {dayjs(apt.end).diff(dayjs(apt.start), "minute")} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Legend - Sleek Design */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-gradient-to-r from-gray-50 to-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
        <span className="font-black text-gray-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Status
        </span>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div>
          <span className="text-gray-700 font-bold">Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm"></div>
          <span className="text-gray-700 font-bold">Unpaid</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
          <span className="text-gray-700 font-bold">Cancelled</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-gray-500 shadow-sm"></div>
          <span className="text-gray-700 font-bold">No Show</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Calendar Header with Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-100 rounded-lg">
                <svg
                  className="w-4 h-4 text-brand-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Appointments Calendar
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-semibold">{events.length}</span>
              <span>appointments</span>
            </div>
          </div>
        </div>

        {/* Mobile view toggle */}
        {isMobile && (
          <div className="px-3 py-2.5 bg-white border-b border-gray-200 flex gap-1.5">
            <button
              onClick={() => setCurrentView("month")}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                currentView === "month"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCurrentView("week")}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                currentView === "week"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView("day")}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                currentView === "day"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCurrentView("agenda")}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                currentView === "agenda"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              List
            </button>
          </div>
        )}
        <div className="p-3 sm:p-4 overflow-x-hidden">
          <style>{`
            /* Mobile Calendar Optimizations */
            @media (max-width: 768px) {
              .rbc-calendar {
                font-size: 11px;
                width: 100%;
              }
              
              /* Toolbar */
              .rbc-toolbar {
                flex-direction: column !important;
                gap: 0.5rem;
                padding: 0.75rem;
              }
              
              .rbc-toolbar-label {
                font-size: 15px !important;
                font-weight: 600;
                order: -1;
                width: 100%;
                text-align: center;
                padding: 0.5rem 0;
              }
              
              .rbc-btn-group {
                display: flex;
                gap: 0.25rem;
                width: 100%;
                justify-content: center;
              }
              
              .rbc-btn-group button {
                padding: 0.5rem 1rem !important;
                font-size: 12px !important;
                border-radius: 0.5rem !important;
                flex: 1;
              }
              
              /* Hide default view buttons on mobile - we have custom toggle */
              .rbc-toolbar .rbc-btn-group:last-child {
                display: none !important;
              }
              
              /* Headers - smaller for mobile */
              .rbc-header {
                padding: 0.5rem 0.25rem !important;
                font-size: 11px !important;
                font-weight: 600;
                text-align: center !important;
              }
              
              /* MONTH VIEW */
              .rbc-month-view {
                border: none !important;
              }
              
              .rbc-month-header {
                border-bottom: 1px solid #e5e7eb;
              }
              
              .rbc-month-row {
                min-height: 50px !important;
                border-bottom: 1px solid #e5e7eb;
              }
              
              .rbc-date-cell {
                padding: 0.25rem !important;
                font-size: 10px !important;
                text-align: center;
              }
              
              .rbc-event {
                padding: 0.125rem 0.25rem !important;
                font-size: 9px !important;
                border-radius: 0.25rem !important;
                margin: 1px 0 !important;
              }
              
              .rbc-event-content {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              /* WEEK VIEW */
              .rbc-time-view {
                border: none !important;
              }
              
              .rbc-time-header {
                border-bottom: 1px solid #e5e7eb;
                display: flex !important;
              }
              
              .rbc-time-header-content {
                border-left: none !important;
                display: flex !important;
                flex: 1 !important;
                min-width: 0 !important;
              }
              
              .rbc-time-header-gutter {
                width: 35px !important;
                min-width: 35px !important;
                flex-shrink: 0 !important;
              }
              
              .rbc-allday-cell {
                display: none !important;
              }
              
              .rbc-time-content {
                border-top: none !important;
                display: flex !important;
              }
              
              .rbc-time-gutter {
                width: 35px !important;
                min-width: 35px !important;
                flex-shrink: 0 !important;
              }
              
              .rbc-time-column {
                width: 35px !important;
                min-width: 35px !important;
                max-width: 35px !important;
                flex-shrink: 0 !important;
              }
              
              .rbc-time-column .rbc-timeslot-group {
                min-height: 35px !important;
              }
              
              .rbc-day-slot {
                flex: 1 !important;
                min-width: 0 !important;
                max-width: none !important;
              }
              
              .rbc-day-slot .rbc-time-slot {
                font-size: 8px !important;
              }
              
              .rbc-time-slot {
                min-height: 17.5px !important;
              }
              
              /* Time labels - make them fit in narrow column */
              .rbc-time-slot span {
                font-size: 7px !important;
                padding: 0 !important;
                line-height: 1.2 !important;
              }
              
              .rbc-label {
                font-size: 7px !important;
                padding: 2px 1px !important;
                white-space: nowrap !important;
                overflow: hidden !important;
              }
              
              .rbc-time-column .rbc-label {
                font-size: 7px !important;
              }
              
              .rbc-events-container {
                margin-right: 0 !important;
              }
              
              /* DAY VIEW */
              .rbc-day-slot .rbc-event {
                font-size: 10px !important;
              }
              
              /* AGENDA VIEW */
              .rbc-agenda-view {
                font-size: 12px;
                padding: 0.5rem;
              }
              
              .rbc-agenda-table {
                border: none !important;
              }
              
              .rbc-agenda-date-cell,
              .rbc-agenda-time-cell {
                padding: 0.5rem !important;
                font-size: 11px !important;
              }
              
              .rbc-agenda-event-cell {
                padding: 0.5rem !important;
                font-size: 11px !important;
              }
            }
            
            /* General Calendar Styling */
            .rbc-calendar {
              font-family: inherit;
            }
            
            .rbc-toolbar {
              padding: 1rem 0;
              margin-bottom: 1rem;
            }
            
            .rbc-toolbar button {
              color: #374151;
              border: 1px solid #d1d5db;
              background: white;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              font-weight: 500;
              transition: all 0.2s;
            }
            
            .rbc-toolbar button:hover {
              background: #f3f4f6;
              border-color: #9ca3af;
            }
            
            .rbc-toolbar button:active,
            .rbc-toolbar button.rbc-active {
              background: #ec4899;
              border-color: #ec4899;
              color: white;
            }
            
            .rbc-toolbar-label {
              font-size: 1.125rem;
              font-weight: 600;
              color: #111827;
            }
            
            .rbc-header {
              padding: 0.75rem;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
              background: #f9fafb;
            }
            
            .rbc-today {
              background-color: #fef3c7;
            }
            
            .rbc-off-range-bg {
              background: #f9fafb;
            }
            
            .rbc-event {
              border-radius: 0.375rem;
              padding: 0.25rem 0.5rem;
              border: none !important;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            
            .rbc-event:hover {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .rbc-event-label {
              display: none;
            }
            
            .rbc-show-more {
              background: #ec4899;
              color: white;
              padding: 0.125rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              font-weight: 600;
            }
            
            .rbc-agenda-view table.rbc-agenda-table {
              border: 1px solid #e5e7eb;
              border-radius: 0.5rem;
            }
            
            .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
              padding: 0.75rem;
              border-color: #e5e7eb;
            }
            
            .rbc-agenda-date-cell {
              font-weight: 600;
              color: #374151;
            }
            
            .rbc-agenda-time-cell {
              color: #6b7280;
            }
          `}</style>

          {events && events.length >= 0 ? (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              view={currentView}
              onNavigate={(date) => setCurrentDate(date)}
              onView={(view) => setCurrentView(view)}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              style={{ height: isMobile ? 400 : 700 }}
              onSelectEvent={(event) => setSelectedEvent(event)}
              eventPropGetter={(event) => ({
                style: event.style || {},
                className: "rbc-event-custom",
              })}
              min={new Date(2025, 0, 1, 8, 0)}
              max={new Date(2025, 0, 1, 20, 0)}
              popup={true}
              step={30}
              timeslots={2}
              showMultiDayTimes={true}
              toolbar={true}
            />
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Loading calendar...
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        open={!!selectedEvent}
        onClose={handleCloseModal}
        variant="dashboard"
        title={
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Appointment Details
            </h3>
            {selectedEvent && (
              <p className="text-sm text-gray-500 mt-1">
                {dayjs(selectedEvent.start).format("MMMM Do YYYY")}
              </p>
            )}
          </div>
        }
        size="lg"
        variant="dashboard"
        footer={
          <div className="flex gap-3">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.location.href = `/admin/appointments`;
              }}
              className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              Manage Appointment
            </button>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Customer Information
              </h4>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium text-lg">
                  {selectedEvent.resource.client?.name || "Unknown"}
                </p>
                {selectedEvent.resource.client?.email && (
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {selectedEvent.resource.client.email}
                  </p>
                )}
                {selectedEvent.resource.client?.phone && (
                  <a
                    href={`tel:${selectedEvent.resource.client.phone}`}
                    className="text-sm text-gray-700 hover:text-blue-600 flex items-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {selectedEvent.resource.client.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Service & Specialist */}
            <div className="grid grid-cols-1 gap-4">
              {/* Services Section */}
              {selectedEvent.resource.services &&
              selectedEvent.resource.services.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    {selectedEvent.resource.services.length > 1
                      ? "Services"
                      : "Service"}
                  </h4>
                  <div className="space-y-2">
                    {selectedEvent.resource.services.map((svc, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded p-3"
                      >
                        <p className="text-gray-900 font-medium">
                          {svc.service?.name || svc.serviceName || "Service"}
                        </p>
                        {svc.variantName && (
                          <p className="text-sm text-gray-600 mt-1">
                            {svc.variantName} •{" "}
                            {svc.duration || svc.durationMin || 0} min • £
                            {(svc.price || 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))}
                    {selectedEvent.resource.services.length > 1 && (
                      <div className="pt-2 border-t border-gray-300 text-sm font-medium text-gray-700">
                        Total:{" "}
                        {selectedEvent.resource.services.reduce(
                          (sum, s) => sum + (s.duration || 0),
                          0
                        )}{" "}
                        min • £
                        {selectedEvent.resource.services
                          .reduce((sum, s) => sum + (s.price || 0), 0)
                          .toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    Service
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {selectedEvent.resource.serviceId?.name ||
                      selectedEvent.resource.variantName ||
                      "Unknown Service"}
                  </p>
                  {selectedEvent.resource.variantName && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedEvent.resource.variantName}
                    </p>
                  )}
                </div>
              )}

              {/* Specialist */}
              {selectedEvent.resource.specialistId?.name && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Specialist
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {selectedEvent.resource.specialistId.name}
                  </p>
                </div>
              )}
            </div>

            {/* Time & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Time
                </h4>
                <p className="text-gray-900 font-medium">
                  {dayjs(selectedEvent.start).format("h:mm A")}
                </p>
                <p className="text-sm text-gray-600">
                  to {dayjs(selectedEvent.end).format("h:mm A")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Duration:{" "}
                  {dayjs(selectedEvent.end).diff(
                    dayjs(selectedEvent.start),
                    "minutes"
                  )}{" "}
                  min
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Price
                </h4>
                <p className="text-gray-900 font-bold text-xl">
                  {formatCurrency(selectedEvent.resource.price || 0)}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            {selectedEvent.resource.payment && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment Details
                </h4>
                {(() => {
                  const paymentType =
                    selectedEvent.resource.payment.type ||
                    selectedEvent.resource.payment.mode;
                  const isDeposit = paymentType === "deposit";
                  const isFullPayment =
                    paymentType === "pay_now" || paymentType === "full";
                  const depositAmount =
                    selectedEvent.resource.payment.depositAmount ||
                    (selectedEvent.resource.payment.amountTotal
                      ? (selectedEvent.resource.payment.amountTotal - 50) / 100
                      : null);

                  return (
                    <>
                      <p className="text-gray-900 font-medium">
                        {isDeposit
                          ? "💳 Deposit Paid"
                          : isFullPayment
                          ? "✅ Paid in Full"
                          : "Payment Required"}
                      </p>
                      {isDeposit && depositAmount && (
                        <div className="text-sm text-gray-700 mt-2 space-y-1">
                          <p>Deposit Paid: {formatCurrency(depositAmount)}</p>
                          <p>
                            Balance Due:{" "}
                            {formatCurrency(
                              selectedEvent.resource.price - depositAmount
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Status
              </h4>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedEvent.resource.status === "completed" ||
                  selectedEvent.resource.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : selectedEvent.resource.status === "reserved_unpaid"
                    ? "bg-orange-100 text-orange-800"
                    : selectedEvent.resource.status?.includes("cancelled")
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {formatStatus(selectedEvent.resource.status)}
              </span>
            </div>

            {/* Notes */}
            {selectedEvent.resource.client?.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Notes
                </h4>
                <p className="text-sm text-gray-700">
                  {selectedEvent.resource.client.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        {/* Support Button */}
        <button
          onClick={() => {
            console.log("Support button clicked");
            setShowSupportModal(true);
          }}
          className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ring-4 ring-white"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </button>

        {/* Quick Actions Menu */}
        <button
          onClick={() => {
            const menu = document.getElementById("quick-actions-menu");
            menu?.classList.toggle("hidden");
          }}
          className="bg-white text-gray-700 rounded-full p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ring-4 ring-white"
          title="Quick Actions"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Quick Actions Dropdown */}
        <div
          id="quick-actions-menu"
          className="hidden absolute bottom-24 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 min-w-[220px] backdrop-blur-xl ring-1 ring-gray-200/50"
        >
          <button
            onClick={() => {
              setShowCreateServiceModal(true);
              // Close the quick actions menu
              document
                .getElementById("quick-actions-menu")
                .classList.add("hidden");
            }}
            className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-50/50 transition-all duration-200 text-gray-700 hover:text-brand-700 rounded-2xl mx-2 w-full text-left"
          >
            <div className="p-2 bg-brand-100 rounded-xl group-hover:bg-brand-500 group-hover:scale-110 transition-all">
              <svg
                className="w-5 h-5 text-brand-600 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="font-semibold">Add Service</span>
          </button>
          <button
            onClick={() => {
              setShowCreateStaffModal(true);
              // Close the quick actions menu
              document
                .getElementById("quick-actions-menu")
                .classList.add("hidden");
            }}
            className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-50/50 transition-all duration-200 text-gray-700 hover:text-brand-700 rounded-2xl mx-2 w-full text-left"
          >
            <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-500 group-hover:scale-110 transition-all">
              <svg
                className="w-5 h-5 text-blue-600 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="font-semibold">Add Staff</span>
          </button>
          <a
            href="/admin/clients"
            className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-50/50 transition-all duration-200 text-gray-700 hover:text-brand-700 rounded-2xl mx-2"
          >
            <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-500 group-hover:scale-110 transition-all">
              <svg
                className="w-5 h-5 text-green-600 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="font-semibold">Add Client</span>
          </a>
        </div>
      </div>

      {/* Create Service Modal */}
      <CreateServiceModal
        isOpen={showCreateServiceModal}
        onClose={() => setShowCreateServiceModal(false)}
        onSuccess={() => {
          // Optionally refresh data after service creation
          fetchData();
        }}
      />

      {/* Create Staff Modal */}
      <CreateStaffModal
        isOpen={showCreateStaffModal}
        onClose={() => setShowCreateStaffModal(false)}
        onSuccess={() => {
          // Optionally refresh data after staff creation
          fetchData();
        }}
      />

      {/* Specialist Filter Drawer */}
      <SelectDrawer
        open={showSpecialistDrawer}
        onClose={() => setShowSpecialistDrawer(false)}
        title={t("filterByBeautician", language)}
        options={[
          { value: "all", label: t("allBeauticians", language) },
          ...specialists.map((s) => ({
            value: s._id,
            label: s.name,
          })),
        ]}
        value={selectedSpecialist}
        onChange={(value) => {
          setSelectedSpecialist(value);
          setShowSpecialistDrawer(false);
        }}
      />

      {/* Edit Appointment Modal */}
      <EditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingAppointment(null);
        }}
        appointment={editingAppointment}
        setAppointment={setEditingAppointment}
        services={services}
        specialists={specialists}
        onSave={saveEdit}
        submitting={submitting}
      />

      {/* Support Modal */}
      <Modal
        open={showSupportModal}
        onClose={() => {
          setShowSupportModal(false);
          setSupportOption(null);
        }}
        title="Get Support"
        size="md"
        variant="dashboard"
      >
        {!supportOption ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center mb-6">
              How would you like to contact us?
            </p>

            {/* WhatsApp Option */}
            <button
              onClick={() => {
                window.open("https://wa.me/447928775746", "_blank");
                setShowSupportModal(false);
              }}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg">WhatsApp</h3>
                  <p className="text-sm text-white/90">
                    Chat with us instantly
                  </p>
                </div>
                <svg
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            {/* Email Form Option */}
            <button
              onClick={() => setSupportOption("form")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg">Send a Message</h3>
                  <p className="text-sm text-white/90">
                    We'll respond via email
                  </p>
                </div>
                <svg
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setSupportOption(null)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <FormField label="Your Name" required>
              <input
                type="text"
                value={supportForm.name}
                onChange={(e) =>
                  setSupportForm({ ...supportForm, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </FormField>

            <FormField label="Your Email" required>
              <input
                type="email"
                value={supportForm.email}
                onChange={(e) =>
                  setSupportForm({ ...supportForm, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </FormField>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={supportForm.message}
                onChange={(e) =>
                  setSupportForm({ ...supportForm, message: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="How can we help you?"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSupportModal(false);
                  setSupportOption(null);
                }}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                disabled={submitting}
                loading={submitting}
                className="flex-1"
              >
                Send Message
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          open={showDetailsModal}
          variant="dashboard"
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          title=""
          variant="dashboard"
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
                        Appointment Details
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold">
                      {selectedAppointment.client?.name || "Unknown Client"}
                    </h2>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      selectedAppointment.status === "confirmed" ||
                      selectedAppointment.status === "completed"
                        ? "bg-green-500/20 text-white ring-2 ring-white/30"
                        : selectedAppointment.status === "reserved_unpaid"
                        ? "bg-orange-500/20 text-white ring-2 ring-white/30"
                        : selectedAppointment.status?.includes("cancelled")
                        ? "bg-red-500/20 text-white ring-2 ring-white/30"
                        : selectedAppointment.status === "no_show"
                        ? "bg-gray-500/20 text-white ring-2 ring-white/30"
                        : "bg-blue-500/20 text-white ring-2 ring-white/30"
                    }`}
                  >
                    {formatStatus(selectedAppointment.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-semibold">
                      {dayjs(selectedAppointment.start).format(
                        "MMM D, YYYY • h:mm A"
                      )}
                    </span>
                  </div>
                  <span className="opacity-60">•</span>
                  <span className="font-medium">
                    {dayjs(selectedAppointment.end).diff(
                      dayjs(selectedAppointment.start),
                      "minute"
                    )}{" "}
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4">
              {/* Service */}
              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                      Service
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {selectedAppointment.serviceId?.name ||
                        selectedAppointment.variantName ||
                        "N/A"}
                    </p>
                    <p className="text-2xl font-black text-purple-600 mt-2">
                      {formatCurrency(selectedAppointment.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specialist */}
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      Specialist
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {selectedAppointment.specialistId?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                      Contact
                    </p>
                    {selectedAppointment.client?.email && (
                      <div className="flex items-center gap-2 text-sm mb-1.5">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="font-medium text-gray-700">
                          {selectedAppointment.client.email}
                        </span>
                      </div>
                    )}
                    {selectedAppointment.client?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="font-medium text-gray-700">
                          {selectedAppointment.client.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedAppointment.payment && (
                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                        Payment
                      </p>
                      {(() => {
                        const paymentType =
                          selectedAppointment.payment.type ||
                          selectedAppointment.payment.mode;
                        const isDeposit = paymentType === "deposit";
                        const isFullPayment =
                          paymentType === "pay_now" || paymentType === "full";
                        const depositAmount =
                          selectedAppointment.payment.depositAmount ||
                          (selectedAppointment.payment.amountTotal
                            ? (selectedAppointment.payment.amountTotal - 50) /
                              100
                            : null);

                        return (
                          <>
                            <p className="text-base font-bold text-gray-900 mb-2">
                              {isDeposit
                                ? "💳 Deposit Paid"
                                : isFullPayment
                                ? "✅ Paid in Full"
                                : "Payment Required"}
                            </p>
                            {isDeposit && depositAmount && (
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Deposit:
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(depositAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Balance Due:
                                  </span>
                                  <span className="font-bold text-amber-600">
                                    {formatCurrency(
                                      selectedAppointment.price - depositAmount
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedAppointment.client?.notes && (
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        Client Notes
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedAppointment.client.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAppointment(null);
                }}
                className="w-full sm:flex-1 order-2 sm:order-1"
              >
                Close
              </Button>
              <Button
                variant="brand"
                onClick={() => {
                  setShowDetailsModal(false);
                  openEditModal(selectedAppointment);
                }}
                className="w-full sm:flex-1 order-1 sm:order-2"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Appointment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Appointment Modal */}
      {showCreateAppointmentModal && (
        <Modal
          open={showCreateAppointmentModal}
          onClose={() => setShowCreateAppointmentModal(false)}
          title="Create New Appointment"
          size="lg"
          variant="dashboard"
        >
          <div className="space-y-5">
            {/* Client Information Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Client Information
                  </h3>
                  <p className="text-xs text-gray-500">
                    Who is this appointment for?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    label="Client Name"
                    htmlFor="client-name-create"
                    required
                  >
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="client-name-create"
                        className="border-2 border-gray-200 rounded-xl w-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                        placeholder="John Doe"
                        value={createFormData.clientName}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            clientName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Phone Number"
                    htmlFor="client-phone-create"
                    required
                  >
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="client-phone-create"
                        className="border-2 border-gray-200 rounded-xl w-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                        placeholder="+44 7700 900000"
                        value={createFormData.clientPhone}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            clientPhone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </FormField>
                </div>

                <FormField
                  label="Email Address (Optional)"
                  htmlFor="client-email-create"
                >
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="client-email-create"
                      className="border-2 border-gray-200 rounded-xl w-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                      placeholder="john.doe@example.com"
                      value={createFormData.clientEmail}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          clientEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 border border-purple-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Appointment Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    When and what service?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    label="Specialist"
                    htmlFor="specialist-create"
                    required
                  >
                    <SelectButton
                      onClick={() => setShowCreateSpecialistDrawer(true)}
                      placeholder="Choose specialist"
                      value={createFormData.specialistId}
                      options={specialists.map((s) => ({
                        value: s._id,
                        label: s.name,
                      }))}
                      className="border-2 border-gray-200 hover:border-purple-300"
                    />
                  </FormField>

                  <FormField label="Service" htmlFor="service-create" required>
                    <SelectButton
                      onClick={() => setShowCreateServiceDrawer(true)}
                      placeholder="Choose service"
                      value={createFormData.serviceId}
                      options={services.map((s) => ({
                        value: s._id,
                        label: s.name,
                      }))}
                      className="border-2 border-gray-200 hover:border-purple-300"
                    />
                  </FormField>
                </div>

                {/* Date & Time Selection with Slot Picker */}
                {createFormData.specialistId && createFormData.serviceId && (
                  <FormField
                    label="Date & Time"
                    htmlFor="datetime-create"
                    required
                  >
                    {createFormData.startDateTime ? (
                      <div className="space-y-2">
                        <div className="border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Selected Time:
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {new Date(
                              createFormData.startDateTime
                            ).toLocaleString("en-GB", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all font-medium"
                          onClick={() => setShowCreateTimePicker(true)}
                        >
                          Change Time
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 border-2 border-purple-500 text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold flex items-center justify-center gap-2"
                        onClick={() => setShowCreateTimePicker(true)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Select Available Time Slot
                      </button>
                    )}
                  </FormField>
                )}

                <FormField label="Notes (Optional)" htmlFor="notes-create">
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <textarea
                      id="notes-create"
                      className="border-2 border-gray-200 rounded-xl w-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      rows="3"
                      placeholder="Add any special notes or requirements..."
                      value={createFormData.notes}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateAppointmentModal(false)}
                className="w-full sm:flex-1 border-2 hover:bg-gray-50"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={() => {
                  toast.success(
                    "Appointment creation feature coming soon! Please use the calendar to create appointments for now."
                  );
                  setShowCreateAppointmentModal(false);
                }}
                className="w-full sm:flex-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Create Appointment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Appointment Drawers */}
      <SelectDrawer
        open={showCreateSpecialistDrawer}
        onClose={() => setShowCreateSpecialistDrawer(false)}
        title="Select Specialist"
        options={specialists.map((s) => ({ value: s._id, label: s.name }))}
        value={createFormData.specialistId}
        onChange={(value) => {
          setCreateFormData({ ...createFormData, specialistId: value });
          setShowCreateSpecialistDrawer(false);
        }}
      />

      <SelectDrawer
        open={showCreateServiceDrawer}
        onClose={() => setShowCreateServiceDrawer(false)}
        title="Select Service"
        options={services.map((s) => ({ value: s._id, label: s.name }))}
        value={createFormData.serviceId}
        onChange={(value) => {
          setCreateFormData({ ...createFormData, serviceId: value });
          setShowCreateServiceDrawer(false);
        }}
      />

      {/* DateTimePicker Modal for Create Appointment */}
      {showCreateTimePicker &&
        createFormData.specialistId &&
        createFormData.serviceId &&
        createPortal(
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateTimePicker(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Select Date & Time
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateTimePicker(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
              <div className="p-6 overflow-y-auto">
                <DateTimePicker
                  specialistId={createFormData.specialistId}
                  serviceId={createFormData.serviceId}
                  variantName={
                    services.find((s) => s._id === createFormData.serviceId)
                      ?.variants?.[0]?.name || "Standard"
                  }
                  salonTz="Europe/London"
                  stepMin={15}
                  beauticianWorkingHours={
                    specialists.find(
                      (s) => s._id === createFormData.specialistId
                    )?.workingHours
                  }
                  customSchedule={
                    specialists.find(
                      (s) => s._id === createFormData.specialistId
                    )?.customSchedule
                  }
                  onSelect={handleCreateSlotSelect}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// EditModal Component
function EditModal({
  open,
  onClose,
  appointment,
  setAppointment,
  services,
  specialists,
  onSave,
  submitting,
}) {
  if (!appointment) return null;

  const [showSpecialistDrawer, setShowSpecialistDrawer] = useState(false);
  const [showServiceDrawer, setShowServiceDrawer] = useState(false);
  const [showVariantDrawer, setShowVariantDrawer] = useState(false);

  const updateField = (field, value) => {
    setAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const selectedService = services.find((s) => s._id === appointment.serviceId);
  const variants = selectedService?.variants || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Appointment"
      variant="dashboard"
    >
      <div className="space-y-4">
        {/* Client Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Client Information</h3>
          <FormField label="Name" htmlFor="client-name-edit">
            <input
              type="text"
              id="client-name-edit"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
            />
          </FormField>
          <FormField label="Email" htmlFor="client-email-edit">
            <input
              type="email"
              id="client-email-edit"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
            />
          </FormField>
          <FormField label="Phone" htmlFor="client-phone-edit">
            <input
              type="tel"
              id="client-phone-edit"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
            />
          </FormField>
          <FormField label="Notes" htmlFor="client-notes-edit">
            <textarea
              id="client-notes-edit"
              className="border rounded w-full px-3 py-2"
              rows="2"
              value={appointment.clientNotes}
              onChange={(e) => updateField("clientNotes", e.target.value)}
            />
          </FormField>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 pt-3 border-t">
          <h3 className="font-semibold text-gray-900">Appointment Details</h3>
          <FormField label="Specialist" htmlFor="specialist-select-edit">
            <SelectButton
              value={appointment.specialistId}
              placeholder="Select Specialist"
              options={[
                { label: "Select Specialist", value: "" },
                ...specialists.map((b) => ({
                  label: b.name,
                  value: b._id,
                })),
              ]}
              onClick={() => setShowSpecialistDrawer(true)}
            />
            <SelectDrawer
              open={showSpecialistDrawer}
              onClose={() => setShowSpecialistDrawer(false)}
              title="Select Specialist"
              options={[
                { label: "Select Specialist", value: "" },
                ...specialists.map((b) => ({
                  label: b.name,
                  value: b._id,
                })),
              ]}
              value={appointment.specialistId}
              onChange={(value) => {
                updateField("specialistId", value);
                setShowSpecialistDrawer(false);
              }}
            />
          </FormField>

          {/* Multi-Service Display */}
          {appointment.services && appointment.services.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Services Booked ({appointment.services.length})
              </label>
              <div className="space-y-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                {appointment.services.map((svc, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded p-3"
                  >
                    <div className="font-medium text-gray-900">
                      {svc.service?.name || svc.serviceName || "Service"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {svc.variantName} • {svc.duration || svc.durationMin || 0}{" "}
                      min • £{(svc.price || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 text-sm font-medium text-gray-700">
                  Total:{" "}
                  {appointment.services.reduce(
                    (sum, s) => sum + (s.duration || 0),
                    0
                  )}{" "}
                  min • £
                  {appointment.services
                    .reduce((sum, s) => sum + (s.price || 0), 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <FormField label="Service" htmlFor="service-select-edit">
                <SelectButton
                  value={appointment.serviceId}
                  placeholder="Select Service"
                  options={[
                    { label: "Select Service", value: "" },
                    ...services.map((s) => ({
                      label: s.name,
                      value: s._id,
                    })),
                  ]}
                  onClick={() => setShowServiceDrawer(true)}
                />
                <SelectDrawer
                  open={showServiceDrawer}
                  onClose={() => setShowServiceDrawer(false)}
                  title="Select Service"
                  options={[
                    { label: "Select Service", value: "" },
                    ...services.map((s) => ({
                      label: s.name,
                      value: s._id,
                    })),
                  ]}
                  value={appointment.serviceId}
                  onChange={(value) => {
                    updateField("serviceId", value);
                    updateField("variantName", "");
                    setShowServiceDrawer(false);
                  }}
                />
              </FormField>
              <FormField label="Variant" htmlFor="variant-select-edit">
                <SelectButton
                  value={appointment.variantName}
                  placeholder="Select Variant"
                  options={[
                    { label: "Select Variant", value: "" },
                    ...variants.map((v) => ({
                      label: `${v.name} - £${v.price} (${v.durationMin}min)`,
                      value: v.name,
                    })),
                  ]}
                  onClick={() => setShowVariantDrawer(true)}
                  disabled={!appointment.serviceId}
                />
                <SelectDrawer
                  open={showVariantDrawer}
                  onClose={() => setShowVariantDrawer(false)}
                  title="Select Variant"
                  options={[
                    { label: "Select Variant", value: "" },
                    ...variants.map((v) => ({
                      label: `${v.name} - £${v.price} (${v.durationMin}min)`,
                      value: v.name,
                    })),
                  ]}
                  value={appointment.variantName}
                  onChange={(value) => {
                    updateField("variantName", value);
                    setShowVariantDrawer(false);
                  }}
                  emptyMessage="Please select a service first"
                />
              </FormField>
            </>
          )}
          <div className="w-full max-w-full overflow-hidden">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full"
              style={{ minWidth: 0 }}
            >
              <FormField label="Start Time" htmlFor="start-time-edit">
                <input
                  type="datetime-local"
                  id="start-time-edit"
                  className="appearance-none box-border w-full max-w-full border rounded px-2 py-1.5 text-[16px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-hidden"
                  style={{ minWidth: 0, maxWidth: "100%" }}
                  value={appointment.start}
                  onChange={(e) => updateField("start", e.target.value)}
                />
              </FormField>
              <FormField label="End Time" htmlFor="end-time-edit">
                <input
                  type="datetime-local"
                  id="end-time-edit"
                  className="appearance-none box-border w-full max-w-full border rounded px-2 py-1.5 text-[16px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-hidden"
                  style={{ minWidth: 0, maxWidth: "100%" }}
                  value={appointment.end}
                  onChange={(e) => updateField("end", e.target.value)}
                />
              </FormField>
            </div>
          </div>
          <FormField label="Price (£)" htmlFor="price-edit">
            <input
              type="number"
              id="price-edit"
              step="0.01"
              className="border rounded w-full px-3 py-2"
              value={appointment.price}
              onChange={(e) => updateField("price", e.target.value)}
            />
          </FormField>

          {/* Payment Type & Details */}
          {appointment.payment && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Payment Details
              </div>
              {(() => {
                const paymentType =
                  appointment.payment.type || appointment.payment.mode;
                const isDeposit = paymentType === "deposit";
                const isFullPayment =
                  paymentType === "pay_now" || paymentType === "full";
                const depositAmount =
                  appointment.payment.depositAmount ||
                  (appointment.payment.amountTotal
                    ? (appointment.payment.amountTotal - 50) / 100
                    : null);

                return (
                  <>
                    <div className="text-sm text-gray-900 font-medium">
                      {isDeposit
                        ? "💳 Deposit Paid"
                        : isFullPayment
                        ? "✅ Paid in Full"
                        : "Payment Required"}
                    </div>
                    {isDeposit && depositAmount && (
                      <div className="text-sm text-gray-700 mt-2 space-y-1">
                        <p>Deposit Paid: £{Number(depositAmount).toFixed(2)}</p>
                        <p>
                          Balance Due: £
                          {Number(appointment.price - depositAmount).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="brand"
          onClick={onSave}
          disabled={submitting}
          loading={submitting}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}
