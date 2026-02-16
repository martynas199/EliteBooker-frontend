import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Clock,
  Phone,
  Mail,
  X,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import EmptyStateCard from "../../shared/components/ui/EmptyStateCard";
import { confirmDialog } from "../../shared/lib/confirmDialog";
import AdminPageShell from "../components/AdminPageShell";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "United States",
      coordinates: { lat: "", lng: "" },
    },
    workingHours: [
      { dayOfWeek: 0, start: "09:00", end: "17:00" }, // Sunday
      { dayOfWeek: 1, start: "09:00", end: "17:00" }, // Monday
      { dayOfWeek: 2, start: "09:00", end: "17:00" }, // Tuesday
      { dayOfWeek: 3, start: "09:00", end: "17:00" }, // Wednesday
      { dayOfWeek: 4, start: "09:00", end: "17:00" }, // Thursday
      { dayOfWeek: 5, start: "09:00", end: "17:00" }, // Friday
      { dayOfWeek: 6, start: "10:00", end: "16:00" }, // Saturday
    ],
    settings: {
      amenities: [],
      timezone: "America/New_York",
    },
  });

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const inputClass = (hasError = false) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  const locationSummary = useMemo(() => {
    const primaryCount = locations.filter((location) => location?.isPrimary).length;
    const withContactCount = locations.filter(
      (location) => Boolean(location?.phone || location?.email)
    ).length;

    return {
      total: locations.length,
      primary: primaryCount,
      withContact: withContactCount,
      withoutContact: locations.length - withContactCount,
    };
  }, [locations]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get("/locations");
      setLocations(response.data);
    } catch (error) {
      console.error("Failed to load locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Location name is required";
    }
    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required";
    }
    if (!formData.address.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.address.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    // If there are errors, set them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    // Clear errors
    setErrors({});

    try {
      // Convert coordinates to numbers before submitting
      const submitData = {
        ...formData,
        address: {
          ...formData.address,
          coordinates: {
            lat: formData.address.coordinates.lat
              ? parseFloat(formData.address.coordinates.lat)
              : null,
            lng: formData.address.coordinates.lng
              ? parseFloat(formData.address.coordinates.lng)
              : null,
          },
        },
      };

      // Remove coordinates if empty
      if (
        !submitData.address.coordinates.lat ||
        !submitData.address.coordinates.lng
      ) {
        delete submitData.address.coordinates;
      }

      if (editingLocation) {
        await api.patch(`/locations/${editingLocation._id}`, submitData);
        toast.success("Location updated successfully");
      } else {
        await api.post("/locations", submitData);
        toast.success("Location created successfully");
      }
      fetchLocations();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save location");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: "Delete location?",
      message:
        "Are you sure you want to delete this location? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/locations/${id}`);
      toast.success("Location deleted successfully");
      fetchLocations();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete location");
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || "",
      phone: location.phone || "",
      email: location.email || "",
      address: location.address || {
        street: "",
        city: "",
        postalCode: "",
        country: "United States",
        coordinates: { lat: "", lng: "" },
      },
      workingHours: location.workingHours || [],
      settings: location.settings || {
        amenities: [],
        timezone: "America/New_York",
      },
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setErrors({});
    setFormData({
      name: "",
      description: "",
      phone: "",
      email: "",
      address: {
        street: "",
        city: "",
        postalCode: "",
        country: "United States",
        coordinates: { lat: "", lng: "" },
      },
      workingHours: [
        { dayOfWeek: 0, start: "09:00", end: "17:00" },
        { dayOfWeek: 1, start: "09:00", end: "17:00" },
        { dayOfWeek: 2, start: "09:00", end: "17:00" },
        { dayOfWeek: 3, start: "09:00", end: "17:00" },
        { dayOfWeek: 4, start: "09:00", end: "17:00" },
        { dayOfWeek: 5, start: "09:00", end: "17:00" },
        { dayOfWeek: 6, start: "10:00", end: "16:00" },
      ],
      settings: {
        amenities: [],
        timezone: "America/New_York",
      },
    });
  };

  const pageAction = (
    <Button
      onClick={() => setShowModal(true)}
      variant="brand"
      size="md"
      className="w-full sm:w-auto"
      icon={Plus}
    >
      Add Location
    </Button>
  );

  if (loading) {
    return (
      <AdminPageShell
        title="Locations"
        description="Manage branch details and public contact information."
        action={pageAction}
        maxWidth="2xl"
      >
        <Card className="border border-gray-200 py-10 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            <p className="text-sm font-medium text-gray-600">Loading locations...</p>
          </div>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Locations"
      description="Manage branch details, contact info, and booking visibility."
      action={pageAction}
      maxWidth="2xl"
      contentClassName="space-y-4 overflow-x-hidden"
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Total
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {locationSummary.total}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Primary
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-700">
            {locationSummary.primary}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            With Contact
          </p>
          <p className="mt-1 text-lg font-semibold text-green-700">
            {locationSummary.withContact}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Missing Contact
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-700">
            {locationSummary.withoutContact}
          </p>
        </div>
      </div>

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <EmptyStateCard
          title="No locations found"
          description="Get started by adding your first location"
          icon={<MapPin className="w-8 h-8 text-gray-500" />}
          primaryAction={{
            label: "Add Location",
            onClick: () => setShowModal(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {locations.map((location) => (
            <motion.div
              key={location._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Location Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {location.name}
                    </h3>
                  </div>
                  {location.isPrimary && (
                    <span className="flex items-center gap-1 rounded border border-yellow-200 bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                      <Star className="w-3 h-3" />
                      Primary
                    </span>
                  )}
                </div>

                {location.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {location.description}
                  </p>
                )}

                {/* Address */}
                <div className="space-y-2 mb-4">
                  {location.address && (
                    <p className="text-sm text-gray-700">
                      {location.address.street}
                      {location.address.street && <br />}
                      {location.address.city}
                      {location.address.postalCode &&
                        `, ${location.address.postalCode}`}
                    </p>
                  )}
                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {location.phone}
                    </div>
                  )}
                  {location.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {location.email}
                    </div>
                  )}
                </div>

                {/* Working Hours */}
                {location.workingHours && location.workingHours.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4" />
                      Hours
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {location.workingHours.slice(0, 3).map((hours) => (
                        <div
                          key={hours.dayOfWeek}
                          className="flex justify-between"
                        >
                          <span>{dayNames[hours.dayOfWeek]}:</span>
                          <span>
                            {hours.start} - {hours.end}
                          </span>
                        </div>
                      ))}
                      {location.workingHours.length > 3 && (
                        <p className="text-gray-600 italic">
                          +{location.workingHours.length - 3} more days
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {location.settings?.amenities &&
                  location.settings.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Amenities:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {location.settings.amenities
                          .slice(0, 3)
                          .map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        {location.settings.amenities.length > 3 && (
                          <span className="px-2 py-0.5 text-gray-600 text-xs">
                            +{location.settings.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="inline-flex items-center justify-center rounded-lg border border-brand-200 p-2 text-brand-700 transition-colors hover:bg-brand-50"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {!location.isPrimary && (
                  <button
                    onClick={() => handleDelete(location._id)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-700 transition-colors hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingLocation ? "Edit Location" : "Add New Location"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    className={inputClass(Boolean(errors.name))}
                    style={{ fontSize: "16px" }}
                    placeholder="Downtown Office"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className={`${inputClass(false)} resize-none`}
                    style={{ fontSize: "16px" }}
                    placeholder="Brief description of this location..."
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={inputClass(false)}
                      style={{ fontSize: "16px" }}
                      placeholder="+1-555-0100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputClass(false)}
                      style={{ fontSize: "16px" }}
                      placeholder="location@business.com"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Address
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street *
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            street: e.target.value,
                          },
                        });
                        if (errors.street)
                          setErrors({ ...errors, street: null });
                      }}
                      className={inputClass(Boolean(errors.street))}
                      style={{ fontSize: "16px" }}
                      placeholder="123 Main Street"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.street}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              city: e.target.value,
                            },
                          });
                          if (errors.city) setErrors({ ...errors, city: null });
                        }}
                        className={inputClass(Boolean(errors.city))}
                        style={{ fontSize: "16px" }}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              postalCode: e.target.value,
                            },
                          });
                          if (errors.postalCode)
                            setErrors({ ...errors, postalCode: null });
                        }}
                        className={inputClass(Boolean(errors.postalCode))}
                        style={{ fontSize: "16px" }}
                        placeholder="10001"
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            country: e.target.value,
                          },
                        })
                      }
                      className={inputClass(false)}
                      style={{ fontSize: "16px" }}
                      placeholder="United States"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="sticky bottom-0 z-20 -mx-1 border-t border-gray-200 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-3 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-2 sm:shadow-none">
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      variant="outline"
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="brand"
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      {editingLocation ? "Update Location" : "Create Location"}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageShell>
  );
}
