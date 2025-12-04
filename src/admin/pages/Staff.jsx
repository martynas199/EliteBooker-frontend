import { useEffect, useState } from "react";
import { api } from "../../shared/lib/apiClient";
import StaffForm from "../StaffForm";
import StaffList from "../StaffList";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, servicesRes] = await Promise.all([
        api.get("/beauticians", { params: { limit: 1000 } }),
        api.get("/services", { params: { limit: 1000 } }),
      ]);
      setStaff(staffRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load staff data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStaff(null);
    setShowForm(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
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
        ? `/beauticians/${editingStaff._id}`
        : "/beauticians";

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
            `/beauticians/${response.data._id}/upload-image`,
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
          alert(
            "Staff member saved, but image upload failed: " +
              uploadError.message
          );
        }
      }

      await loadData();
      setShowForm(false);
      setEditingStaff(null);
    } catch (error) {
      console.error("Save error:", error);
      throw error; // Let form handle error display
    }
  };

  const handleDelete = async (staffId) => {
    try {
      await api.delete(`/beauticians/${staffId}`);
      await loadData();
      setShowForm(false);
      setEditingStaff(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete staff member: " + error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  if (showForm) {
    return (
      <StaffForm
        staff={editingStaff}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={
          editingStaff ? () => handleDelete(editingStaff._id) : undefined
        }
      />
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
