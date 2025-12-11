import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectAdmin } from "../../shared/state/authSlice";
import { api } from "../../shared/lib/apiClient";
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
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";

export default function Appointments() {
  const { language } = useLanguage();
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [preview, setPreview] = useState(null);
  const [reason, setReason] = useState("Admin initiated");
  const [submitting, setSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "start",
    direction: "desc",
  });

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);

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
  const [dateFilter, setDateFilter] = useState("all"); // all, day, week, month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments?page=${page}&limit=50`);

      let appointments = [];
      let paginationData = pagination;

      if (response.data.data) {
        // Paginated response
        appointments = response.data.data || [];
        paginationData = response.data.pagination || pagination;
      } else {
        // Legacy response (array)
        appointments = response.data || [];
      }

      // Filter appointments based on admin role and linked specialist
      if (isSuperAdmin) {
        // Super admin sees all appointments
        console.log(
          "[Appointments] Super admin - showing all appointments:",
          appointments.length
        );
      } else if (admin?.specialistId) {
        // Regular admin with linked specialist - only show their specialist's appointments
        const originalCount = appointments.length;
        appointments = appointments.filter(
          (apt) => apt.specialistId?._id === admin.specialistId
        );
        console.log(
          `[Appointments] Regular admin with specialist ${admin.specialistId} - filtered from ${originalCount} to ${appointments.length} appointments`
        );

        // Recalculate pagination for filtered results
        const filteredTotal = appointments.length;
        paginationData = {
          page: 1,
          limit: 50,
          total: filteredTotal,
          totalPages: Math.ceil(filteredTotal / 50),
          hasMore: false,
        };
      } else {
        // Regular admin without linked specialist - show no appointments
        console.log(
          "[Appointments] Regular admin without linked specialist - showing no appointments"
        );
        appointments = [];
        paginationData = {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasMore: false,
        };
      }

      setRows(appointments);
      setPagination(paginationData);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(pagination.page);

    // Load services and specialists for edit modal
    api
      .get("/services", { params: { limit: 1000 } })
      .then((r) => setServices(r.data || []))
      .catch(() => {});
    api
      .get("/specialists", { params: { limit: 1000 } })
      .then((r) => setSpecialists(r.data || []))
      .catch(() => {});
  }, []);

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

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let start, end;

    switch (dateFilter) {
      case "day":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "week":
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + diff
        );
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
        }
        break;
      default:
        return null;
    }

    return start && end ? { start, end } : null;
  };

  // Memoize filtered and sorted appointments to prevent unnecessary recalculations
  const sortedRows = useMemo(() => {
    let filteredRows = rows;

    // Apply specialist filter
    if (selectedSpecialistId) {
      filteredRows = filteredRows.filter((r) => {
        const specialistId =
          typeof r.specialistId === "object" && r.specialistId?._id
            ? r.specialistId._id
            : r.specialistId;
        return String(specialistId) === String(selectedSpecialistId);
      });
    }

    // Apply date filter
    const dateRange = getDateRange();
    if (dateRange) {
      filteredRows = filteredRows.filter((r) => {
        const appointmentDate = new Date(r.start);
        return (
          appointmentDate >= dateRange.start && appointmentDate < dateRange.end
        );
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredRows = filteredRows.filter((r) => {
        return (
          r.client?.name?.toLowerCase().includes(query) ||
          r.client?.email?.toLowerCase().includes(query) ||
          r.client?.phone?.toLowerCase().includes(query) ||
          r.specialist?.name?.toLowerCase().includes(query) ||
          r.service?.name?.toLowerCase().includes(query) ||
          r.variantName?.toLowerCase().includes(query)
        );
      });
    }

    // Sort filtered results
    return [...filteredRows].sort((a, b) => {
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
          aVal = `${a.service?.name || a.serviceId} - ${a.variantName}`;
          bVal = `${b.service?.name || b.serviceId} - ${b.variantName}`;
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
  }, [
    rows,
    selectedSpecialistId,
    dateFilter,
    customStartDate,
    customEndDate,
    searchQuery,
    sortConfig.key,
    sortConfig.direction,
  ]);

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
      setRows((old) =>
        old.map((x) =>
          x._id === activeId
            ? {
                ...x,
                status: res.status,
                cancelledAt: new Date().toISOString(),
              }
            : x
        )
      );
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

  async function deleteAppointment(id) {
    if (
      !window.confirm(
        "Delete this canceled appointment? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/appointments/${id}`);
      setRows((old) => old.filter((x) => x._id !== id));
      toast.success("Appointment deleted successfully");
    } catch (e) {
      toast.error(e.message || "Failed to delete appointment");
    }
  }

  async function handleDeleteAll() {
    if (!admin?.specialistId) {
      toast.error("No specialist linked to this account");
      return;
    }

    toast(
      (t) => (
        <span className="flex items-center gap-3">
          <span>Delete ALL your appointments? This cannot be undone!</span>
          <button
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await api.delete(
                  `/appointments/specialist/${admin.specialistId}`
                );

                // Remove all appointments for this specialist from the state
                setRows((old) =>
                  old.filter((apt) => {
                    const specialistId =
                      typeof apt.specialistId === "object" &&
                      apt.specialistId?._id
                        ? apt.specialistId._id
                        : apt.specialistId;
                    return String(specialistId) !== String(admin.specialistId);
                  })
                );

                toast.success(
                  res.data.message ||
                    `Deleted ${res.data.deletedCount} appointment(s)`
                );
              } catch (e) {
                toast.error(
                  e.response?.data?.error ||
                    e.message ||
                    "Failed to delete appointments"
                );
              }
            }}
          >
            Yes, Delete All
          </button>
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </span>
      ),
      { duration: 10000 }
    );
  }

  async function markAsNoShow(id) {
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          <span>Mark this appointment as No Show?</span>
          <button
            className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await api
                  .patch(`/appointments/${id}/status`, {
                    status: "no_show",
                  })
                  .then((r) => r.data);

                setRows((old) =>
                  old.map((x) =>
                    x._id === id ? { ...x, status: res.status } : x
                  )
                );
                toast.success("Marked as No Show");
              } catch (e) {
                toast.error(e.message || "Failed to update status");
              }
            }}
          >
            Yes, Mark No Show
          </button>
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </span>
      ),
      { duration: 8000 }
    );
  }

  function openEditModal(appointment) {
    setEditingAppointment({
      _id: appointment._id,
      clientName: appointment.client?.name || "",
      clientEmail: appointment.client?.email || "",
      clientPhone: appointment.client?.phone || "",
      clientNotes: appointment.client?.notes || "",
      specialistId: appointment.specialistId || "", // Map specialistId from API to specialistId for UI
      serviceId: appointment.serviceId || "",
      variantName: appointment.variantName || "",
      start: appointment.start
        ? new Date(appointment.start).toISOString().slice(0, 16)
        : "",
      end: appointment.end
        ? new Date(appointment.end).toISOString().slice(0, 16)
        : "",
      price: appointment.price || 0,
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
        setRows((old) =>
          old.map((x) =>
            x._id === editingAppointment._id ? res.appointment : x
          )
        );
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
      });

      if (response.data.ok) {
        // Refresh appointments list
        await fetchAppointments(pagination.page);
        setCreateModalOpen(false);
        toast.success("Appointment created successfully");
      }
    } catch (e) {
      toast.error(
        e.response?.data?.error || e.message || "Failed to create appointment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <SlowRequestWarning isLoading={loading} threshold={2000} />

      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {t("appointments", language)}
          </h1>
        </div>

        {/* Show subtitle for different admin types */}
        {isSuperAdmin ? (
          <p className="text-sm sm:text-base text-gray-600 ml-[52px]">
            View and manage all appointments from all specialists
          </p>
        ) : admin?.specialistId ? (
          <p className="text-sm sm:text-base text-gray-600 ml-[52px]">
            {t("viewAppointmentsLinkedBeauticianOnly", language)}
          </p>
        ) : null}
      </div>

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

      {/* Action Buttons - only show if admin has access */}
      {(isSuperAdmin || admin?.specialistId) && (
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm group"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
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
            <span>Create Appointment</span>
          </button>
          {admin?.specialistId && (
            <button
              onClick={() => handleDeleteAll()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm group"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110 duration-200"
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
              <span>Delete All My Appointments</span>
            </button>
          )}
        </div>
      )}

      {/* Filters - only show if admin has access */}
      {(isSuperAdmin || admin?.specialistId) && (
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-md p-4 sm:p-5 mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, service..."
              className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Specialist Filter */}
            <div className="space-y-2">
              <label
                htmlFor="specialist-filter"
                className="block text-sm font-semibold text-gray-700"
              >
                Filter by Specialist
              </label>
              <div className="relative">
                <select
                  id="specialist-filter"
                  className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer hover:border-gray-300"
                  value={selectedSpecialistId}
                  onChange={(e) => setSelectedSpecialistId(e.target.value)}
                >
                  <option value="">
                    {t("allBeauticians", language) || "All Specialists"}
                  </option>
                  {specialists.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label
                htmlFor="date-filter"
                className="block text-sm font-semibold text-gray-700"
              >
                Date Range
              </label>
              <div className="relative">
                <select
                  id="date-filter"
                  className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer hover:border-gray-300"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="day">{t("today", language) || "Today"}</option>
                  <option value="week">
                    {t("thisWeek", language) || "This Week"}
                  </option>
                  <option value="month">
                    {t("thisMonth", language) || "This Month"}
                  </option>
                  <option value="custom">
                    {t("customRange", language) || "Custom Range"}
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

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
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile Cards Skeleton */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4"
              >
                {/* Header skeleton */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <SkeletonBox className="w-32 sm:w-40 h-5 sm:h-6" />
                    <SkeletonBox className="w-24 sm:w-32 h-4" />
                  </div>
                  <SkeletonBox className="w-16 sm:w-20 h-6 sm:h-7 rounded-lg" />
                </div>

                {/* Details skeleton */}
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start gap-3">
                      <SkeletonBox className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <SkeletonBox className="w-12 h-3" />
                        <SkeletonBox className="w-full h-4" />
                        <SkeletonBox className="w-3/4 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buttons skeleton */}
                <div className="pt-4 border-t border-gray-100 space-y-2.5">
                  <SkeletonBox className="w-full h-11 sm:h-12 rounded-xl" />
                  <div className="grid grid-cols-2 gap-2.5">
                    <SkeletonBox className="h-11 sm:h-12 rounded-xl" />
                    <SkeletonBox className="h-11 sm:h-12 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Skeleton */}
          <div className="hidden lg:block bg-white rounded-lg border border-gray-200">
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
        <div className="hidden lg:block overflow-auto rounded-xl bg-white shadow-sm border border-gray-200">
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
                      <div className="text-xs text-gray-500">
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
                    <div className="font-medium text-gray-900">
                      {r.service?.name || r.serviceId}
                    </div>
                    <div className="text-xs text-gray-500">{r.variantName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-900">
                      {new Date(r.start).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
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
                        <span className="text-xs text-gray-400 italic">
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
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 mb-6">
              <svg
                className="w-10 h-10 text-brand-500"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || selectedSpecialistId || dateFilter !== "all"
                ? "Try adjusting your filters or search criteria to find appointments."
                : "Get started by creating your first appointment."}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && sortedRows.length > 0 && (
        <div className="lg:hidden space-y-4">
          {sortedRows.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 px-4 py-3 border-b border-brand-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-gray-900 truncate">
                      {r.client?.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5 truncate">
                      {r.client?.email}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap ml-2 ${
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
                    {r.status?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="px-4 py-4 space-y-4">
                {/* Staff */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-base shadow-sm">
                    {(r.specialist?.name || r.specialistId || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Staff</div>
                    <div className="font-medium text-sm text-gray-900">
                      {r.specialist?.name || r.specialistId}
                    </div>
                  </div>
                </div>

                {/* Service */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-brand-600"
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
                    <div className="text-xs text-gray-500">Service</div>
                    <div className="font-semibold text-base text-gray-900">
                      {r.service?.name || r.serviceId}
                    </div>
                    {r.variantName && (
                      <div className="text-sm text-gray-600 mt-0.5">
                        {r.variantName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Date & Time</div>
                    <div className="font-medium text-base text-gray-900">
                      {new Date(r.start).toLocaleString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(r.start).toLocaleString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Price & Payment */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-green-700 font-medium">
                        Total Price
                      </div>
                      <div className="font-bold text-2xl text-green-700 mt-0.5">
                        £{Number(r.price || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Payment Details */}
                  {(() => {
                    const paymentType = r.payment?.type || r.payment?.mode;
                    if (!paymentType) return null;

                    const isDeposit = paymentType === "deposit";
                    const isFullPayment = paymentType === "full_payment";
                    const isPayNow = paymentType === "pay_now";
                    const isPayInSalon = paymentType === "pay_in_salon";

                    return (
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                              isDeposit
                                ? "bg-purple-100 text-purple-800"
                                : isFullPayment || isPayNow
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isDeposit ? (
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
                            ) : isFullPayment || isPayNow ? (
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
                                Full Payment
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
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                Pay in Salon
                              </>
                            )}
                          </span>
                        </div>
                        {isDeposit && r.payment && (
                          <div className="mt-2 space-y-1">
                            {(() => {
                              const depositAmount =
                                r.payment.depositAmount ||
                                (r.payment.amountTotal
                                  ? (r.payment.amountTotal - 50) / 100
                                  : null);
                              const totalPrice = Number(r.price || 0);
                              const balance = depositAmount
                                ? totalPrice - depositAmount
                                : null;

                              return (
                                <>
                                  {depositAmount && (
                                    <div className="text-xs text-green-800">
                                      <span className="font-medium">
                                        Deposit Paid:
                                      </span>{" "}
                                      £{depositAmount.toFixed(2)}
                                    </div>
                                  )}
                                  {balance && balance > 0 && (
                                    <div className="text-xs text-green-800">
                                      <span className="font-medium">
                                        Balance Due:
                                      </span>{" "}
                                      £{balance.toFixed(2)}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Payment Error Details */}
                {r.payment?.stripe?.lastPaymentError && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
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
                    <div className="flex-1">
                      <div className="text-xs text-red-500 font-medium mb-0.5">
                        Payment Failed
                      </div>
                      <div className="text-xs sm:text-sm text-red-700 font-medium">
                        {r.payment.stripe.lastPaymentError.message}
                      </div>
                      {r.payment.stripe.lastPaymentError.declineCode && (
                        <div className="text-xs text-red-600 mt-1">
                          Code: {r.payment.stripe.lastPaymentError.declineCode}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 space-y-2.5">
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-all active:scale-[0.98] group"
                  onClick={() => openEditModal(r)}
                >
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] group"
                    disabled={
                      String(r.status || "").startsWith("cancelled") ||
                      r.status === "no_show"
                    }
                    onClick={() => openCancelModal(r._id)}
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] group"
                    disabled={
                      String(r.status || "").startsWith("cancelled") ||
                      r.status === "no_show"
                    }
                    onClick={() => markAsNoShow(r._id)}
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-700 bg-white border-2 border-red-200 hover:border-red-300 hover:bg-red-50 rounded-xl transition-all active:scale-[0.98] group"
                    onClick={() => deleteAppointment(r._id)}
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
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
            </div>
          ))}
        </div>
      )}

      {/* Empty State for Mobile */}
      {!loading && sortedRows.length === 0 && (
        <div className="lg:hidden bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 mb-4">
              <svg
                className="w-8 h-8 text-brand-500"
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
            <p className="text-sm text-gray-600 mb-6">
              {searchQuery || selectedSpecialistId || dateFilter !== "all"
                ? "Try adjusting your filters or search criteria."
                : "Get started by creating your first appointment."}
            </p>
            {(isSuperAdmin || admin?.specialistId) && (
              <button
                onClick={openCreateModal}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
              onClick={() => fetchAppointments(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-base font-medium"
            >
              ← Previous
            </Button>
            <span className="text-sm sm:text-base text-gray-700 font-medium px-4 py-2 bg-gray-50 rounded-lg">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAppointments(pagination.page + 1)}
              disabled={!pagination.hasMore || loading}
              className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-base font-medium"
            >
              Next →
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
    </div>
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
          <FormField label="Name" htmlFor="client-name">
            <input
              type="text"
              id="client-name"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
            />
          </FormField>
          <FormField label="Email" htmlFor="client-email">
            <input
              type="email"
              id="client-email"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
            />
          </FormField>
          <FormField label="Phone" htmlFor="client-phone">
            <input
              type="tel"
              id="client-phone"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
            />
          </FormField>
          <FormField label="Notes" htmlFor="client-notes">
            <textarea
              id="client-notes"
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
          <FormField label="Specialist" htmlFor="specialist-select">
            <select
              id="specialist-select"
              className="border rounded w-full px-3 py-2"
              value={appointment.specialistId}
              onChange={(e) => updateField("specialistId", e.target.value)}
            >
              <option value="">Select Specialist</option>
              {specialists.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Service" htmlFor="service-select">
            <select
              id="service-select"
              className="border rounded w-full px-3 py-2"
              value={appointment.serviceId}
              onChange={(e) => {
                updateField("serviceId", e.target.value);
                updateField("variantName", "");
              }}
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Variant" htmlFor="variant-select">
            <select
              id="variant-select"
              className="border rounded w-full px-3 py-2"
              value={appointment.variantName}
              onChange={(e) => updateField("variantName", e.target.value)}
              disabled={!appointment.serviceId}
            >
              <option value="">Select Variant</option>
              {variants.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} - £{v.price} ({v.durationMin}min)
                </option>
              ))}
            </select>
          </FormField>
          <div className="w-full max-w-full overflow-hidden">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full"
              style={{ minWidth: 0 }}
            >
              <FormField label="Start Time" htmlFor="start-time">
                <input
                  type="datetime-local"
                  id="start-time"
                  className="appearance-none box-border w-full max-w-full border rounded px-2 py-1.5 text-[16px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-hidden"
                  style={{ minWidth: 0, maxWidth: "100%" }}
                  value={appointment.start}
                  onChange={(e) => updateField("start", e.target.value)}
                />
              </FormField>
              <FormField label="End Time" htmlFor="end-time">
                <input
                  type="datetime-local"
                  id="end-time"
                  className="appearance-none box-border w-full max-w-full border rounded px-2 py-1.5 text-[16px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500 overflow-hidden"
                  style={{ minWidth: 0, maxWidth: "100%" }}
                  value={appointment.end}
                  onChange={(e) => updateField("end", e.target.value)}
                />
              </FormField>
            </div>
          </div>
          <FormField label="Price (£)" htmlFor="price">
            <input
              type="number"
              id="price"
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
                    {appointment.payment.stripe?.paymentIntentId && (
                      <div className="text-xs text-gray-600 mt-2">
                        Payment ID: {appointment.payment.stripe.paymentIntentId}
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
      console.log("[CreateModal] DateTimePicker opened with:", {
        specialistId: appointment.specialistId,
        beauticianName: selectedSpecialist?.name,
        serviceId: appointment.serviceId,
        serviceName: selectedService?.name,
        variantName: appointment.variantName,
        workingHours: beauticianWorkingHours,
        customSchedule: customSchedule,
        selectedSpecialist: selectedSpecialist,
      });
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
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
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
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
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
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
              value={appointment.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
              placeholder="+44 7700 900000"
            />
          </FormField>
          <FormField label="Notes" htmlFor="client-notes">
            <textarea
              id="client-notes"
              className="border-2 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-lg w-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base"
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
              <p className="text-xs text-gray-500 mt-1">
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
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                { value: "paid", label: "💵 Paid (Cash/Card in Person)" },
                {
                  value: "unpaid",
                  label: "🔄 Unpaid (Online Payment Required)",
                },
              ]}
              onClick={() => setShowPaymentStatusDrawer(true)}
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
                    {appointment.payment.stripe?.paymentIntentId && (
                      <div className="text-xs text-gray-600 mt-2">
                        Payment ID: {appointment.payment.stripe.paymentIntentId}
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
          { value: "paid", label: "💵 Paid (Cash/Card in Person)" },
          { value: "unpaid", label: "🔄 Unpaid (Online Payment Required)" },
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
