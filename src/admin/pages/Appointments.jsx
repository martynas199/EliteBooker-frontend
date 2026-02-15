import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { selectAdmin } from "../../shared/state/authSlice";
import { api } from "../../shared/lib/apiClient";
import { useSharedData } from "../../shared/hooks/useSharedData";
import Modal from "../../shared/components/ui/Modal";
import FormField from "../../shared/components/forms/FormField";
import Button from "../../shared/components/ui/Button";
import {
  SkeletonBox,
  TableRowSkeleton,
} from "../../shared/components/ui/Skeleton";
import { SlowRequestWarning } from "../../shared/components/ui/SlowRequestWarning";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";
import DateTimePicker from "../../shared/components/DateTimePicker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import { useDebounce } from "../../shared/hooks/useDebounce";
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";
import AdminPageShell from "../components/AdminPageShell";
import AppointmentsMetricsStrip from "../components/appointments/AppointmentsMetricsStrip";
import AppointmentConfirmDialog from "../components/appointments/AppointmentConfirmDialog";

export default function Appointments() {
  const { language } = useLanguage();
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";
  const hasAppointmentAccess = isSuperAdmin || Boolean(admin?.specialistId);

  // Use shared data hook for cached specialists and services
  const {
    specialists,
    services,
    isLoading: sharedDataLoading,
  } = useSharedData();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [preview, setPreview] = useState(null);
  const [reason, setReason] = useState("Admin initiated");
  const [submitting, setSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "start",
    direction: "desc",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    payload: null,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    tone: "danger",
  });
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientNotes: "",
    specialistId: "",
    serviceId: "",
    variantName: "",
    start: "",
    end: "",
    price: 0,
    paymentStatus: "paid",
  });

  // Filter state
  const [selectedSpecialistId, setSelectedSpecialistId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showSpecialistDrawer, setShowSpecialistDrawer] = useState(false);
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const [showDateDrawer, setShowDateDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const getDateRange = useCallback(() => {
    const now = new Date();
    let start;
    let end;

    switch (dateFilter) {
      case "day":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "week": {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + diff,
        );
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        return null;
    }

    return start && end ? { start, end } : null;
  }, [dateFilter, customStartDate, customEndDate]);

  // Consent state - tracks which appointments have signed consents
  const [consentsMap, setConsentsMap] = useState({});

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const effectiveSpecialistId = isSuperAdmin
    ? selectedSpecialistId
    : admin?.specialistId || "";
  const activeDateRange = useMemo(() => getDateRange(), [getDateRange]);

  const appointmentFilters = useMemo(
    () => ({
      specialistId: effectiveSpecialistId,
      status: statusFilter,
      search: debouncedSearchQuery.trim(),
      dateFrom: activeDateRange?.start?.toISOString() || "",
      dateTo: activeDateRange?.end?.toISOString() || "",
    }),
    [
      activeDateRange?.end,
      activeDateRange?.start,
      debouncedSearchQuery,
      effectiveSpecialistId,
      statusFilter,
    ],
  );

  useEffect(() => {
    if (!isSuperAdmin && admin?.specialistId) {
      setSelectedSpecialistId(admin.specialistId);
    }
  }, [admin?.specialistId, isSuperAdmin]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [
    appointmentFilters.specialistId,
    appointmentFilters.status,
    appointmentFilters.search,
    appointmentFilters.dateFrom,
    appointmentFilters.dateTo,
  ]);

  // React Query for appointments with pagination + server-side filters
  const {
    data: appointmentsData,
    isLoading,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: [
      "appointments",
      pagination.page,
      pagination.limit,
      appointmentFilters.specialistId,
      appointmentFilters.status,
      appointmentFilters.search,
      appointmentFilters.dateFrom,
      appointmentFilters.dateTo,
    ],
    queryFn: async ({ signal, queryKey }) => {
      const [
        ,
        page,
        limit,
        specialistId,
        status,
        search,
        dateFrom,
        dateTo,
      ] = queryKey;

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (specialistId) params.set("specialistId", specialistId);
      if (status && status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await api.get(`/appointments?${params.toString()}`, {
        signal,
      });

      if (response.data?.data) {
        return {
          appointments: response.data.data || [],
          pagination: response.data.pagination || pagination,
        };
      }

      return {
        appointments: Array.isArray(response.data) ? response.data : [],
        pagination,
      };
    },
    enabled: !!admin && hasAppointmentAccess,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const { data: appointmentMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["appointments-metrics", effectiveSpecialistId || "all"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (effectiveSpecialistId) {
        params.set("specialistId", effectiveSpecialistId);
      }
      const queryString = params.toString();
      const response = await api.get(
        `/appointments/metrics${queryString ? `?${queryString}` : ""}`,
      );
      return response.data;
    },
    enabled: !!admin && hasAppointmentAccess,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const rows = appointmentsData?.appointments || [];
  const loading = sharedDataLoading || isLoading;

  // Update pagination data when appointmentsData changes
  useEffect(() => {
    if (appointmentsData?.pagination) {
      setPagination(appointmentsData.pagination);
    }
  }, [appointmentsData]);

  // Check consent status for appointments
  useEffect(() => {
    if (rows.length > 0) {
      const appointmentIds = rows.map((apt) => apt._id);
      checkConsentForAppointments(appointmentIds);
    }
  }, [rows]);

  // Close date pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".date-picker-container")) {
        setShowStartPicker(false);
        setShowEndPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort current page results client-side for immediate table interactions
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case "client":
          aVal = a.client?.name || "";
          bVal = b.client?.name || "";
          break;
        case "staff":
          aVal = a.specialist?.name || a.specialistId || "";
          bVal = b.specialist?.name || b.specialistId || "";
          break;
        case "service":
          aVal =
            a.services && a.services.length > 0
              ? a.services
                  .map((s) => s.service?.name || s.serviceName || s.serviceId)
                  .join(", ")
              : `${a.service?.name || a.serviceId} - ${a.variantName}`;
          bVal =
            b.services && b.services.length > 0
              ? b.services
                  .map((s) => s.service?.name || s.serviceName || s.serviceId)
                  .join(", ")
              : `${b.service?.name || b.serviceId} - ${b.variantName}`;
          break;
        case "start":
          aVal = new Date(a.start).getTime();
          bVal = new Date(b.start).getTime();
          break;
        case "price":
          aVal = Number(a.price || 0);
          bVal = Number(b.price || 0);
          break;
        case "status":
          aVal = a.status || "";
          bVal = b.status || "";
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig.key, sortConfig.direction]);

  async function openCancelModal(id) {
    try {
      const prev = await api
        .get(`/appointments/${id}/cancel/preview`)
        .then((r) => r.data);
      setPreview(prev);
      setActiveId(id);
      setModalOpen(true);
    } catch (e) {
      toast.error(e.message || "Failed to load preview");
    }
  }

  async function confirmCancel() {
    if (!activeId) return;
    setSubmitting(true);
    try {
      const res = await api
        .post(`/appointments/${activeId}/cancel`, {
          requestedBy: "staff",
          reason: reason || undefined,
        })
        .then((r) => r.data);

      // Refetch appointments to get latest data
      await refetchAppointments();

      setModalOpen(false);
      setActiveId("");
      setPreview(null);
      setReason("Admin initiated");
      toast.success("Appointment cancelled successfully");
    } catch (e) {
      toast.error(e.message || "Failed to cancel appointment");
    } finally {
      setSubmitting(false);
    }
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      type: null,
      payload: null,
      title: "",
      description: "",
      confirmLabel: "Confirm",
      tone: "danger",
    });
  };

  const openConfirmDialog = (config) => {
    setConfirmDialog({
      open: true,
      type: config.type,
      payload: config.payload || null,
      title: config.title,
      description: config.description,
      confirmLabel: config.confirmLabel || "Confirm",
      tone: config.tone || "danger",
    });
  };

  async function handleConfirmAction() {
    if (!confirmDialog.type) return;

    setConfirmSubmitting(true);
    try {
      if (confirmDialog.type === "delete-appointment") {
        await api.delete(`/appointments/${confirmDialog.payload?.appointmentId}`);
        await refetchAppointments();
        toast.success("Appointment deleted successfully");
      }

      if (confirmDialog.type === "no-show") {
        await api.patch(`/appointments/${confirmDialog.payload?.appointmentId}/status`, {
          status: "no_show",
        });
        await refetchAppointments();
        toast.success("Marked as No Show");
      }

      if (confirmDialog.type === "delete-all") {
        const specialistId = confirmDialog.payload?.specialistId;
        const res = await api.delete(`/appointments/specialist/${specialistId}`);
        await refetchAppointments();
        toast.success(
          res.data?.message || `Deleted ${res.data?.deletedCount || 0} appointment(s)`,
        );
      }

      closeConfirmDialog();
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Action could not be completed",
      );
    } finally {
      setConfirmSubmitting(false);
    }
  }

  function deleteAppointment(id) {
    openConfirmDialog({
      type: "delete-appointment",
      payload: { appointmentId: id },
      title: "Delete canceled appointment",
      description: "This permanently removes the canceled appointment.",
      confirmLabel: "Delete appointment",
      tone: "danger",
    });
  }

  function handleDeleteAll() {
    if (!admin?.specialistId) {
      toast.error("No specialist linked to this account");
      return;
    }

    openConfirmDialog({
      type: "delete-all",
      payload: { specialistId: admin.specialistId },
      title: "Delete all appointments",
      description:
        "This removes every appointment linked to your specialist profile. This cannot be undone.",
      confirmLabel: "Delete all appointments",
      tone: "danger",
    });
  }

  function markAsNoShow(id) {
    openConfirmDialog({
      type: "no-show",
      payload: { appointmentId: id },
      title: "Mark appointment as no-show",
      description: "Use this only when the client did not attend the booking.",
      confirmLabel: "Mark as no-show",
      tone: "warning",
    });
  }

  // Check if an appointment has a signed consent
  async function checkConsentForAppointments(appointmentIds) {
    try {
      const uncheckedAppointmentIds = appointmentIds.filter(
        (appointmentId) => !consentsMap[appointmentId]
      );

      if (uncheckedAppointmentIds.length === 0) {
        return;
      }

      const response = await api.post("/consents/appointment-status/batch", {
        appointmentIds: uncheckedAppointmentIds,
      });

      const newConsentsMap = response.data?.data || {};

      setConsentsMap((prev) => ({ ...prev, ...newConsentsMap }));
    } catch (error) {
      console.error("Error checking consents:", error);
    }
  }

  // View consent PDF
  async function viewConsentPDF(consentId) {
    const loadingToast = toast.loading("Generating PDF...");
    try {
      const response = await api.get(`/consents/${consentId}/pdf`, {
        responseType: "arraybuffer", // Use arraybuffer instead of blob for better control
      });

      toast.dismiss(loadingToast);

      // Verify we got binary data
      if (!response.data || response.data.byteLength === 0) {
        toast.error("Received empty PDF");
        return;
      }

      console.log(`Received PDF: ${response.data.byteLength} bytes`);

      // Check PDF magic bytes
      const header = new Uint8Array(response.data.slice(0, 5));
      const headerStr = String.fromCharCode(...header);
      if (!headerStr.startsWith("%PDF-")) {
        console.error("Invalid PDF header:", headerStr);
        toast.error("Received invalid PDF data");
        return;
      }

      // Create a blob URL from the PDF data
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      console.log("PDF blob URL created:", pdfUrl);

      // Open in new tab
      const newWindow = window.open(pdfUrl, "_blank");

      if (!newWindow) {
        toast.error("Please allow popups to view the PDF");
        URL.revokeObjectURL(pdfUrl);
        return;
      }

      // Clean up the URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
        console.log("PDF blob URL cleaned up");
      }, 10000);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error fetching consent PDF:", error);

      // Handle different error types
      if (error.response?.data) {
        // Try to parse error message
        try {
          const decoder = new TextDecoder("utf-8");
          const text = decoder.decode(error.response.data);
          const errorData = JSON.parse(text);
          toast.error(errorData.message || "Failed to load consent PDF");
        } catch {
          toast.error("Failed to load consent PDF");
        }
      } else {
        toast.error(error.message || "Failed to load consent PDF");
      }
    }
  }

  function openEditModal(appointment) {
    setEditingAppointment({
      _id: appointment._id,
      clientName: appointment.client?.name || "",
      clientEmail: appointment.client?.email || "",
      clientPhone: appointment.client?.phone || "",
      clientNotes: appointment.client?.notes || "",
      specialistId:
        appointment.specialistId?._id || appointment.specialistId || "", // Handle both populated and unpopulated
      serviceId: appointment.serviceId?._id || appointment.serviceId || "", // Handle both populated and unpopulated
      variantName: appointment.variantName || "",
      start: appointment.start
        ? new Date(appointment.start).toISOString().slice(0, 16)
        : "",
      end: appointment.end
        ? new Date(appointment.end).toISOString().slice(0, 16)
        : "",
      price: appointment.price || 0,
      services: appointment.services || [], // Preserve multi-service data
      payment: appointment.payment || null, // Preserve payment data
    });
    setEditModalOpen(true);
  }

  async function saveEdit() {
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
          specialistId: editingAppointment.specialistId, // Map specialistId to specialistId for API
          serviceId: editingAppointment.serviceId,
          variantName: editingAppointment.variantName,
          start: editingAppointment.start,
          end: editingAppointment.end,
          price: Number(editingAppointment.price),
        })
        .then((r) => r.data);

      if (res.success && res.appointment) {
        // Refetch appointments to get latest data
        await refetchAppointments();
      }

      setEditModalOpen(false);
      setEditingAppointment(null);
      toast.success("Appointment updated successfully");
    } catch (e) {
      toast.error(
        e.response?.data?.error || e.message || "Failed to update appointment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateModal() {
    // Reset form
    setNewAppointment({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientNotes: "",
      specialistId: isSuperAdmin ? "" : admin?.specialistId || "", // Map backend's specialistId to UI's specialistId
      serviceId: "",
      variantName: "",
      start: "",
      end: "",
      price: 0,
      paymentStatus: "paid",
      depositAmount: 30, // Default 30% deposit
    });
    setCreateModalOpen(true);
  }

  async function saveNewAppointment() {
    if (!newAppointment) return;

    // Validation
    if (!newAppointment.clientName || !newAppointment.clientEmail) {
      toast.error("Client name and email are required");
      return;
    }
    if (
      !newAppointment.specialistId ||
      !newAppointment.serviceId ||
      !newAppointment.variantName
    ) {
      toast.error("Specialist, service, and variant are required");
      return;
    }
    if (!newAppointment.start) {
      toast.error("Start time is required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/appointments", {
        client: {
          name: newAppointment.clientName,
          email: newAppointment.clientEmail,
          phone: newAppointment.clientPhone,
          notes: newAppointment.clientNotes,
        },
        specialistId: newAppointment.specialistId, // Map specialistId to specialistId for API
        serviceId: newAppointment.serviceId,
        variantName: newAppointment.variantName,
        startISO: newAppointment.start,
        mode:
          newAppointment.paymentStatus === "paid" ? "pay_in_salon" : "online",
        paymentStatus: newAppointment.paymentStatus, // Pass the payment status (paid, unpaid, deposit)
        depositAmount: newAppointment.depositAmount, // Pass custom deposit amount (percentage)
      });

      if (response.data.ok) {
        // Refresh appointments list
        await refetchAppointments();
        setCreateModalOpen(false);
        toast.success("Appointment created successfully");
      }
    } catch (e) {
      // Close modal first so error is visible
      setCreateModalOpen(false);
      // Show error toast after a brief delay to ensure modal closes first
      setTimeout(() => {
        toast.error(
          e.response?.data?.error ||
            e.message ||
            "Failed to create appointment",
          { duration: 5000 } // Show error for 5 seconds
        );
      }, 100);
    } finally {
      setSubmitting(false);
    }
  }

  const pageDescription = isSuperAdmin
    ? "View and manage all appointments from all specialists"
    : admin?.specialistId
    ? t("viewAppointmentsLinkedBeauticianOnly", language)
    : "Manage appointments and availability";

  const specialistOptions = isSuperAdmin
    ? [
        { label: "All Specialists", value: "" },
        ...specialists.map((specialist) => ({
          label: specialist.name,
          value: specialist._id,
        })),
      ]
    : specialists
        .filter((specialist) => specialist._id === admin?.specialistId)
        .map((specialist) => ({
          label: specialist.name,
          value: specialist._id,
        }));

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Reserved Unpaid", value: "reserved_unpaid" },
    { label: "No Show", value: "no_show" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const dateOptions = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "day" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "Custom Range", value: "custom" },
  ];

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    (isSuperAdmin && selectedSpecialistId) ||
    statusFilter !== "all" ||
    dateFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    if (isSuperAdmin) {
      setSelectedSpecialistId("");
    } else if (admin?.specialistId) {
      setSelectedSpecialistId(admin.specialistId);
    }
    setStatusFilter("all");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  return (
    <AdminPageShell
      title={t("appointments", language)}
      description={pageDescription}
      action={
        isSuperAdmin || admin?.specialistId ? (
          <Button
            variant="brand"
            size="md"
            onClick={openCreateModal}
            className="w-full sm:w-auto"
          >
            New Appointment
          </Button>
        ) : null
      }
      maxWidth="2xl"
    >
      <SlowRequestWarning isLoading={loading} threshold={2000} />

      {/* Show warning for regular admins without linked specialist */}
      {!isSuperAdmin && !admin?.specialistId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0"
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
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-900">
                {t("accountNotLinked", language)}
              </p>
              <p className="text-xs text-amber-700 mt-0.5 sm:mt-1">
                {t("contactSuperAdmin", language)}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasAppointmentAccess && (
        <div className="mb-4">
          <AppointmentsMetricsStrip
            metrics={appointmentMetrics}
            loading={metricsLoading}
          />
        </div>
      )}

      {/* Filters - only show if admin has access */}
      {hasAppointmentAccess && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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
              placeholder="Search by name, email, phone, service..."
              className="w-full pl-11 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors shadow-sm"
              style={{ fontSize: "16px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="h-5 w-5"
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
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Specialist Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">
                Specialist
              </label>
              <SelectButton
                value={selectedSpecialistId}
                placeholder="Select one..."
                options={specialistOptions}
                onClick={() => isSuperAdmin && setShowSpecialistDrawer(true)}
                disabled={!isSuperAdmin}
              />
              <SelectDrawer
                open={showSpecialistDrawer}
                onClose={() => setShowSpecialistDrawer(false)}
                title="Select Specialist"
                options={specialistOptions}
                value={selectedSpecialistId}
                onChange={(value) => {
                  setSelectedSpecialistId(value);
                  setShowSpecialistDrawer(false);
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">
                Status
              </label>
              <SelectButton
                value={statusFilter}
                placeholder="Select one..."
                options={statusOptions}
                onClick={() => setShowStatusDrawer(true)}
              />
              <SelectDrawer
                open={showStatusDrawer}
                onClose={() => setShowStatusDrawer(false)}
                title="Select Status"
                options={statusOptions}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setShowStatusDrawer(false);
                }}
              />
            </div>

            {/* Date Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">
                Date Range
              </label>
              <SelectButton
                value={dateFilter}
                placeholder="Select one..."
                options={dateOptions}
                onClick={() => setShowDateDrawer(true)}
              />
              <SelectDrawer
                open={showDateDrawer}
                onClose={() => setShowDateDrawer(false)}
                title="Select Date Range"
                options={dateOptions}
                value={dateFilter}
                onChange={(value) => {
                  setDateFilter(value);
                  setShowDateDrawer(false);
                }}
              />
            </div>
          </div>

          {(hasActiveFilters || (!isSuperAdmin && admin?.specialistId)) && (
            <div className="flex flex-wrap justify-end gap-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
              {!isSuperAdmin && admin?.specialistId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={handleDeleteAll}
                >
                  Delete all my appointments
                </Button>
              )}
            </div>
          )}

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 border-t">
              <FormField
                label={t("startDate", language) || "Start Date"}
                htmlFor="start-date"
                className="flex-1"
              >
                <div className="date-picker-container relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStartPicker(!showStartPicker);
                      setShowEndPicker(false);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {customStartDate
                        ? dayjs(customStartDate).format("MMM DD, YYYY")
                        : "Select start date"}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {showStartPicker && (
                    <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                      <DayPicker
                        mode="single"
                        selected={
                          customStartDate
                            ? new Date(customStartDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const newStartDate =
                              dayjs(date).format("YYYY-MM-DD");
                            setCustomStartDate(newStartDate);
                            setShowStartPicker(false);

                            // Auto-adjust end date if it becomes invalid
                            if (
                              customEndDate &&
                              dayjs(newStartDate).isAfter(dayjs(customEndDate))
                            ) {
                              setCustomEndDate(newStartDate);
                            }
                          }
                        }}
                        className="rdp-custom"
                        modifiersClassNames={{
                          selected: "!bg-brand-600 !text-white font-semibold",
                          today: "!text-brand-600 font-bold",
                        }}
                      />
                    </div>
                  )}
                </div>
              </FormField>
              <FormField
                label={t("endDate", language) || "End Date"}
                htmlFor="end-date"
                className="flex-1"
              >
                <div className="date-picker-container relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEndPicker(!showEndPicker);
                      setShowStartPicker(false);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {customEndDate
                        ? dayjs(customEndDate).format("MMM DD, YYYY")
                        : "Select end date"}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {showEndPicker && (
                    <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                      <DayPicker
                        mode="single"
                        selected={
                          customEndDate ? new Date(customEndDate) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const newEndDate = dayjs(date).format("YYYY-MM-DD");
                            setCustomEndDate(newEndDate);
                            setShowEndPicker(false);

                            // Auto-adjust start date if it becomes invalid
                            if (
                              customStartDate &&
                              dayjs(customStartDate).isAfter(dayjs(newEndDate))
                            ) {
                              setCustomStartDate(newEndDate);
                            }
                          }
                        }}
                        fromDate={
                          customStartDate
                            ? new Date(customStartDate)
                            : undefined
                        }
                        className="rdp-custom"
                        modifiersClassNames={{
                          selected: "!bg-brand-600 !text-white font-semibold",
                          today: "!text-brand-600 font-bold",
                        }}
                      />
                    </div>
                  )}
                </div>
              </FormField>
            </div>
          )}
        </div>
      )}

      {/* Loading State with Skeletons */}
      {loading && (
        <div className="space-y-3 sm:space-y-4">
          {/* Mobile Cards Skeleton */}
          <div className="lg:hidden space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-3 space-y-3"
              >
                {/* Header skeleton */}
                <div className="flex justify-between items-start pb-2 border-b border-gray-100">
                  <div className="space-y-1.5 flex-1">
                    <SkeletonBox className="w-32 h-4" />
                    <SkeletonBox className="w-24 h-3" />
                  </div>
                  <SkeletonBox className="w-14 h-5 rounded-md" />
                </div>

                {/* Details skeleton */}
                <div className="space-y-2.5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start gap-2">
                      <SkeletonBox className="w-7 h-7 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <SkeletonBox className="w-10 h-2.5" />
                        <SkeletonBox className="w-full h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buttons skeleton */}
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <SkeletonBox className="flex-1 h-9 rounded-lg" />
                  <SkeletonBox className="w-9 h-9 rounded-lg" />
                  <SkeletonBox className="w-9 h-9 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Skeleton */}
          <div className="hidden lg:block rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Client",
                      "Specialist",
                      "Service",
                      "Date/Time",
                      "Status",
                      "Actions",
                    ].map((header, i) => (
                      <th key={i} className="px-6 py-3">
                        <SkeletonBox className="w-20 h-4" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <SkeletonBox className="w-full h-4" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 pt-4 border-t">
            <SkeletonBox className="h-4 w-48 sm:w-64" />
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <SkeletonBox className="h-11 sm:h-9 flex-1 sm:flex-none sm:w-24" />
              <SkeletonBox className="h-11 sm:h-9 w-24 sm:w-20" />
              <SkeletonBox className="h-11 sm:h-9 flex-1 sm:flex-none sm:w-24" />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && sortedRows.length > 0 && (
        <div className="hidden lg:block overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-[800px] w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <SortableHeader
                  label="Client"
                  sortKey="client"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Staff"
                  sortKey="staff"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Service"
                  sortKey="service"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Date & Time"
                  sortKey="start"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Price"
                  sortKey="price"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="text-left px-4 py-4 font-semibold text-gray-700 text-sm">
                  Payment Type
                </th>
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="text-left px-4 py-4 font-semibold text-gray-700 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {r.client?.name}
                    </div>
                    {r.client?.email && (
                      <div className="text-xs text-gray-600">
                        {r.client.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                        {(r.specialist?.name || r.specialistId || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="text-gray-900">
                        {r.specialist?.name || r.specialistId}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {r.services && r.services.length > 0 ? (
                      <div className="space-y-1">
                        {r.services.map((svc, idx) => (
                          <div key={idx}>
                            <div className="font-medium text-gray-900">
                              {svc.service?.name || svc.serviceId || "Service"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {svc.variantName} •{" "}
                              {svc.duration || svc.durationMin || 0} min
                            </div>
                          </div>
                        ))}
                        {r.services.length > 1 && (
                          <div className="text-xs text-gray-600 font-medium mt-1">
                            {r.services.length} services
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">
                          {r.service?.name || r.serviceId}
                        </div>
                        <div className="text-xs text-gray-600">
                          {r.variantName}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-900">
                      {new Date(r.start).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(r.start).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-lg font-semibold text-green-700">
                      £{Number(r.price || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      // Check for payment.type
                      if (r.payment?.type) {
                        return (
                          <div>
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                r.payment.type === "deposit"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {r.payment.type === "deposit" ? (
                                <>
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                  </svg>
                                  Deposit
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Full
                                </>
                              )}
                            </div>
                            {r.payment.type === "deposit" &&
                              r.payment.depositAmount && (
                                <div className="text-xs text-gray-600 mt-1.5">
                                  £{Number(r.payment.depositAmount).toFixed(2)}{" "}
                                  paid
                                </div>
                              )}
                          </div>
                        );
                      }

                      // Check for payment.mode (legacy)
                      if (r.payment?.mode) {
                        return (
                          <div>
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                r.payment.mode === "deposit"
                                  ? "bg-purple-100 text-purple-800"
                                  : r.payment.mode === "pay_in_salon"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {r.payment.mode === "deposit" ? (
                                <>
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                  </svg>
                                  Deposit
                                </>
                              ) : r.payment.mode === "pay_now" ? (
                                <>
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Full
                                </>
                              ) : r.payment.mode === "pay_in_salon" ? (
                                <>
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                  In Salon
                                </>
                              ) : (
                                r.payment.mode
                              )}
                            </div>
                            {r.payment.mode === "deposit" &&
                              r.payment.amountTotal && (
                                <div className="text-xs text-gray-600 mt-1.5">
                                  £
                                  {((r.payment.amountTotal - 50) / 100).toFixed(
                                    2
                                  )}{" "}
                                  paid
                                </div>
                              )}
                          </div>
                        );
                      }

                      // Default when no payment info
                      return (
                        <span className="text-xs text-gray-500 italic">
                          N/A
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                          r.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : r.status === "reserved_unpaid"
                            ? "bg-yellow-100 text-yellow-800"
                            : String(r.status).startsWith("cancelled")
                            ? "bg-red-100 text-red-800"
                            : r.status === "no_show"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {r.status?.replace(/_/g, " ").toUpperCase()}
                      </span>
                      {consentsMap[r._id] && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                          title="Consent Form Signed"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Consent
                        </span>
                      )}
                      {r.payment?.stripe?.lastPaymentError && (
                        <div
                          className="group relative"
                          title={r.payment.stripe.lastPaymentError.message}
                        >
                          <svg
                            className="w-4 h-4 text-red-500 cursor-help"
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
                          <div className="absolute hidden group-hover:block z-10 w-64 p-2 bg-red-50 border border-red-200 rounded shadow-lg text-xs text-red-700 left-0 top-6">
                            <div className="font-semibold mb-1">
                              Payment Failed
                            </div>
                            <div>
                              {r.payment.stripe.lastPaymentError.message}
                            </div>
                            {r.payment.stripe.lastPaymentError.declineCode && (
                              <div className="mt-1 text-red-600">
                                Code:{" "}
                                {r.payment.stripe.lastPaymentError.declineCode}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors group"
                        onClick={() => openEditModal(r)}
                        title="Edit Appointment"
                      >
                        <svg
                          className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      {consentsMap[r._id] && (
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                          onClick={() => viewConsentPDF(consentsMap[r._id]._id)}
                          title="View Consent Form"
                        >
                          <svg
                            className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          PDF
                        </button>
                      )}
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                        disabled={
                          String(r.status || "").startsWith("cancelled") ||
                          r.status === "no_show"
                        }
                        onClick={() => openCancelModal(r._id)}
                        title="Cancel Appointment"
                      >
                        <svg
                          className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
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
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                        disabled={
                          String(r.status || "").startsWith("cancelled") ||
                          r.status === "no_show"
                        }
                        onClick={() => markAsNoShow(r._id)}
                        title="Mark as No Show"
                      >
                        <svg
                          className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                      </button>
                      {String(r.status || "").startsWith("cancelled") && (
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border-2 border-red-200 hover:border-red-300 hover:bg-red-50 rounded-lg transition-colors group"
                          onClick={() => deleteAppointment(r._id)}
                          title="Delete Canceled Appointment"
                        >
                          <svg
                            className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State for Desktop */}
      {!loading && sortedRows.length === 0 && (
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-5">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery ||
              selectedSpecialistId ||
              statusFilter !== "all" ||
              dateFilter !== "all"
                ? "Try adjusting your filters or search criteria to find appointments."
                : "Get started by creating your first appointment."}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && sortedRows.length > 0 && (
        <div className="lg:hidden space-y-3 px-3 sm:px-0">
          {sortedRows.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Compact Header */}
              <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {r.client?.name}
                  </div>
                  {r.client?.email && (
                    <div className="text-xs text-gray-600 truncate">
                      {r.client.email}
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase whitespace-nowrap ${
                    r.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : r.status === "reserved_unpaid"
                      ? "bg-yellow-100 text-yellow-700"
                      : String(r.status).startsWith("cancelled")
                      ? "bg-red-100 text-red-700"
                      : r.status === "no_show"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {r.status?.replace(/_/g, " ")}
                </span>
                {consentsMap[r._id] ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    title="Consent Signed"
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Consent
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                    title="Consent Not Signed"
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Not Signed
                  </span>
                )}
              </div>

              {/* Compact Details */}
              <div className="px-3 py-3.5 space-y-3">
                {/* Staff */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {(r.specialist?.name || r.specialistId || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                      Staff
                    </div>
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {r.specialist?.name || r.specialistId}
                    </div>
                  </div>
                </div>

                {/* Service & Date/Time - Combined Row */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Service */}
                  <div className="flex items-start gap-1.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-gray-600 uppercase tracking-wide font-medium">
                        {r.services && r.services.length > 1
                          ? "Services"
                          : "Service"}
                      </div>
                      {r.services && r.services.length > 0 ? (
                        <div className="space-y-0.5">
                          {r.services.map((svc, idx) => (
                            <div key={idx}>
                              <div className="font-medium text-xs text-gray-900 truncate">
                                {svc.service?.name ||
                                  svc.serviceId ||
                                  "Service"}
                              </div>
                              {idx === 0 && (
                                <div className="text-xs text-gray-700 truncate">
                                  {svc.variantName}
                                </div>
                              )}
                            </div>
                          ))}
                          {r.services.length > 1 && (
                            <div className="text-[11px] text-gray-600">
                              +{r.services.length - 1} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-xs text-gray-900 truncate">
                            {r.service?.name || r.serviceId}
                          </div>
                          {r.variantName && (
                            <div className="text-xs text-gray-700 truncate">
                              {r.variantName}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-start gap-1.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-gray-600 uppercase tracking-wide font-medium">
                        Date
                      </div>
                      <div className="font-medium text-xs text-gray-900 truncate">
                        {new Date(r.start).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <div className="text-xs text-gray-700">
                        {new Date(r.start).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Payment - Compact */}
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                      Price
                    </div>
                    <div className="font-bold text-lg text-gray-900">
                      £{Number(r.price || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Payment Type Badge */}
                  {(() => {
                    const paymentType = r.payment?.type || r.payment?.mode;
                    if (!paymentType) return null;

                    const isDeposit = paymentType === "deposit";
                    const isFullPayment = paymentType === "full_payment";
                    const isPayNow = paymentType === "pay_now";

                    return (
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold uppercase ${
                            isDeposit
                              ? "bg-purple-100 text-purple-700"
                              : isFullPayment || isPayNow
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isDeposit
                            ? "Deposit"
                            : isFullPayment || isPayNow
                            ? "Paid"
                            : "In Salon"}
                        </span>
                        {isDeposit &&
                          r.payment &&
                          (() => {
                            const depositAmount =
                              r.payment.depositAmount ||
                              (r.payment.amountTotal
                                ? (r.payment.amountTotal - 50) / 100
                                : null);
                            return depositAmount ? (
                              <div className="text-xs text-gray-700 mt-0.5">
                                £{depositAmount.toFixed(2)} paid
                              </div>
                            ) : null;
                          })()}
                      </div>
                    );
                  })()}
                </div>

                {/* Payment Error */}
                {r.payment?.stripe?.lastPaymentError && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-100 rounded-md">
                    <svg
                      className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
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
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-red-700 truncate">
                        {r.payment.stripe.lastPaymentError.message}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-3 pb-3 space-y-2">
                {consentsMap[r._id] && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                    onClick={() => viewConsentPDF(consentsMap[r._id]._id)}
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download PDF
                  </button>
                )}
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => openEditModal(r)}
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Appointment
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      String(r.status || "").startsWith("cancelled") ||
                      r.status === "no_show"
                    }
                    onClick={() => openCancelModal(r._id)}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      String(r.status || "").startsWith("cancelled") ||
                      r.status === "no_show"
                    }
                    onClick={() => markAsNoShow(r._id)}
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
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    No Show
                  </button>
                </div>

                {String(r.status || "").startsWith("cancelled") && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors"
                    onClick={() => deleteAppointment(r._id)}
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State for Mobile */}
      {!loading && sortedRows.length === 0 && (
        <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-7 h-7 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No appointments found
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              {searchQuery ||
              selectedSpecialistId ||
              statusFilter !== "all" ||
              dateFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "Get started by creating your first appointment."}
            </p>
            {(isSuperAdmin || admin?.specialistId) && (
              <button
                onClick={openCreateModal}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create First Appointment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && rows.length > 0 && (
        <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6">
          {/* Page info - responsive layout */}
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left mb-3 sm:mb-4">
            Showing{" "}
            <span className="font-semibold">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-semibold">{pagination.total}</span>{" "}
            appointments
          </div>

          {/* Pagination buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1 || loading}
              className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-base font-medium"
            >
              Previous
            </Button>
            <span className="text-sm sm:text-base text-gray-700 font-medium px-4 py-2 bg-gray-50 rounded-lg">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={!pagination.hasMore || loading}
              className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-base font-medium"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CancelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preview={preview}
        reason={reason}
        setReason={setReason}
        onConfirm={confirmCancel}
        submitting={submitting}
      />

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

      <CreateModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setNewAppointment(null);
        }}
        appointment={newAppointment}
        setAppointment={setNewAppointment}
        services={services}
        specialists={specialists}
        onSave={saveNewAppointment}
        submitting={submitting}
        isSuperAdmin={isSuperAdmin}
      />

      <AppointmentConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        tone={confirmDialog.tone}
        submitting={confirmSubmitting}
        onConfirm={handleConfirmAction}
        onClose={closeConfirmDialog}
      />
    </AdminPageShell>
  );
}

function CancelModal({
  open,
  onClose,
  preview,
  reason,
  setReason,
  onConfirm,
  submitting,
}) {
  const refund = (Number(preview?.refundAmount || 0) / 100).toFixed(2);
  const status = String(preview?.status || "").replaceAll("_", " ");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel appointment"
      variant="dashboard"
    >
      {preview ? (
        <>
          <div className="text-sm text-gray-700">
            Outcome: <span className="font-medium capitalize">{status}</span>
          </div>
          <div className="text-sm text-gray-700">
            Refund: <span className="font-medium">£{refund}</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Reason (optional)
            </label>
            <input
              className="border rounded w-full px-3 py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              className="border rounded px-3 py-2"
              onClick={onClose}
              disabled={submitting}
            >
              Close
            </button>
            <button
              className="border rounded px-3 py-2 bg-red-600 text-white disabled:opacity-50"
              onClick={onConfirm}
              disabled={submitting}
            >
              Confirm cancel
            </button>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-600">Loading preview…</div>
      )}
    </Modal>
  );
}

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
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Prevent body scroll when DateTimePicker modal is open
  useEffect(() => {
    if (showTimePicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showTimePicker]);

  const updateField = (field, value) => {
    setAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const selectedService = services.find((s) => s._id === appointment.serviceId);
  const variants = selectedService?.variants || [];

  // Get specialist's working hours for DateTimePicker
  const selectedSpecialist = specialists.find(
    (b) => b._id === appointment.specialistId
  );
  const beauticianWorkingHours = selectedSpecialist?.workingHours || [];
  const customSchedule = selectedSpecialist?.customSchedule || {};

  // Handle slot selection from DateTimePicker
  const handleSlotSelect = (slot) => {
    updateField("start", slot.startISO);
    updateField("end", slot.endISO);
    setShowTimePicker(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Appointment"
      variant="dashboard"
      size="xl"
      fullScreen
    >
      <div className="space-y-6">
        {/* Client Information */}
        <div className="space-y-3 sm:space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Client Information
            </h3>
          </div>
          <FormField label="Name" htmlFor="client-name">
            <input
              type="text"
              id="client-name"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              value={appointment.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
              placeholder="Enter client's full name"
            />
          </FormField>
          <FormField label="Email" htmlFor="client-email">
            <input
              type="email"
              id="client-email"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              value={appointment.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
              placeholder="client@example.com"
            />
          </FormField>
          <FormField label="Phone" htmlFor="client-phone">
            <input
              type="tel"
              id="client-phone"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              value={appointment.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
              placeholder="+44 7700 900000"
            />
          </FormField>
          <FormField label="Notes" htmlFor="client-notes">
            <textarea
              id="client-notes"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              rows="2"
              value={appointment.clientNotes}
              onChange={(e) => updateField("clientNotes", e.target.value)}
              placeholder="Any special requests or notes..."
            />
          </FormField>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 sm:space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Appointment Details
            </h3>
          </div>
          <FormField label="Specialist" htmlFor="specialist-select">
            <SelectButton
              value={appointment.specialistId}
              placeholder="Select Specialist"
              options={specialists.map((b) => ({
                label: b.name,
                value: b._id,
              }))}
              onClick={() => setShowSpecialistDrawer(true)}
            />
            <SelectDrawer
              open={showSpecialistDrawer}
              onClose={() => setShowSpecialistDrawer(false)}
              title="Select Specialist"
              options={specialists.map((b) => ({
                label: b.name,
                value: b._id,
              }))}
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
              <div className="space-y-2 bg-white border border-gray-200 rounded-lg p-3">
                {appointment.services.map((svc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3"
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
                <div className="pt-2 border-t border-gray-200 text-sm font-medium text-gray-900">
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
              <FormField label="Service" htmlFor="service-select">
                <SelectButton
                  value={appointment.serviceId}
                  placeholder="Select Service"
                  options={services.map((s) => ({
                    label: s.name,
                    value: s._id,
                  }))}
                  onClick={() => setShowServiceDrawer(true)}
                />
                <SelectDrawer
                  open={showServiceDrawer}
                  onClose={() => setShowServiceDrawer(false)}
                  title="Select Service"
                  options={services.map((s) => ({
                    label: s.name,
                    value: s._id,
                  }))}
                  value={appointment.serviceId}
                  onChange={(value) => {
                    updateField("serviceId", value);
                    updateField("variantName", "");
                    setShowServiceDrawer(false);
                  }}
                />
              </FormField>
              <FormField label="Variant" htmlFor="variant-select">
                <SelectButton
                  value={appointment.variantName}
                  placeholder="Select Variant"
                  options={variants.map((v) => ({
                    label: `${v.name} - £${v.price} (${v.durationMin}min)`,
                    value: v.name,
                  }))}
                  onClick={() => setShowVariantDrawer(true)}
                  disabled={!appointment.serviceId}
                />
                <SelectDrawer
                  open={showVariantDrawer}
                  onClose={() => setShowVariantDrawer(false)}
                  title="Select Variant"
                  options={variants.map((v) => ({
                    label: `${v.name} - £${v.price} (${v.durationMin}min)`,
                    value: v.name,
                  }))}
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

          {/* Date & Time Selection with DateTimePicker */}
          {appointment.specialistId &&
            appointment.serviceId &&
            appointment.variantName && (
              <div className="space-y-3">
                <FormField label="Select Date & Time" htmlFor="datetime-picker">
                  {appointment.start ? (
                    <div className="space-y-2">
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700">
                          Selected Time:
                        </p>
                        <p className="text-lg font-semibold text-brand-600">
                          {new Date(appointment.start).toLocaleString("en-GB", {
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
                        className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setShowTimePicker(true)}
                      >
                        Change Time
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 text-sm font-medium border-2 border-brand-500 text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                      onClick={() => setShowTimePicker(true)}
                    >
                      Select Available Time Slot
                    </button>
                  )}
                </FormField>

                {/* DateTimePicker Modal */}
                {showTimePicker && (
                  <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                      onClick={() => setShowTimePicker(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden max-h-[90vh] flex flex-col">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                          Select Date & Time
                        </h2>
                        <button
                          onClick={() => setShowTimePicker(false)}
                          className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
                          specialistId={appointment.specialistId}
                          serviceId={appointment.serviceId}
                          variantName={appointment.variantName}
                          salonTz="Europe/London"
                          stepMin={15}
                          beauticianWorkingHours={beauticianWorkingHours}
                          customSchedule={customSchedule}
                          onSelect={handleSlotSelect}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Manual time inputs as fallback */}
          {(!appointment.specialistId ||
            !appointment.serviceId ||
            !appointment.variantName) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Start Time" htmlFor="start-time">
                <input
                  type="datetime-local"
                  id="start-time"
                  className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 transition-all text-gray-900"
                  style={{ fontSize: "16px" }}
                  value={appointment.start}
                  onChange={(e) => updateField("start", e.target.value)}
                />
              </FormField>
              <FormField label="End Time" htmlFor="end-time">
                <input
                  type="datetime-local"
                  id="end-time"
                  className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 transition-all text-gray-900"
                  style={{ fontSize: "16px" }}
                  value={appointment.end}
                  onChange={(e) => updateField("end", e.target.value)}
                />
              </FormField>
            </div>
          )}

          <FormField label="Price (£)" htmlFor="price">
            <input
              type="number"
              id="price"
              step="0.01"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900"
              style={{ fontSize: "16px" }}
              value={appointment.price}
              onChange={(e) => updateField("price", e.target.value)}
            />
          </FormField>

          {/* Payment Type & Details */}
          {appointment.payment && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
              <div className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
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
                        ? "Deposit Paid"
                        : isFullPayment
                        ? "Paid in Full"
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

function CreateModal({
  open,
  onClose,
  appointment,
  setAppointment,
  services,
  specialists,
  onSave,
  submitting,
  isSuperAdmin,
}) {
  if (!appointment) return null;

  const [showTimePicker, setShowTimePicker] = useState(false);

  // Drawer states
  const [showSpecialistDrawer, setShowSpecialistDrawer] = useState(false);
  const [showServiceDrawer, setShowServiceDrawer] = useState(false);
  const [showVariantDrawer, setShowVariantDrawer] = useState(false);
  const [showPaymentStatusDrawer, setShowPaymentStatusDrawer] = useState(false);

  // Prevent body scroll when DateTimePicker modal is open
  useEffect(() => {
    if (showTimePicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showTimePicker]);

  const updateField = (field, value) => {
    setAppointment((prev) => ({ ...prev, [field]: value }));
  };

  // Filter services based on selected specialist
  const selectedSpecialist = specialists.find(
    (b) => b._id === appointment.specialistId
  );
  const availableServices = services.filter((service) => {
    if (!appointment.specialistId) return true; // Show all if no specialist selected

    // Check if specialist is assigned to this service
    const beauticianIds = service.beauticianIds || [];
    const additionalIds = service.additionalBeauticianIds || [];
    const primaryId =
      typeof service.primaryBeauticianId === "object"
        ? service.primaryBeauticianId?._id
        : service.primaryBeauticianId;

    // Check if additionalIds contains populated objects
    const additionalIdsExtracted = additionalIds.map((id) =>
      typeof id === "object" && id?._id ? id._id : id
    );

    const isMatch =
      beauticianIds.includes(appointment.specialistId) ||
      additionalIdsExtracted.includes(appointment.specialistId) ||
      primaryId === appointment.specialistId;

    return isMatch;
  });

  const selectedService = availableServices.find(
    (s) => s._id === appointment.serviceId
  );
  const variants = selectedService?.variants || [];

  // Get specialist's working hours for DateTimePicker
  const beauticianWorkingHours = selectedSpecialist?.workingHours || [];
  const customSchedule = selectedSpecialist?.customSchedule || {};

  // Debug logging
  useEffect(() => {
    if (showTimePicker) {
      // DateTimePicker opened
    }
  }, [showTimePicker]);

  // Handle slot selection from DateTimePicker
  const handleSlotSelect = (slot) => {
    updateField("start", slot.startISO);
    updateField("end", slot.endISO);
    setShowTimePicker(false);
  };

  // Auto-calculate end time when start time and variant are selected
  const handleVariantChange = (variantName) => {
    updateField("variantName", variantName);
    const variant = variants.find((v) => v.name === variantName);
    if (variant) {
      updateField("price", variant.price || 0);
      // Show time picker after variant is selected
      setShowTimePicker(true);
    }
  };

  // Handle specialist change - reset service selection
  const handleSpecialistChange = (specialistId) => {
    updateField("specialistId", specialistId);
    // Reset service and variant if the selected service is not available for new specialist
    if (appointment.serviceId) {
      const service = services.find((s) => s._id === appointment.serviceId);
      if (service) {
        const beauticianIds = service.beauticianIds || [];
        const primaryId =
          typeof service.primaryBeauticianId === "object"
            ? service.primaryBeauticianId?._id
            : service.primaryBeauticianId;

        if (
          !beauticianIds.includes(specialistId) &&
          primaryId !== specialistId
        ) {
          updateField("serviceId", "");
          updateField("variantName", "");
          updateField("price", 0);
        }
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Appointment"
      variant="dashboard"
    >
      <div className="space-y-6">
        {/* Client Information */}
        <div className="space-y-3 sm:space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Client Information
            </h3>
          </div>
          <FormField label="Name *" htmlFor="client-name">
            <input
              type="text"
              id="client-name"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              value={appointment.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
              placeholder="Enter client's full name"
              required
            />
          </FormField>
          <FormField label="Email *" htmlFor="client-email">
            <input
              type="email"
              id="client-email"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              value={appointment.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
              placeholder="client@example.com"
              required
            />
          </FormField>
          <FormField label="Phone" htmlFor="client-phone">
            <input
              type="tel"
              id="client-phone"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              value={appointment.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
              placeholder="+44 7700 900000"
            />
          </FormField>
          <FormField label="Notes" htmlFor="client-notes">
            <textarea
              id="client-notes"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400"
              style={{ fontSize: "16px" }}
              rows="2"
              value={appointment.clientNotes}
              onChange={(e) => updateField("clientNotes", e.target.value)}
              placeholder="Any special requests or notes..."
            />
          </FormField>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 sm:space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Appointment Details
            </h3>
          </div>
          <FormField label="Specialist *" htmlFor="specialist-select-create">
            <SelectButton
              value={appointment.specialistId}
              placeholder="Select Specialist"
              options={specialists.map((b) => ({
                value: b._id,
                label: b.name,
              }))}
              onClick={() => isSuperAdmin && setShowSpecialistDrawer(true)}
              disabled={!isSuperAdmin}
            />
            {!isSuperAdmin && appointment.specialistId && (
              <p className="text-xs text-gray-600 mt-1">
                Pre-selected for your specialist account
              </p>
            )}
          </FormField>
          <FormField label="Service *" htmlFor="service-select-create">
            <SelectButton
              value={appointment.serviceId}
              placeholder={
                !appointment.specialistId
                  ? "Select specialist first"
                  : "Select Service"
              }
              options={availableServices.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
              onClick={() =>
                appointment.specialistId && setShowServiceDrawer(true)
              }
              disabled={!appointment.specialistId}
            />
            {appointment.specialistId && availableServices.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No services available for this specialist
              </p>
            )}
          </FormField>
          <FormField label="Variant *" htmlFor="variant-select-create">
            <SelectButton
              value={appointment.variantName}
              placeholder="Select Variant"
              options={variants.map((v) => ({
                value: v.name,
                label: `${v.name} - £${v.price} (${v.durationMin}min)`,
              }))}
              onClick={() =>
                appointment.serviceId && setShowVariantDrawer(true)
              }
              disabled={!appointment.serviceId}
            />
          </FormField>

          {/* Date & Time Selection with DateTimePicker */}
          {appointment.specialistId &&
            appointment.serviceId &&
            appointment.variantName && (
              <div className="space-y-3">
                <FormField
                  label="Select Date & Time *"
                  htmlFor="datetime-picker"
                >
                  {appointment.start ? (
                    <div className="space-y-2">
                      <div className="border rounded p-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-900">
                          Selected Time:
                        </p>
                        <p className="text-lg font-semibold text-brand-600">
                          {new Date(appointment.start).toLocaleString("en-GB", {
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
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        onClick={() => setShowTimePicker(true)}
                      >
                        Change Time
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-brand-500 text-brand-600 rounded hover:bg-brand-50"
                      onClick={() => setShowTimePicker(true)}
                    >
                      Select Available Time Slot
                    </button>
                  )}
                </FormField>

                {/* DateTimePicker Modal */}
                {showTimePicker && (
                  <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                      onClick={() => setShowTimePicker(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden max-h-[90vh] flex flex-col">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                          Select Date & Time
                        </h2>
                        <button
                          onClick={() => setShowTimePicker(false)}
                          className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
                          specialistId={appointment.specialistId}
                          serviceId={appointment.serviceId}
                          variantName={appointment.variantName}
                          salonTz="Europe/London"
                          stepMin={15}
                          beauticianWorkingHours={beauticianWorkingHours}
                          customSchedule={customSchedule}
                          onSelect={handleSlotSelect}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          <FormField label="Payment Status *" htmlFor="payment-status-create">
            <SelectButton
              value={appointment.paymentStatus}
              placeholder="Select Payment Status"
              options={[
                { value: "paid", label: "Paid (Cash/Card in Person)" },
                {
                  value: "unpaid",
                  label: "Unpaid (Online Payment Required)",
                },
              ]}
              onClick={() => setShowPaymentStatusDrawer(true)}
            />
          </FormField>

          {/* Deposit Amount - Only show when deposit is selected */}
          {appointment.paymentStatus === "deposit" && (
            <FormField
              label="Deposit Amount (%)"
              htmlFor="deposit-amount-create"
            >
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  id="deposit-amount-create"
                  min="0"
                  max="100"
                  step="5"
                  className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900"
                  style={{ fontSize: "16px", width: "100px" }}
                  value={appointment.depositAmount}
                  onChange={(e) =>
                    updateField("depositAmount", Number(e.target.value))
                  }
                />
                <span className="text-gray-600 font-medium">%</span>
                {appointment.price > 0 && (
                  <span className="text-sm text-gray-600">
                    = £
                    {(
                      (appointment.price * appointment.depositAmount) /
                      100
                    ).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Customer will pay this percentage as a deposit. Remaining
                balance due at salon.
              </p>
            </FormField>
          )}

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
                        ? "Deposit Paid"
                        : isFullPayment
                        ? "Paid in Full"
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
        <button
          onClick={onClose}
          disabled={submitting}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={submitting}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Create Appointment
            </>
          )}
        </button>
      </div>

      {/* Select Drawers */}
      <SelectDrawer
        open={showSpecialistDrawer}
        onClose={() => setShowSpecialistDrawer(false)}
        title="Select Specialist"
        options={specialists.map((b) => ({ value: b._id, label: b.name }))}
        value={appointment.specialistId}
        onChange={handleSpecialistChange}
        placeholder="Select Specialist"
        emptyMessage="No specialists available"
      />

      <SelectDrawer
        open={showServiceDrawer}
        onClose={() => setShowServiceDrawer(false)}
        title="Select Service"
        options={availableServices.map((s) => ({
          value: s._id,
          label: s.name,
        }))}
        value={appointment.serviceId}
        onChange={(val) => {
          updateField("serviceId", val);
          updateField("variantName", "");
          updateField("price", 0);
        }}
        placeholder="Select Service"
        emptyMessage="No services available for this specialist"
      />

      <SelectDrawer
        open={showVariantDrawer}
        onClose={() => setShowVariantDrawer(false)}
        title="Select Variant"
        options={variants.map((v) => ({
          value: v.name,
          label: `${v.name} - £${v.price} (${v.durationMin}min)`,
        }))}
        value={appointment.variantName}
        onChange={handleVariantChange}
        placeholder="Select Variant"
        emptyMessage="No variants available"
      />

      <SelectDrawer
        open={showPaymentStatusDrawer}
        onClose={() => setShowPaymentStatusDrawer(false)}
        title="Select Payment Status"
        options={[
          { value: "paid", label: "Paid (Cash/Card in Person)" },
          { value: "unpaid", label: "Unpaid (Online Payment Required)" },
          { value: "deposit", label: "Deposit (Partial Payment)" },
        ]}
        value={appointment.paymentStatus}
        onChange={(val) => updateField("paymentStatus", val)}
        placeholder="Select Payment Status"
      />
    </Modal>
  );
}

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <th
      className="text-left p-2 cursor-pointer hover:bg-gray-100 select-none transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className={isActive ? "text-gray-900" : "text-gray-500"}>
          {isActive ? (
            direction === "asc" ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          )}
        </span>
      </div>
    </th>
  );
}
