import { useState, useEffect } from "react";
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
  Image as ImageIcon,
  X,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import Card from "../../shared/components/ui/Card";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

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

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      console.log("[ADMIN LOCATIONS] Fetching locations...");
      const response = await api.get("/locations");
      console.log("[ADMIN LOCATIONS] Response:", response.data);
      console.log("[ADMIN LOCATIONS] Locations count:", response.data.length);
      setLocations(response.data);
    } catch (error) {
      console.error("[ADMIN LOCATIONS] Error:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await api.patch(`/locations/${editingLocation._id}`, formData);
        toast.success("Location updated successfully");
      } else {
        await api.post("/locations", formData);
        toast.success("Location created successfully");
      }
      fetchLocations();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save location");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this location? This action cannot be undone."
      )
    ) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg hidden sm:flex">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Locations
            </h2>
            <p className="text-sm text-gray-600">
              Manage your business locations and their details
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <Card className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No locations yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first location
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Location
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {locations.map((location) => (
            <motion.div
              key={location._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
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
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
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
                        <p className="text-gray-500 italic">
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
                          <span className="px-2 py-0.5 text-gray-500 text-xs">
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
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {!location.isPrimary && (
                  <button
                    onClick={() => handleDelete(location._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingLocation ? "Edit Location" : "Add New Location"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Downtown Office"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of this location..."
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      Street
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              postalCode: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingLocation ? "Update Location" : "Create Location"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
