import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import Button from "../ui/Button";
import { api } from "../../lib/apiClient";
import DateTimePicker from "../DateTimePicker";
import { TenantProvider } from "../../contexts/TenantContext";

export default function RescheduleModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [loadingSpecialist, setLoadingSpecialist] = useState(true);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    if (isOpen && booking) {
      fetchSpecialistDetails();
    }
    
    // Cleanup: remove tenant header when modal closes
    return () => {
      if (!isOpen && api.defaults.headers.common['x-tenant-id']) {
        delete api.defaults.headers.common['x-tenant-id'];
      }
    };
  }, [isOpen, booking]);

  const fetchSpecialistDetails = async () => {
    try {
      setLoadingSpecialist(true);
      const specialistId = booking.specialistId?._id || booking.specialistId;
      const tenantId = booking.tenantId?._id || booking.tenantId;

      // Set tenant header globally for this session
      api.defaults.headers.common['x-tenant-id'] = tenantId;

      // Fetch specialist with tenant context
      const response = await api.get(`/specialists/${specialistId}`, {
        headers: {
          "x-tenant-id": tenantId,
        },
      });
      setSpecialist(response.data);

      // Fetch tenant info for context
      const tenantResponse = await api.get(`/tenants/${tenantId}`);
      setTenant(tenantResponse.data);
    } catch (err) {
      console.error("Failed to fetch specialist:", err);
      setError("Failed to load specialist details");
    } finally {
      setLoadingSpecialist(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        `/client/bookings/${booking._id}/reschedule`,
        {
          newStart: selectedSlot.startISO,
          newEnd: selectedSlot.endISO,
        }
      );

      onSuccess(response.data);
      onClose();
    } catch (err) {
      console.error("Failed to reschedule:", err);
      setError(err.response?.data?.error || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setError(null);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  // Create tenant object for provider
  const tenantForProvider = tenant || {
    _id: booking.tenantId?._id || booking.tenantId,
    name: booking.tenantId?.name || "Business",
    slug: booking.tenantId?.slug || "",
  };

  return (
    <TenantProvider tenant={tenantForProvider}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Reschedule Appointment
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Current Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Current Appointment
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Service:</span>{" "}
                    {booking.serviceId?.name || "Service"}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(booking.start)}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {formatTime(booking.start)} - {formatTime(booking.end)}
                  </p>
                  <p>
                    <span className="font-medium">With:</span>{" "}
                    {booking.specialistId?.name || "Specialist"}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Date & Time Picker */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Select New Date & Time
                </h4>
                {loadingSpecialist ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
                    <p className="text-sm text-gray-600 mt-2">
                      Loading availability...
                    </p>
                  </div>
                ) : specialist ? (
                  <DateTimePicker
                    specialistId={specialist._id}
                    serviceId={booking.serviceId?._id || booking.serviceId}
                    variantName={booking.variantName}
                    totalDuration={
                      booking.totalDuration ||
                      booking.serviceId?.duration ||
                      60
                    }
                    salonTz="Europe/London"
                    stepMin={15}
                    beauticianWorkingHours={(
                      specialist.workingHours || []
                    ).filter((wh) => wh && wh.dayOfWeek != null)}
                    customSchedule={specialist.customSchedule || {}}
                    onSelect={handleSlotSelect}
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">
                      Unable to load availability
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={!selectedSlot || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Rescheduling...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TenantProvider>
  );
}
