import { useState } from "react";
import Modal from "../../shared/components/ui/Modal";
import ServiceForm from "../ServiceForm";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import {
  useBeauticians,
  useCreateService,
} from "../../shared/hooks/useServicesQueries";
import toast from "react-hot-toast";
import { api } from "../../shared/lib/apiClient";

/**
 * CreateServiceModal - Modal wrapper for creating a new service
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Callback when modal closes
 * @param {function} props.onSuccess - Callback when service is created successfully
 */
export default function CreateServiceModal({ isOpen, onClose, onSuccess }) {
  const admin = useSelector(selectAdmin);
  const { data: specialists = [] } = useBeauticians();
  const createServiceMutation = useCreateService();

  const isSuperAdmin =
    admin?.role === "super_admin" || admin?.role === "salon-admin";

  const handleSave = async (serviceData) => {
    // Prepare service data
    const serviceDataToSend = { ...serviceData };

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
      createServiceMutation.mutate(serviceDataToSend, {
        onSuccess: async (savedService) => {
          // Upload image to Cloudinary if a new file was selected
          if (imageFile && imageFile instanceof File) {
            try {
              const formData = new FormData();
              formData.append("image", imageFile);

              const uploadResponse = await api.post(
                `/services/${savedService._id}/upload-image`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              toast.success("Service created with image!");
              if (onSuccess) onSuccess(uploadResponse.data);
              onClose();
              resolve(uploadResponse.data);
            } catch (uploadError) {
              console.error("Image upload error:", uploadError);
              toast.error("Service created but image upload failed");
              if (onSuccess) onSuccess(savedService);
              onClose();
              resolve(savedService);
            }
          } else {
            toast.success("Service created successfully!");
            if (onSuccess) onSuccess(savedService);
            onClose();
            resolve(savedService);
          }
        },
        onError: (error) => {
          console.error("Create service error:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to create service";
          toast.error(errorMessage);
          reject(error);
        },
      });
    });
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Create New Service"
      size="xl"
      showCloseButton={true}
      closeOnBackdrop={false}
      closeOnEsc={true}
      variant="dashboard"
    >
      <ServiceForm
        service={null}
        specialists={specialists}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={undefined}
        isSuperAdmin={isSuperAdmin}
        admin={admin}
        saving={createServiceMutation.isPending}
        deleting={false}
      />
    </Modal>
  );
}
