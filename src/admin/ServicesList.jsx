import { useState, useEffect, useMemo } from "react";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import Button from "../shared/components/ui/Button";
import ConfirmDeleteModal from "../shared/components/forms/ConfirmDeleteModal";
import { ServiceCardSkeleton } from "../shared/components/ui/Skeleton";
import { useLanguage } from "../shared/contexts/LanguageContext";
import { t } from "../locales/adminTranslations";
import { useDebounce } from "../shared/hooks/useDebounce";
import {
  SelectDrawer,
  SelectButton,
} from "../shared/components/ui/SelectDrawer";

/**
 * ServicesList - Display and manage services in admin panel
 *
 * @param {object} props
 * @param {Array} props.services - Array of service objects
 * @param {function} props.onEdit - Callback(service) when edit button clicked
 * @param {function} props.onDelete - Callback(serviceId) when delete confirmed
 * @param {function} props.onCreate - Callback when create button clicked
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.isSuperAdmin - Is user a super admin
 * @param {boolean} props.isBeautician - Is user a specialist
 */
export default function ServicesList({
  services,
  onEdit,
  onDelete,
  onCreate,
  isLoading,
  isSuperAdmin = false,
  isBeautician = false,
}) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all"); // 'all', 'active', 'inactive'
  const [filterCategory, setFilterCategory] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // serviceId being deleted

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Drawer states for mobile
  const [showActiveDrawer, setShowActiveDrawer] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);

  // Extract unique categories with useMemo
  const categories = useMemo(() => {
    return ["all", ...new Set(services.map((s) => s.category).filter(Boolean))];
  }, [services]);

  // Filter services with useMemo for performance - uses debounced search
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        service.description
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesActive =
        filterActive === "all" ||
        (filterActive === "active" && service.active) ||
        (filterActive === "inactive" && !service.active);

      const matchesCategory =
        filterCategory === "all" || service.category === filterCategory;

      return matchesSearch && matchesActive && matchesCategory;
    });
  }, [services, debouncedSearchTerm, filterActive, filterCategory]);

  const handleDeleteClick = (service) => {
    setDeleteConfirm(service);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await onDelete(deleteConfirm._id);
      setDeleteConfirm(null);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "—";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(price);
  };

  // Get the first variant's price or fallback to service.price
  const getServicePrice = (service) => {
    if (
      service.variants &&
      service.variants.length > 0 &&
      service.variants[0].price
    ) {
      return service.variants[0].price;
    }
    return service.price || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-hidden">
          {[...Array(6)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg hidden sm:flex">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("services", language)}
          </h2>
        </div>
        <Button
          onClick={onCreate}
          variant="primary"
          className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2 inline-block" />
          {t("addService", language)}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-100 p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("searchServices", language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Active Filter */}
          <SelectButton
            value={filterActive}
            placeholder={t("allStatus", language)}
            options={[
              { value: "all", label: t("allStatus", language) },
              { value: "active", label: t("activeOnly", language) },
              { value: "inactive", label: t("inactiveOnly", language) },
            ]}
            onClick={() => setShowActiveDrawer(true)}
            className="px-4 py-3 rounded-xl"
          />

          {/* Category Filter */}
          <SelectButton
            value={filterCategory}
            placeholder={t("allCategories", language)}
            options={categories.map((cat) => ({
              value: cat,
              label: cat === "all" ? t("allCategories", language) : cat,
            }))}
            onClick={() => setShowCategoryDrawer(true)}
            className="px-4 py-3 rounded-xl"
          />
        </div>

        <div className="text-sm font-medium text-gray-600">
          {language === "LT"
            ? `Rodoma ${filteredServices.length} iš ${services.length} paslaugų`
            : `Showing ${filteredServices.length} of ${services.length} services`}
        </div>
      </div>

      {/* Services Table / Cards */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xl border-0 ring-1 ring-gray-900/5 p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {services.length === 0 ? "No Services Yet" : "No Services Found"}
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            {services.length === 0
              ? "Start by creating your first service to offer to your clients"
              : "Try adjusting your filters to find what you're looking for"}
          </p>
          {services.length === 0 && (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all text-base"
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
              {t("addService", language)}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4 overflow-x-hidden">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                data-testid="service-item"
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-4">
                  {/* Service Header with Image */}
                  <div className="flex gap-3 mb-3">
                    {service.image && (
                      <img
                        src={service.image.url}
                        alt={service.image.alt || service.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {service.active ? "Active" : "Inactive"}
                        </span>
                        {service.fixedTimeSlots && service.fixedTimeSlots.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            🕐 Fixed Times
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Category</div>
                      <div className="text-sm font-medium text-gray-900">
                        {service.category || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Price</div>
                      <div className="text-sm font-semibold text-brand-600">
                        {formatPrice(getServicePrice(service))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Duration</div>
                      <div className="text-sm text-gray-900">
                        {service.durationMin ||
                          service.variants?.[0]?.durationMin ||
                          "—"}
                        {(service.durationMin ||
                          service.variants?.[0]?.durationMin) &&
                          " min"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Variants</div>
                      <div className="text-sm text-gray-900">
                        {service.variants?.length > 0 ? (
                          <span className="text-brand-600 font-medium">
                            {service.variants.length} variant(s)
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <Button
                      onClick={() => onEdit(service)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        onClick={() => handleDeleteClick(service)}
                        variant="danger"
                        size="sm"
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Variants
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr
                      key={service._id}
                      data-testid="service-item"
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {service.image && (
                            <img
                              src={service.image.url}
                              alt={service.image.alt || service.name}
                              className="w-12 h-12 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {service.name}
                            </div>
                            {service.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {service.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {service.category || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatPrice(getServicePrice(service))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {service.durationMin ||
                          service.variants?.[0]?.durationMin ||
                          "—"}
                        {(service.durationMin ||
                          service.variants?.[0]?.durationMin) &&
                          " min"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {service.variants?.length > 0 ? (
                          <span className="text-brand-600">
                            {service.variants.length} variant(s)
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              service.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {service.active ? "Active" : "Inactive"}
                          </span>
                          {service.fixedTimeSlots && service.fixedTimeSlots.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              🕐 Fixed Times
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(service)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-white hover:bg-brand-600 border border-brand-600 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteClick(service)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
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
          </div>
        </>
      )}

      {/* Active Status Filter Drawer */}
      <SelectDrawer
        open={showActiveDrawer}
        onClose={() => setShowActiveDrawer(false)}
        title={t("filterByStatus", language) || "Filter by Status"}
        options={[
          { value: "all", label: t("allStatus", language) },
          { value: "active", label: t("activeOnly", language) },
          { value: "inactive", label: t("inactiveOnly", language) },
        ]}
        value={filterActive}
        onChange={(value) => setFilterActive(value)}
      />

      {/* Category Filter Drawer */}
      <SelectDrawer
        open={showCategoryDrawer}
        onClose={() => setShowCategoryDrawer(false)}
        title={t("filterByCategory", language) || "Filter by Category"}
        options={categories.map((cat) => ({
          value: cat,
          label: cat === "all" ? t("allCategories", language) : cat,
        }))}
        value={filterCategory}
        onChange={(value) => setFilterCategory(value)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        itemName={deleteConfirm?.name}
        itemType="service"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
