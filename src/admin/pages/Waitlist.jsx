import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Ban,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import AdminPageShell, { AdminSectionCard } from "../components/AdminPageShell";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "converted", label: "Converted" },
  { value: "expired", label: "Expired" },
  { value: "removed", label: "Removed" },
];

const STATUS_ACTION_OPTIONS = STATUS_OPTIONS.filter((option) => option.value !== "all");
const PAGE_LIMIT_OPTIONS = [10, 25, 50, 100];

function getServiceName(entry) {
  if (!entry?.serviceId) return "—";
  if (typeof entry.serviceId === "object") return entry.serviceId.name || "—";
  return "Service";
}

function getSpecialistName(entry) {
  if (!entry?.specialistId) return "Any specialist";
  if (typeof entry.specialistId === "object") {
    return entry.specialistId.name || "Any specialist";
  }
  return "Assigned specialist";
}

function getStatusBadgeClass(status) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "converted") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (status === "expired") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function formatDate(dateValue) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWaitlistQueryParams({
  status,
  serviceId,
  specialistId,
  search,
  page,
  limit,
}) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (serviceId) params.set("serviceId", serviceId);
  if (specialistId) params.set("specialistId", specialistId);
  if (search.trim()) params.set("search", search.trim());
  params.set("page", String(page));
  params.set("limit", String(limit));
  return params;
}

function toCsvCell(value) {
  const normalized = value == null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

export default function Waitlist() {
  const [entries, setEntries] = useState([]);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [status, setStatus] = useState("all");
  const [serviceId, setServiceId] = useState("");
  const [specialistId, setSpecialistId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [counts, setCounts] = useState({
    active: 0,
    converted: 0,
    expired: 0,
    removed: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 1,
    hasMore: false,
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("converted");

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    entries.length > 0 && entries.every((entry) => selectedIdSet.has(entry._id));

  const loadMeta = useCallback(async () => {
    try {
      const [servicesRes, specialistsRes] = await Promise.all([
        api.get("/services"),
        api.get("/specialists"),
      ]);
      setServices((servicesRes.data || []).filter((item) => item.active !== false));
      setSpecialists((specialistsRes.data || []).filter((item) => item.active !== false));
    } catch (error) {
      console.error("waitlist_meta_err", error);
      toast.error("Failed to load waitlist filters");
    }
  }, []);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params = buildWaitlistQueryParams({
        status,
        serviceId,
        specialistId,
        search,
        page,
        limit,
      });

      const response = await api.get(`/waitlist?${params.toString()}`);
      setEntries(response.data?.entries || []);
      setCounts(
        response.data?.counts || {
          active: 0,
          converted: 0,
          expired: 0,
          removed: 0,
        }
      );
      setPagination(
        response.data?.pagination || {
          page,
          limit,
          total: 0,
          pages: 1,
          hasMore: false,
        }
      );
      setSelectedIds([]);
    } catch (error) {
      console.error("waitlist_fetch_err", error);
      toast.error(error.message || "Failed to load waitlist");
    } finally {
      setLoading(false);
    }
  }, [status, serviceId, specialistId, search, page, limit]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    setPage(1);
  }, [status, serviceId, specialistId, search, limit]);

  const updateStatus = useCallback(
    async (entryId, nextStatus) => {
      try {
        setUpdatingId(entryId);
        await api.patch(`/waitlist/${entryId}/status`, { status: nextStatus });
        toast.success(`Entry marked as ${nextStatus.replace("_", " ")}`);
        await loadEntries();
      } catch (error) {
        console.error("waitlist_update_status_err", error);
        toast.error(error.message || "Failed to update waitlist status");
      } finally {
        setUpdatingId(null);
      }
    },
    [loadEntries]
  );

  const toggleSelectAllVisible = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !entries.some((entry) => entry._id === id))
      );
      return;
    }

    const visibleIds = entries.map((entry) => entry._id);
    setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
  }, [allVisibleSelected, entries]);

  const toggleSelectOne = useCallback((entryId) => {
    setSelectedIds((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  }, []);

  const applyBulkStatus = useCallback(async () => {
    if (!selectedIds.length) {
      toast.error("Select at least one waitlist entry");
      return;
    }

    try {
      setBulkUpdating(true);
      const response = await api.post("/waitlist/bulk-status", {
        ids: selectedIds,
        status: bulkStatus,
      });
      toast.success(
        `${response.data?.modifiedCount || 0} entries updated to ${bulkStatus}`
      );
      setSelectedIds([]);
      await loadEntries();
    } catch (error) {
      console.error("waitlist_bulk_status_err", error);
      toast.error(error.message || "Failed to apply bulk update");
    } finally {
      setBulkUpdating(false);
    }
  }, [bulkStatus, loadEntries, selectedIds]);

  const exportCsv = useCallback(async () => {
    try {
      setExporting(true);
      const allRows = [];
      let cursorPage = 1;
      const maxPages = 25;

      while (cursorPage <= maxPages) {
        const params = buildWaitlistQueryParams({
          status,
          serviceId,
          specialistId,
          search,
          page: cursorPage,
          limit: 200,
        });
        const response = await api.get(`/waitlist?${params.toString()}`);
        const pageEntries = response.data?.entries || [];
        allRows.push(...pageEntries);

        if (!response.data?.pagination?.hasMore) {
          break;
        }
        cursorPage += 1;
      }

      if (!allRows.length) {
        toast.error("No waitlist entries to export");
        return;
      }

      const header = [
        "Client Name",
        "Client Email",
        "Client Phone",
        "Service",
        "Variant",
        "Specialist",
        "Status",
        "Preferred Date",
        "Time Preference",
        "Joined At",
        "Notes",
      ];

      const lines = [header.map(toCsvCell).join(",")];
      allRows.forEach((entry) => {
        lines.push(
          [
            entry?.client?.name || "",
            entry?.client?.email || "",
            entry?.client?.phone || "",
            getServiceName(entry),
            entry?.variantName || "",
            getSpecialistName(entry),
            entry?.status || "",
            entry?.desiredDate || "",
            entry?.timePreference || "",
            formatDate(entry?.createdAt),
            entry?.notes || "",
          ]
            .map(toCsvCell)
            .join(",")
        );
      });

      const csvContent = lines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      anchor.href = url;
      anchor.download = `waitlist-export-${timestamp}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allRows.length} waitlist entries`);
    } catch (error) {
      console.error("waitlist_export_err", error);
      toast.error(error.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  }, [search, serviceId, specialistId, status]);

  const headerAction = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={exportCsv}
        disabled={exporting || loading}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {exporting ? "Exporting..." : "Export CSV"}
      </button>
      <button
        type="button"
        onClick={loadEntries}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button>
    </div>
  );

  return (
    <AdminPageShell
      title="Waitlist"
      description="Auto-fill cancellations faster by managing waitlist entries."
      action={headerAction}
      maxWidth="2xl"
      contentClassName="space-y-4"
    >
      <AdminSectionCard>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Active
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-800">
              {counts.active}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Converted
            </p>
            <p className="mt-1 text-2xl font-semibold text-blue-800">
              {counts.converted}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Expired
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-800">
              {counts.expired}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Removed
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-800">
              {counts.removed}
            </p>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search client"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>

          <select
            value={specialistId}
            onChange={(event) => setSpecialistId(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
          >
            <option value="">Any specialist</option>
            {specialists.map((specialist) => (
              <option key={specialist._id} value={specialist._id}>
                {specialist.name}
              </option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
          >
            {PAGE_LIMIT_OPTIONS.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} per page
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
            />
            Select all on page
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {selectedIds.length} selected
            </span>
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400"
            >
              {STATUS_ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Mark as {option.label.toLowerCase()}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={applyBulkStatus}
              disabled={!selectedIds.length || bulkUpdating}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:opacity-60"
            >
              {bulkUpdating ? "Applying..." : "Apply bulk action"}
            </button>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10">
            <LoadingSpinner size="lg" />
            <span className="text-sm text-gray-600">Loading waitlist...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <Users className="mb-3 h-10 w-10 text-gray-400" />
            <p className="text-base font-semibold text-gray-900">
              No waitlist entries found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Try a different filter or wait for new signups.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry._id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <label className="mb-2 inline-flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedIdSet.has(entry._id)}
                        onChange={() => toggleSelectOne(entry._id)}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                      />
                      Select entry
                    </label>
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {entry?.client?.name || "Unnamed client"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {entry?.client?.email || "No email"}
                      {entry?.client?.phone ? ` • ${entry.client.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {getServiceName(entry)} • {entry.variantName || "Variant"} •{" "}
                      {getSpecialistName(entry)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Preferred: {entry.desiredDate || "Any date"} •{" "}
                      {entry.timePreference || "any"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Joined: {formatDate(entry.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>

                    <div className="flex flex-wrap justify-end gap-1.5">
                      {entry.status !== "converted" && (
                        <button
                          type="button"
                          disabled={updatingId === entry._id}
                          onClick={() => updateStatus(entry._id, "converted")}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Convert
                        </button>
                      )}

                      {entry.status !== "expired" && (
                        <button
                          type="button"
                          disabled={updatingId === entry._id}
                          onClick={() => updateStatus(entry._id, "expired")}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          Expire
                        </button>
                      )}

                      {entry.status !== "removed" && (
                        <button
                          type="button"
                          disabled={updatingId === entry._id}
                          onClick={() => updateStatus(entry._id, "removed")}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-60"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}

                      {entry.status !== "active" && (
                        <button
                          type="button"
                          disabled={updatingId === entry._id}
                          onClick={() => updateStatus(entry._id, "active")}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Reactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSectionCard>

      <AdminSectionCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Showing page {pagination.page} of {pagination.pages} •{" "}
            {pagination.total} total entries
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination.page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, pagination.pages || 1))
              }
              disabled={!pagination.hasMore || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminSectionCard>
    </AdminPageShell>
  );
}
