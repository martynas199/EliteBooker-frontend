import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/lib/apiClient";
import { queryKeys } from "../../shared/lib/queryClient";
import { useSharedData } from "../../shared/hooks/useSharedData";
import StaffForm from "../StaffForm";
import StaffList from "../StaffList";
import UnsavedChangesModal from "../../shared/components/forms/UnsavedChangesModal";
import toast from "react-hot-toast";

export default function Staff() {
  const queryClient = useQueryClient();

  // Use shared data hook to get cached specialists and services
  const { specialists: staff, services, isLoading } = useSharedData();

  const [editingStaff, setEditingStaff] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const handleCreate = () => {
    setEditingStaff(null);
    setIsFormDirty(false);
    setShowForm(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setIsFormDirty(false);
    setShowForm(true);
  };

  const handleSave = async (staffData) => {
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
        // Also remove the file property if it somehow still exists
        delete dataToSave.image.file;
      }

      const url = editingStaff
        ? `/specialists/${editingStaff._id}`
        : "/specialists";

      const method = editingStaff ? "patch" : "post";

      const response = await api[method](url, dataToSave);

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
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          // Don't throw - staff member was saved, just image upload failed
          toast.error(
            "Staff member saved, but image upload failed: " +
              uploadError.message
          );
        }
      }

      // Invalidate specialists cache to trigger refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.specialists.list(),
      });

      setShowForm(false);
      setEditingStaff(null);
      setIsFormDirty(false);
    } catch (error) {
      console.error("Save error:", error);
      throw error; // Let form handle error display
    }
  };

  const handleDelete = async (staffId) => {
    try {
      await api.delete(`/specialists/${staffId}`);

      // Invalidate specialists cache to trigger refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.specialists.list(),
      });

      setShowForm(false);
      setEditingStaff(null);
      setIsFormDirty(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete staff member: " + error.message);
    }
  };

  const handleCancel = () => {
    if (isFormDirty) {
      setShowDiscardModal(true);
      return;
    }

    setShowForm(false);
    setEditingStaff(null);
    setIsFormDirty(false);
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    setShowForm(false);
    setEditingStaff(null);
    setIsFormDirty(false);
  };

  if (showForm) {
    return (
      <>
        <StaffForm
          staff={editingStaff}
          onSave={handleSave}
          onCancel={handleCancel}
          onDirtyChange={setIsFormDirty}
          onDelete={
            editingStaff ? () => handleDelete(editingStaff._id) : undefined
          }
        />
        <UnsavedChangesModal
          isOpen={showDiscardModal}
          onStay={() => setShowDiscardModal(false)}
          onDiscard={handleDiscardChanges}
        />
      </>
    );
  }

  return (
    <StaffList
      staff={staff}
      services={services}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      isLoading={isLoading}
    />
  );
}
