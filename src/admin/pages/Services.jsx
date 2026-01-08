import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { api } from "../../shared/lib/apiClient";
import { selectAdmin } from "../../shared/state/authSlice";
import {
  useServices,
  useBeauticians,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "../../shared/hooks/useServicesQueries";
import ServiceForm from "../ServiceForm";
import ServicesList from "../ServicesList";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Modal from "../../shared/components/ui/Modal";
import { testApiConnection } from "../../shared/utils/apiTest";

/**
 * Services Page - Manage services with modal form overlay
 * Updated: Jan 2026 - Mobile UX improvements
 */
export default function Services() {
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Get admin info from Redux store
  const admin = useSelector(selectAdmin);

  // React Query hooks
  const {
    data: services = [],
    isLoading: servicesLoading,
    isError: servicesError,
    error: servicesErrorData,
    isFetching: servicesFetching,
  } = useServices();

  const { data: specialists = [], isLoading: beauticiansLoading } =
    useBeauticians();

  // Mutations
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  // Memoize role checks for performance
  const isSuperAdmin = useMemo(
    () => admin?.role === "super_admin" || admin?.role === "salon-admin",
    [admin?.role]
  );
  const isBeautician = useMemo(
    () => admin?.role === "admin" && admin?.specialistId,
    [admin?.role, admin?.specialistId]
  );

  // Derived state
  const isLoading = servicesLoading || beauticiansLoading;

  const handleCreate = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleSave = async (serviceData) => {
    // Prepare service data
    const serviceDataToSend = { ...serviceData };

    // Handle fixed time slots - if useFixedSlots is false, remove fixedTimeSlots
    if (!serviceDataToSend.useFixedSlots) {
      // Explicitly set to undefined to remove from database
      serviceDataToSend.fixedTimeSlots = undefined;
    } else if (
      serviceDataToSend.fixedTimeSlots &&
      serviceDataToSend.fixedTimeSlots.length > 0
    ) {
      // Keep the fixed time slots array
      serviceDataToSend.fixedTimeSlots = serviceDataToSend.fixedTimeSlots;
    }
    // Remove the UI-only field
    delete serviceDataToSend.useFixedSlots;

    // Ensure IDs are strings (convert ObjectId to string if needed)
    if (serviceDataToSend.primaryBeauticianId) {
      serviceDataToSend.primaryBeauticianId = String(
        serviceDataToSend.primaryBeauticianId
      );
    }
    if (serviceDataToSend.additionalBeauticianIds?.length) {
      serviceDataToSend.additionalBeauticianIds =
        serviceDataToSend.additionalBeauticianIds.map((id) => String(id));
    }

    // Remove image file for separate upload
    const imageFile = serviceDataToSend.image?.file;
    if (serviceDataToSend.image?.file) {
      delete serviceDataToSend.image;
    }

    return new Promise((resolve, reject) => {
      const mutation = editingService
        ? updateServiceMutation
        : createServiceMutation;
      const mutationData = editingService
        ? { serviceId: editingService._id, serviceData: serviceDataToSend }
        : serviceDataToSend;

      mutation.mutate(mutationData, {
        onSuccess: async (savedService) => {
          // Upload image to Cloudinary if a new file was selected
          if (imageFile && imageFile instanceof File) {
            try {
              const formData = new FormData();
              formData.append("image", imageFile);

              await api.post(
                `/services/${savedService._id}/upload-image`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              toast.success(
                editingService
                  ? "Service and image updated successfully"
                  : "Service and image created successfully"
              );
            } catch (uploadError) {
              console.error("Image upload failed:", uploadError);
              toast.error(
                "Service saved, but image upload failed: " +
                  (uploadError.response?.data?.error || uploadError.message)
              );
            }
          } else {
            toast.success(
              editingService
                ? "Service updated successfully"
                : "Service created successfully"
            );
          }

          setShowForm(false);
          setEditingService(null);
          resolve(savedService);
        },
        onError: (error) => {
          console.error("Save error:", error);
          reject(error);
        },
      });
    });
  };

  const handleDelete = async (serviceId) => {
    deleteServiceMutation.mutate(serviceId, {
      onSuccess: () => {
        setShowForm(false);
        setEditingService(null);
        toast.success("Service deleted successfully");
      },
      onError: (error) => {
        console.error("Delete error:", error);
        toast.error("Failed to delete service: " + error.message);
      },
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading services...</span>
      </div>
    );
  }

  // Error state
  if (servicesError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Services
        </h3>
        <p className="text-red-600 mb-2">
          {servicesErrorData?.message || "Failed to load services"}
        </p>

        {/* Debug information */}
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-red-500 hover:text-red-700">
            Show debug information
          </summary>
          <div className="mt-2 p-3 bg-red-100 rounded text-sm font-mono">
            <p>
              <strong>Error:</strong>{" "}
              {servicesErrorData?.message || "Unknown error"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {servicesErrorData?.response?.status || "No status"}
            </p>
            <p>
              <strong>Backend URL:</strong>{" "}
              {import.meta.env.VITE_API_URL || "http://localhost:3000"}
            </p>
            <p>
              <strong>Endpoint:</strong> /api/services
            </p>
          </div>
        </details>

        <div className="space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>

          <button
            onClick={() => testApiConnection()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test API (Check Console)
          </button>

          <button
            onClick={() => {
              // Force refetch services
              window.location.hash = "#refresh";
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Services
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-700">
            <strong>Troubleshooting:</strong>
          </p>
          <ul className="text-sm text-yellow-600 mt-1 list-disc list-inside">
            <li>Make sure the backend server is running on port 3000</li>
            <li>
              Check if you can access{" "}
              <code>http://localhost:3000/api/services</code> directly
            </li>
            <li>Verify your internet connection</li>
          </ul>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <>
        {/* Background refresh indicator */}
        {servicesFetching && (
          <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Refreshing services...</span>
            </div>
          </div>
        )}

        {/* Services List in background */}
        <ServicesList
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          isLoading={isLoading}
          isSuperAdmin={isSuperAdmin}
          isBeautician={isBeautician}
        />

        {/* Service Form in Modal */}
        <Modal
          open={showForm}
          onClose={handleCancel}
          title={editingService ? "Edit Service" : "Create New Service"}
          size="xl"
          variant="dashboard"
        >
          <ServiceForm
            service={editingService}
            specialists={specialists}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={
              editingService
                ? () => handleDelete(editingService._id)
                : undefined
            }
            isSuperAdmin={isSuperAdmin}
            admin={admin}
            saving={
              createServiceMutation.isPending || updateServiceMutation.isPending
            }
            deleting={deleteServiceMutation.isPending}
          />
        </Modal>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Background refresh indicator */}
      {servicesFetching && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-blue-700">
              Updating services in background...
            </span>
          </div>
        </div>
      )}

      <ServicesList
        services={services}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        isLoading={isLoading}
        isSuperAdmin={isSuperAdmin}
        isBeautician={isBeautician}
      />
    </div>
  );
}
