import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectAdmin } from "../../shared/state/authSlice";
import { api } from "../../shared/lib/apiClient";
import Modal from "../../shared/components/ui/Modal";
import FormField from "../../shared/components/forms/FormField";
import Button from "../../shared/components/ui/Button";
import { SkeletonBox, TableRowSkeleton } from "../../shared/components/ui/Skeleton";
import { SlowRequestWarning } from "../../shared/components/ui/SlowRequestWarning";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";
import DateTimePicker from "../../shared/components/DateTimePicker";

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
  const [beauticians, setBeauticians] = useState([]);

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientNotes: "",
    beauticianId: "",
    serviceId: "",
    variantName: "",
    start: "",
    end: "",
    price: 0,
    paymentStatus: "paid",
  });

  // Filter state
  const [selectedBeauticianId, setSelectedBeauticianId] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, day, week, month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

      // Filter appointments based on admin role and linked beautician
      if (isSuperAdmin) {
        // Super admin sees all appointments
        console.log(
          "[Appointments] Super admin - showing all appointments:",
          appointments.length
        );
      } else if (admin?.beauticianId) {
        // Regular admin with linked beautician - only show their beautician's appointments
        const originalCount = appointments.length;
        appointments = appointments.filter(
          (apt) => apt.beauticianId?._id === admin.beauticianId
        );
        console.log(
          `[Appointments] Regular admin with beautician ${admin.beauticianId} - filtered from ${originalCount} to ${appointments.length} appointments`
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
        // Regular admin without linked beautician - show no appointments
        console.log(
          "[Appointments] Regular admin without linked beautician - showing no appointments"
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

    // Load services and beauticians for edit modal
    api
      .get("/services", { params: { limit: 1000 } })
      .then((r) => setServices(r.data || []))
      .catch(() => {});
    api
      .get("/beauticians", { params: { limit: 1000 } })
      .then((r) => setBeauticians(r.data || []))
      .catch(() => {});
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

    // Apply beautician filter
    if (selectedBeauticianId) {
      filteredRows = filteredRows.filter((r) => {
        const beauticianId =
          typeof r.beauticianId === "object" && r.beauticianId?._id
            ? r.beauticianId._id
            : r.beauticianId;
        return String(beauticianId) === String(selectedBeauticianId);
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
          r.beautician?.name?.toLowerCase().includes(query) ||
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
          aVal = a.beautician?.name || a.beauticianId || "";
          bVal = b.beautician?.name || b.beauticianId || "";
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
    selectedBeauticianId,
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
    if (!admin?.beauticianId) {
      toast.error("No beautician linked to this account");
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
                  `/appointments/beautician/${admin.beauticianId}`
                );

                // Remove all appointments for this beautician from the state
                setRows((old) =>
                  old.filter((apt) => {
                    const beauticianId =
                      typeof apt.beauticianId === "object" &&
                      apt.beauticianId?._id
                        ? apt.beauticianId._id
                        : apt.beauticianId;
                    return String(beauticianId) !== String(admin.beauticianId);
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
      beauticianId: appointment.beauticianId || "",
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
          beauticianId: editingAppointment.beauticianId,
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
      beauticianId: isSuperAdmin ? "" : admin?.beauticianId || "",
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
      !newAppointment.beauticianId ||
      !newAppointment.serviceId ||
      !newAppointment.variantName
    ) {
      toast.error("Beautician, service, and variant are required");
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
        beauticianId: newAppointment.beauticianId,
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
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {t("appointments", language)}
        </h1>

        {/* Show subtitle for different admin types */}
        {isSuperAdmin ? (
          <p className="text-sm sm:text-base text-gray-600">
            {t("viewManageAllAppointmentsFromAllBeauticians", language)}
          </p>
        ) : admin?.beauticianId ? (
          <p className="text-sm sm:text-base text-gray-600">
            {t("viewAppointmentsLinkedBeauticianOnly", language)}
          </p>
        ) : null}
      </div>

      {/* Show warning for regular admins without linked beautician */}
      {!isSuperAdmin && !admin?.beauticianId && (
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

      {/* Create Appointment Button - only show if admin has access */}
      {(isSuperAdmin || admin?.beauticianId) && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="brand"
            onClick={openCreateModal}
            className="w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-2"
          >
            + Create Appointment
          </Button>
          {admin?.beauticianId && (
            <Button
              variant="danger"
              onClick={() => handleDeleteAll()}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base py-2.5 sm:py-2"
            >
              Delete All My Appointments
            </Button>
          )}
        </div>
      )}

      {/* Filters - only show if admin has access */}
      {(isSuperAdmin || admin?.beauticianId) && (
        <div className="bg-white border rounded-xl shadow-sm p-3 sm:p-4 mb-4 space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Beautician Filter */}
            <FormField
              label={t("filterByBeautician", language) || "Beautician"}
              htmlFor="beautician-filter"
              className="flex-1"
            >
              <select
                id="beautician-filter"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                value={selectedBeauticianId}
                onChange={(e) => setSelectedBeauticianId(e.target.value)}
              >
                <option value="">
                  {t("allBeauticians", language) || "All Beauticians"}
                </option>
                {beauticians.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Date Filter */}
            <FormField
              label={t("dateRange", language) || "Date Range"}
              htmlFor="date-filter"
              className="flex-1"
            >
              <select
                id="date-filter"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">
                  {t("allTime", language) || "All Time"}
                </option>
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
            </FormField>
          </div>

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 border-t">
              <FormField
                label={t("startDate", language) || "Start Date"}
                htmlFor="start-date"
                className="flex-1"
              >
                <input
                  id="start-date"
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </FormField>
              <FormField
                label={t("endDate", language) || "End Date"}
                htmlFor="end-date"
                className="flex-1"
              >
                <input
                  id="end-date"
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
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
                      "Beautician",
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
      {!loading && (
        <div className="hidden lg:block overflow-auto border rounded-lg bg-white shadow-sm">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50">
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
                  label="Start"
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
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.client?.name}</td>
                  <td className="p-3">
                    {r.beautician?.name || r.beauticianId}
                  </td>
                  <td className="p-3">
                    {r.service?.name || r.serviceId} - {r.variantName}
                  </td>
                  <td className="p-3">
                    {new Date(r.start).toLocaleString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 font-semibold text-green-700">
                    £{Number(r.price || 0).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          r.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : r.status === "reserved_unpaid"
                            ? "bg-yellow-100 text-yellow-800"
                            : String(r.status).startsWith("cancelled")
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {r.status}
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
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="border rounded px-3 py-1.5 text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => openEditModal(r)}
                        title="Edit Appointment"
                      >
                        Edit
                      </button>
                      <button
                        className="border rounded px-3 py-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                        disabled={
                          String(r.status || "").startsWith("cancelled") ||
                          r.status === "no_show"
                        }
                        onClick={() => openCancelModal(r._id)}
                      >
                        Cancel
                      </button>
                      <button
                        className="border rounded px-3 py-1.5 text-sm text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        disabled={
                          String(r.status || "").startsWith("cancelled") ||
                          r.status === "no_show"
                        }
                        onClick={() => markAsNoShow(r._id)}
                        title="Mark as No Show"
                      >
                        No Show
                      </button>
                      {String(r.status || "").startsWith("cancelled") && (
                        <button
                          className="border rounded px-3 py-1.5 text-sm text-red-700 border-red-300 hover:bg-red-50"
                          onClick={() => deleteAppointment(r._id)}
                          title="Delete Canceled Appointment"
                        >
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

      {/* Mobile Card View */}
      {!loading && (
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {sortedRows.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              {/* Header with name and status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                    {r.client?.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                    {r.beautician?.name || r.beauticianId}
                  </div>
                </div>
                <span
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 ${
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
              </div>

              {/* Appointment Details */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600"
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
                    <div className="text-xs text-gray-500 mb-0.5">Service</div>
                    <div className="font-medium text-sm sm:text-base text-gray-900">
                      {r.service?.name || r.serviceId}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {r.variantName}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6]"
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
                    <div className="text-xs text-gray-500 mb-0.5">
                      Date & Time
                    </div>
                    <div className="font-medium text-sm sm:text-base text-gray-900">
                      {new Date(r.start).toLocaleString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {new Date(r.start).toLocaleString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
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
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">Price</div>
                    <div className="font-semibold text-base sm:text-lg text-green-700">
                      £{Number(r.price || 0).toFixed(2)}
                    </div>
                  </div>
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
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                <button
                  className="w-full border-2 rounded-xl px-4 py-3 text-sm sm:text-base text-brand-600 border-brand-200 hover:bg-brand-50 font-medium transition-colors active:scale-[0.98]"
                  onClick={() => openEditModal(r)}
                >
                  ✏️ Edit Appointment
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    className="border-2 rounded-xl px-4 py-3 text-sm sm:text-base text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors active:scale-[0.98]"
                    disabled={
                      String(r.status || "").startsWith("cancelled") ||
                      r.status === "no_show"
                    }
                    onClick={() => openCancelModal(r._id)}
                  >
                    ❌ Cancel
                  </button>
                  <button
                    className="border-2 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors active:scale-[0.98]"
                    disabled={
                      String(r.status || "").startsWith("cancelled") ||
                      r.status === "no_show"
                    }
                    onClick={() => markAsNoShow(r._id)}
                  >
                    👤 No Show
                  </button>
                </div>
                {String(r.status || "").startsWith("cancelled") && (
                  <button
                    className="w-full border-2 rounded-xl px-4 py-3 text-sm sm:text-base text-red-700 border-red-300 hover:bg-red-50 font-medium transition-colors active:scale-[0.98]"
                    onClick={() => deleteAppointment(r._id)}
                  >
                    🗑️ Delete Canceled Appointment
                  </button>
                )}
              </div>
            </div>
          ))}

          {sortedRows.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                No appointments found
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Try adjusting your filters
              </p>
            </div>
          )}
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
        beauticians={beauticians}
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
        beauticians={beauticians}
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
    <Modal open={open} onClose={onClose} title="Cancel appointment">
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
  beauticians,
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
    <Modal open={open} onClose={onClose} title="Edit Appointment">
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
          <FormField label="Beautician" htmlFor="beautician-select">
            <select
              id="beautician-select"
              className="border rounded w-full px-3 py-2"
              value={appointment.beauticianId}
              onChange={(e) => updateField("beauticianId", e.target.value)}
            >
              <option value="">Select Beautician</option>
              {beauticians.map((b) => (
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
  beauticians,
  onSave,
  submitting,
  isSuperAdmin,
}) {
  if (!appointment) return null;

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

  // Filter services based on selected beautician
  const selectedBeautician = beauticians.find(
    (b) => b._id === appointment.beauticianId
  );

  const availableServices = services.filter((service) => {
    if (!appointment.beauticianId) return true; // Show all if no beautician selected

    // Check if beautician is assigned to this service
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
      beauticianIds.includes(appointment.beauticianId) ||
      additionalIdsExtracted.includes(appointment.beauticianId) ||
      primaryId === appointment.beauticianId;

    return isMatch;
  });

  const selectedService = availableServices.find(
    (s) => s._id === appointment.serviceId
  );
  const variants = selectedService?.variants || [];

  // Get beautician's working hours for DateTimePicker
  const beauticianWorkingHours = selectedBeautician?.workingHours || [];
  const customSchedule = selectedBeautician?.customSchedule || {};

  // Debug logging
  useEffect(() => {
    if (showTimePicker) {
      console.log("[CreateModal] DateTimePicker opened with:", {
        beauticianId: appointment.beauticianId,
        beauticianName: selectedBeautician?.name,
        serviceId: appointment.serviceId,
        serviceName: selectedService?.name,
        variantName: appointment.variantName,
        workingHours: beauticianWorkingHours,
        customSchedule: customSchedule,
        selectedBeautician: selectedBeautician,
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

  // Handle beautician change - reset service selection
  const handleBeauticianChange = (beauticianId) => {
    updateField("beauticianId", beauticianId);
    // Reset service and variant if the selected service is not available for new beautician
    if (appointment.serviceId) {
      const service = services.find((s) => s._id === appointment.serviceId);
      if (service) {
        const beauticianIds = service.beauticianIds || [];
        const primaryId =
          typeof service.primaryBeauticianId === "object"
            ? service.primaryBeauticianId?._id
            : service.primaryBeauticianId;

        if (
          !beauticianIds.includes(beauticianId) &&
          primaryId !== beauticianId
        ) {
          updateField("serviceId", "");
          updateField("variantName", "");
          updateField("price", 0);
        }
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Appointment">
      <div className="space-y-4">
        {/* Client Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Client Information</h3>
          <FormField label="Name *" htmlFor="client-name">
            <input
              type="text"
              id="client-name"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Email *" htmlFor="client-email">
            <input
              type="email"
              id="client-email"
              className="border rounded w-full px-3 py-2"
              value={appointment.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
              required
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
          <FormField label="Beautician *" htmlFor="beautician-select-create">
            <select
              id="beautician-select-create"
              className="border rounded w-full px-3 py-2 bg-gray-50"
              value={appointment.beauticianId}
              onChange={(e) => handleBeauticianChange(e.target.value)}
              disabled={!isSuperAdmin}
              required
            >
              <option value="">Select Beautician</option>
              {beauticians.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            {!isSuperAdmin && appointment.beauticianId && (
              <p className="text-xs text-gray-500 mt-1">
                Pre-selected for your beautician account
              </p>
            )}
          </FormField>
          <FormField label="Service *" htmlFor="service-select-create">
            <select
              id="service-select-create"
              className="border rounded w-full px-3 py-2"
              value={appointment.serviceId}
              onChange={(e) => {
                updateField("serviceId", e.target.value);
                updateField("variantName", "");
                updateField("price", 0);
              }}
              disabled={!appointment.beauticianId}
              required
            >
              <option value="">
                {!appointment.beauticianId
                  ? "Select beautician first"
                  : "Select Service"}
              </option>
              {availableServices.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {appointment.beauticianId && availableServices.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No services available for this beautician
              </p>
            )}
          </FormField>
          <FormField label="Variant *" htmlFor="variant-select-create">
            <select
              id="variant-select-create"
              className="border rounded w-full px-3 py-2"
              value={appointment.variantName}
              onChange={(e) => handleVariantChange(e.target.value)}
              disabled={!appointment.serviceId}
              required
            >
              <option value="">Select Variant</option>
              {variants.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} - £{v.price} ({v.durationMin}min)
                </option>
              ))}
            </select>
          </FormField>

          {/* Date & Time Selection with DateTimePicker */}
          {appointment.beauticianId &&
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
                          beauticianId={appointment.beauticianId}
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
            <select
              id="payment-status-create"
              className="border rounded w-full px-3 py-2"
              value={appointment.paymentStatus}
              onChange={(e) => updateField("paymentStatus", e.target.value)}
              required
            >
              <option value="paid">Paid (Cash/Card in Person)</option>
              <option value="unpaid">Unpaid (Online Payment Required)</option>
            </select>
          </FormField>
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
          Create Appointment
        </Button>
      </div>
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
