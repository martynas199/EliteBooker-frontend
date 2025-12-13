import { useState } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import Button from "../shared/components/ui/Button";
import ConfirmDeleteModal from "../shared/components/forms/ConfirmDeleteModal";
import { BeauticianCardSkeleton } from "../shared/components/ui/Skeleton";
import {
  SelectDrawer,
  SelectButton,
} from "../shared/components/ui/SelectDrawer";

/**
 * StaffList - Display and manage staff/specialists in admin panel
 *
 * @param {object} props
 * @param {Array} props.staff - Array of staff/specialist objects
 * @param {Array} props.services - Array of service objects (to show service assignments)
 * @param {function} props.onEdit - Callback(staff) when edit button clicked
 * @param {function} props.onDelete - Callback(staffId) when delete confirmed
 * @param {function} props.onCreate - Callback when create button clicked
 * @param {boolean} props.isLoading - Loading state
 */
export default function StaffList({
  staff,
  services = [],
  onEdit,
  onDelete,
  onCreate,
  isLoading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all"); // 'all', 'active', 'inactive'
  const [filterService, setFilterService] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // staff member being deleted

  // Drawer states for mobile
  const [showActiveDrawer, setShowActiveDrawer] = useState(false);
  const [showServiceDrawer, setShowServiceDrawer] = useState(false);

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    // Skip null/undefined members
    if (!member || !member._id) return false;

    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialties?.some((s) =>
        s?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && member.active) ||
      (filterActive === "inactive" && !member.active);

    // Check if staff is assigned to the filtered service
    const matchesService =
      filterService === "all" ||
      services.some((s) => {
        if (!s || !s._id || s._id !== filterService) return false;

        // Compare as strings to handle ObjectId comparison
        const primaryId =
          typeof s.primaryBeauticianId === "object"
            ? s.primaryBeauticianId?._id || s.primaryBeauticianId?.toString()
            : s.primaryBeauticianId;

        const hasAsPrimary = primaryId === member._id;
        const hasAsAdditional = s.additionalBeauticianIds?.some((id) => {
          if (!id) return false;
          const additionalId =
            typeof id === "object" ? id?._id || id?.toString() : id;
          return additionalId === member._id;
        });

        return hasAsPrimary || hasAsAdditional;
      });

    return matchesSearch && matchesActive && matchesService;
  });

  // Get services assigned to a staff member
  const getAssignedServices = (staffId) => {
    return services.filter((s) => {
      if (!s || !s._id) return false;

      // Compare as strings to handle ObjectId comparison
      const primaryId =
        typeof s.primaryBeauticianId === "object"
          ? s.primaryBeauticianId?._id || s.primaryBeauticianId?.toString()
          : s.primaryBeauticianId;
      return (
        primaryId === staffId ||
        s.additionalBeauticianIds?.some((id) => {
          if (!id) return false;
          const additionalId =
            typeof id === "object" ? id?._id || id?.toString() : id;
          return additionalId === staffId;
        })
      );
    });
  };

  const handleDeleteClick = (member) => {
    // Check if staff is assigned to any services
    const assignedServices = getAssignedServices(member._id);
    setDeleteConfirm({ member, assignedServices });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await onDelete(deleteConfirm.member._id);
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-hidden">
          {[...Array(6)].map((_, i) => (
            <BeauticianCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Staff
          </h2>
        </div>
        <Button
          onClick={onCreate}
          variant="brand"
          className="shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 mr-2 inline-block" />
          Add Staff Member
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
              placeholder="Search staff by name, email, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Active Filter */}
          <SelectButton
            value={filterActive}
            placeholder="All Status"
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active Only" },
              { value: "inactive", label: "Inactive Only" },
            ]}
            onClick={() => setShowActiveDrawer(true)}
            className="px-4 py-3 rounded-xl"
          />

          {/* Service Filter */}
          <SelectButton
            value={filterService}
            placeholder="All Services"
            options={[
              { value: "all", label: "All Services" },
              ...services.map((service) => ({
                value: service._id,
                label: service.name,
              })),
            ]}
            onClick={() => setShowServiceDrawer(true)}
            className="px-4 py-3 rounded-xl"
          />
        </div>

        <div className="text-sm font-medium text-gray-600">
          Showing {filteredStaff.length} of {staff.length} staff members
        </div>
      </div>

      {/* Staff Table / Cards */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            {staff.length === 0
              ? "No staff members yet"
              : "No staff match your filters"}
          </p>
          {staff.length === 0 && (
            <Button onClick={onCreate} variant="brand">
              Add Your First Staff Member
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {filteredStaff.map((member) => {
              const assignedServices = getAssignedServices(member._id);

              return (
                <div
                  key={member._id}
                  data-testid="staff-item"
                  className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                >
                  <div className="p-4">
                    {/* Staff Header */}
                    <div className="flex gap-3 mb-3">
                      {member.image ? (
                        <img
                          src={member.image.url}
                          alt={member.image.alt || member.name}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                          style={{
                            backgroundColor: member.color || "#3B82F6",
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {member.name}
                        </h3>
                        {member.bio && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {member.bio}
                          </p>
                        )}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-900">
                          {member.email || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-gray-900">
                          {member.phone || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Specialties & Services */}
                    <div className="space-y-2 mb-3 pb-3 border-b border-gray-200">
                      {member.specialties && member.specialties.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Specialties
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {member.specialties.map((specialty, idx) => (
                              <span
                                key={idx}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-brand-50 text-brand-700 rounded"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {assignedServices.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Assigned Services
                          </div>
                          <div className="text-sm text-brand-600 font-medium">
                            {assignedServices.length} service
                            {assignedServices.length !== 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {assignedServices
                              .slice(0, 2)
                              .map((s) => s.name)
                              .join(", ")}
                            {assignedServices.length > 2 &&
                              ` +${assignedServices.length - 2} more`}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onEdit(member)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(member)}
                        variant="danger"
                        size="sm"
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
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
                  {filteredStaff.map((member) => {
                    const assignedServices = getAssignedServices(member._id);

                    return (
                      <tr
                        key={member._id}
                        data-testid="staff-item"
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {member.image ? (
                              <img
                                src={member.image.url}
                                alt={member.image.alt || member.name}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-full mr-3 flex items-center justify-center text-white font-semibold"
                                style={{
                                  backgroundColor: member.color || "#3B82F6",
                                }}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {member.name}
                              </div>
                              {member.bio && (
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                  {member.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-900">
                            {member.email || "—"}
                          </div>
                          <div className="text-gray-500">
                            {member.phone || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {member.specialties &&
                          member.specialties.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {member.specialties
                                .slice(0, 2)
                                .map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex px-2 py-1 text-xs font-medium bg-brand-50 text-brand-700 rounded"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              {member.specialties.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{member.specialties.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {assignedServices.length > 0 ? (
                            <div>
                              <span className="text-brand-600 font-medium">
                                {assignedServices.length} service
                                {assignedServices.length !== 1 ? "s" : ""}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {assignedServices
                                  .slice(0, 2)
                                  .map((s) => s.name)
                                  .join(", ")}
                                {assignedServices.length > 2 &&
                                  ` +${assignedServices.length - 2} more`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(member)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-white hover:bg-brand-600 border border-brand-600 rounded-lg transition-all"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(member)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
        title="Filter by Status"
        options={[
          { value: "all", label: "All Status" },
          { value: "active", label: "Active Only" },
          { value: "inactive", label: "Inactive Only" },
        ]}
        value={filterActive}
        onChange={(value) => setFilterActive(value)}
      />

      {/* Service Filter Drawer */}
      <SelectDrawer
        open={showServiceDrawer}
        onClose={() => setShowServiceDrawer(false)}
        title="Filter by Service"
        options={[
          { value: "all", label: "All Services" },
          ...services.map((service) => ({
            value: service._id,
            label: service.name,
          })),
        ]}
        value={filterService}
        onChange={(value) => setFilterService(value)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        itemName={deleteConfirm?.member?.name}
        itemType="staff member"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        message={
          deleteConfirm?.assignedServices?.length > 0 ? (
            <>
              <p className="mb-3">
                This staff member is currently assigned to{" "}
                {deleteConfirm.assignedServices.length} service(s):
              </p>
              <ul className="list-disc list-inside mb-3 text-sm">
                {deleteConfirm.assignedServices.map((service) => (
                  <li key={service._id}>{service.name}</li>
                ))}
              </ul>
              <p className="text-orange-600 font-medium">
                Please reassign these services before deleting this staff
                member.
              </p>
            </>
          ) : undefined
        }
        disabled={deleteConfirm?.assignedServices?.length > 0}
      />
    </div>
  );
}
