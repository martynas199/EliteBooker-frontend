import { useState, useEffect, useMemo } from "react";
import Button from "../shared/components/ui/Button";
import ConfirmDeleteModal from "../shared/components/forms/ConfirmDeleteModal";
import { ServiceCardSkeleton } from "../shared/components/ui/Skeleton";
import { useLanguage } from "../shared/contexts/LanguageContext";
import { t } from "../locales/adminTranslations";

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
 * @param {boolean} props.isBeautician - Is user a beautician
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

  // Extract unique categories with useMemo
  const categories = useMemo(() => {
    return ["all", ...new Set(services.map((s) => s.category).filter(Boolean))];
  }, [services]);

  // Filter services with useMemo for performance
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesActive =
        filterActive === "all" ||
        (filterActive === "active" && service.active) ||
        (filterActive === "inactive" && !service.active);

      const matchesCategory =
        filterCategory === "all" || service.category === filterCategory;

      return matchesSearch && matchesActive && matchesCategory;
    });
  }, [services, searchTerm, filterActive, filterCategory]);

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
    <div className="space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("services", language)}</h2>
        <Button onClick={onCreate} variant="brand">
          + {t("addService", language)}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={t("searchServices", language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Active Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t("allStatus", language)}</option>
            <option value="active">{t("activeOnly", language)}</option>
            <option value="inactive">{t("inactiveOnly", language)}</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? t("allCategories", language) : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500">
          {language === "LT"
            ? `Rodoma ${filteredServices.length} iš ${services.length} paslaugų`
            : `Showing ${filteredServices.length} of ${services.length} services`}
        </div>
      </div>

      {/* Services Table / Cards */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            {services.length === 0
              ? t("noServicesFound", language)
              : t("noServicesFound", language)}
          </p>
          {services.length === 0 && (
            <Button onClick={onCreate} variant="brand">
              {t("addService", language)}
            </Button>
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          service.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </span>
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
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr
                      key={service._id}
                      data-testid="service-item"
                      className="hover:bg-gray-50"
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
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {service.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => onEdit(service)}
                          className="text-brand-600 hover:text-brand-900 mr-3"
                        >
                          Edit
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteClick(service)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
