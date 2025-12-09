import Modal from "../../shared/components/ui/Modal";
import StaffForm from "../StaffForm";
import { useState, useEffect } from "react";
import { api } from "../../shared/lib/apiClient";
import toast from "react-hot-toast";

/**
 * CreateStaffModal - Modal wrapper for creating a new staff member
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Callback when modal closes
 * @param {function} props.onSuccess - Callback when staff member is created successfully
 */
export default function CreateStaffModal({ isOpen, onClose, onSuccess }) {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadServices();
    }
  }, [isOpen]);

  const loadServices = async () => {
    try {
      const servicesRes = await api.get("/services", {
        params: { limit: 1000 },
      });
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Failed to load services:", error);
      toast.error("Failed to load services");
    }
  };

  const handleSave = async (staffData) => {
    setIsLoading(true);
    try {
      // Extract image file if present
      const imageFile = staffData.image?.file;

      // Ensure IDs are strings (convert ObjectId to string if needed)
      const dataToSave = { ...staffData };
      if (dataToSave.serviceIds?.length) {
        dataToSave.serviceIds = dataToSave.serviceIds.map((id) => String(id));
      }

      // Remove local preview data, null images, or when uploading new file
      if (
        !dataToSave.image ||
        dataToSave.image?.provider === "local-preview" ||
        imageFile
      ) {
        delete dataToSave.image;
      } else if (dataToSave.image?.file) {
        delete dataToSave.image.file;
      }

      const response = await api.post("/specialists", dataToSave);

      if (!response.data) {
        throw new Error("Failed to save staff member");
      }

      // Upload image to Cloudinary if a new file was selected
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append("image", imageFile);

          await api.post(
            `/specialists/${response.data._id}/upload-image`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          toast.success("Staff member created with image!");
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error("Staff member created but image upload failed");
        }
      } else {
        toast.success("Staff member created successfully!");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create staff member:", error);
      toast.error(
        error.response?.data?.message || "Failed to create staff member"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add New Staff Member"
      size="xl"
      showCloseButton={true}
      closeOnBackdrop={false}
      closeOnEsc={true}
      variant="dashboard"
    >
      <StaffForm
        staff={null}
        services={services}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={undefined}
      />
    </Modal>
  );
}
