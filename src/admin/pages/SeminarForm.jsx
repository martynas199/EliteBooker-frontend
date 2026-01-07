import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "../../tenant/pages/seminars.api";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import FormField from "../../shared/components/forms/FormField";

export default function SeminarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "Skincare",
    level: "Beginner",
    pricing: {
      price: "",
      currency: "GBP",
      earlyBirdPrice: "",
      earlyBirdDeadline: "",
    },
    location: {
      type: "physical",
      address: "",
      city: "",
      country: "",
      meetingLink: "",
    },
    requirements: "",
    whatYouWillLearn: "",
    sessions: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);

  useEffect(() => {
    loadSpecialists();
    if (isEditing) {
      loadSeminar();
    }
  }, [id]);

  const loadSpecialists = async () => {
    try {
      const response = await api.get("/specialists", {
        params: { limit: 1000 },
      });
      setSpecialists(response.data || []);
    } catch (error) {
      console.error("Failed to load specialists:", error);
    }
  };

  const loadSeminar = async () => {
    try {
      setLoading(true);
      const seminar = await SeminarsAPI.get(id);

      setFormData({
        title: seminar.title || "",
        shortDescription: seminar.shortDescription || "",
        description: seminar.description || "",
        category: seminar.category || "Skincare",
        level: seminar.level || "Beginner",
        pricing: {
          price: seminar.pricing?.price?.toString() || "",
          currency: seminar.pricing?.currency || "GBP",
          earlyBirdPrice: seminar.pricing?.earlyBirdPrice?.toString() || "",
          earlyBirdDeadline: seminar.pricing?.earlyBirdDeadline
            ? new Date(seminar.pricing.earlyBirdDeadline)
                .toISOString()
                .split("T")[0]
            : "",
        },
        location: {
          type: seminar.location?.type || "physical",
          address: seminar.location?.address || "",
          city: seminar.location?.city || "",
          country: seminar.location?.country || "",
          meetingLink: seminar.location?.meetingLink || "",
        },
        requirements: Array.isArray(seminar.requirements)
          ? seminar.requirements.join("\n")
          : "",
        whatYouWillLearn: Array.isArray(seminar.whatYouWillLearn)
          ? seminar.whatYouWillLearn.join("\n")
          : "",
        sessions: (seminar.sessions || []).map((session) => {
          // Parse the date and times correctly for the form inputs
          const sessionDate = new Date(session.date);
          const startTime = session.startTime || "";
          const endTime = session.endTime || "";

          return {
            date: sessionDate.toISOString().split("T")[0], // YYYY-MM-DD format
            startTime: startTime.length === 5 ? startTime : "", // HH:MM format
            endTime: endTime.length === 5 ? endTime : "", // HH:MM format
            maxAttendees: session.maxAttendees?.toString() || "",
            currentAttendees: session.currentAttendees || 0,
          };
        }),
      });

      // Set image preview - handle both string URL and object with url property
      const mainImage = seminar.images?.main;
      setImagePreview(
        typeof mainImage === "string"
          ? mainImage
          : mainImage?.url || null
      );

      // Set gallery images - handle both string URLs and objects with url property
      const galleryImages = seminar.images?.gallery || [];
      setExistingGalleryImages(
        galleryImages.map((img) =>
          typeof img === "string" ? img : img?.url || img
        )
      );
    } catch (error) {
      console.error("Failed to load seminar:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load seminar";

      toast.error(errorMessage);
      navigate("/admin/seminars");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(files);
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(previews).then(setGalleryPreviews);
  };

  const addSession = () => {
    setFormData({
      ...formData,
      sessions: [
        ...formData.sessions,
        {
          date: "",
          startTime: "",
          endTime: "",
          maxAttendees: 20,
          status: "scheduled",
        },
      ],
    });
  };

  const updateSession = (index, field, value) => {
    const updatedSessions = [...formData.sessions];
    updatedSessions[index] = { ...updatedSessions[index], [field]: value };
    setFormData({ ...formData, sessions: updatedSessions });
  };

  const removeSession = (index) => {
    setFormData({
      ...formData,
      sessions: formData.sessions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        toast.error("Title is required");
        setSubmitting(false);
        return;
      }

      if (formData.sessions.length === 0) {
        toast.error("Please add at least one session");
        setSubmitting(false);
        return;
      }

      // Validate sessions
      const validSessions = formData.sessions.filter(
        (s) => s.date && s.startTime && s.endTime && s.maxAttendees > 0
      );

      if (validSessions.length === 0) {
        toast.error("Please complete all session details");
        setSubmitting(false);
        return;
      }

      // Prepare data
      const data = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        category: formData.category,
        level: formData.level,
        pricing: {
          price: parseFloat(formData.pricing.price),
          currency: formData.pricing.currency,
          earlyBirdPrice: formData.pricing.earlyBirdPrice
            ? parseFloat(formData.pricing.earlyBirdPrice)
            : null,
          earlyBirdDeadline: formData.pricing.earlyBirdDeadline || null,
        },
        location: {
          type: formData.location.type,
          address: formData.location.address?.trim() || "",
          city: formData.location.city?.trim() || "",
          country: formData.location.country?.trim() || "",
          meetingLink: formData.location.meetingLink?.trim() || "",
        },
        requirements: formData.requirements
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r),
        whatYouWillLearn: formData.whatYouWillLearn
          .split("\n")
          .map((w) => w.trim())
          .filter((w) => w),
        sessions: validSessions.map((s) => ({
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          maxAttendees: parseInt(s.maxAttendees),
          status: s.status || "scheduled",
          // Preserve existing data if editing
          ...(s.sessionId && { sessionId: s.sessionId }),
          ...(s.currentAttendees !== undefined && {
            currentAttendees: s.currentAttendees,
          }),
        })),
      };

      let seminar;
      if (isEditing) {
        seminar = await SeminarsAPI.update(id, data);
        toast.success("Seminar updated successfully");
      } else {
        seminar = await SeminarsAPI.create(data);
        toast.success("Seminar created successfully");
      }

      // Upload images
      if (imageFile && seminar._id) {
        await SeminarsAPI.uploadImage(seminar._id, imageFile);
      }

      if (galleryFiles.length > 0 && seminar._id) {
        await SeminarsAPI.uploadImages(seminar._id, galleryFiles);
      }

      navigate("/admin/seminars");
    } catch (error) {
      console.error("Error saving seminar:", error);
      toast.error(error.response?.data?.message || "Failed to save seminar");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Seminar" : "Create Seminar"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? "Update seminar details and sessions"
              : "Create a new educational event"}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/admin/seminars")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <FormField label="Title" required>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Advanced Skincare Techniques Masterclass"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>

          <FormField label="Short Description" required>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              placeholder="Brief one-line summary"
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>

          <FormField label="Full Description" required>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed description of the seminar"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Category" required>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Skincare">Skincare</option>
                <option value="Makeup">Makeup</option>
                <option value="Hair Styling">Hair Styling</option>
                <option value="Nails">Nails</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
              </select>
            </FormField>

            <FormField label="Level" required>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Price" required>
              <input
                type="number"
                step="0.01"
                value={formData.pricing.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, price: e.target.value },
                  })
                }
                placeholder="99.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </FormField>

            <FormField label="Currency" required>
              <select
                value={formData.pricing.currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, currency: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Early Bird Price (Optional)">
              <input
                type="number"
                step="0.01"
                value={formData.pricing.earlyBirdPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      earlyBirdPrice: e.target.value,
                    },
                  })
                }
                placeholder="79.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Early Bird Deadline (Optional)">
              <input
                type="date"
                value={formData.pricing.earlyBirdDeadline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      earlyBirdDeadline: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>

          <FormField label="Location Type" required>
            <select
              value={formData.location.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, type: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="physical">Physical Location</option>
              <option value="virtual">Virtual (Online)</option>
              <option value="hybrid">Hybrid (Both)</option>
            </select>
          </FormField>

          {(formData.location.type === "physical" ||
            formData.location.type === "hybrid") && (
            <>
              <FormField label="Address">
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: e.target.value,
                      },
                    })
                  }
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="City">
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="London"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>

                <FormField label="Country">
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="United Kingdom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>
            </>
          )}

          {(formData.location.type === "virtual" ||
            formData.location.type === "hybrid") && (
            <FormField label="Meeting Link">
              <input
                type="url"
                value={formData.location.meetingLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      meetingLink: e.target.value,
                    },
                  })
                }
                placeholder="https://zoom.us/j/123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          )}
        </div>

        {/* Sessions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
            <Button type="button" onClick={addSession} variant="secondary">
              Add Session
            </Button>
          </div>

          {formData.sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No sessions added yet. Click "Add Session" to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.sessions.map((session, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">
                      Session {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeSession(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField label="Date" required>
                      <input
                        type="date"
                        value={session.date}
                        onChange={(e) =>
                          updateSession(index, "date", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </FormField>

                    <FormField label="Start Time" required>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) =>
                          updateSession(index, "startTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </FormField>

                    <FormField label="End Time" required>
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(e) =>
                          updateSession(index, "endTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </FormField>
                  </div>

                  <FormField label="Maximum Attendees" required>
                    <input
                      type="number"
                      value={session.maxAttendees}
                      onChange={(e) =>
                        updateSession(index, "maxAttendees", e.target.value)
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {session.currentAttendees !== undefined && (
                      <p className="text-sm text-gray-500 mt-1">
                        Current attendees: {session.currentAttendees}
                      </p>
                    )}
                  </FormField>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requirements & Learning Outcomes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Additional Details
          </h2>

          <FormField label="Requirements (one per line)">
            <textarea
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              placeholder="No prior experience required&#10;Bring your own materials&#10;Laptop recommended"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="What You Will Learn (one per line)">
            <textarea
              value={formData.whatYouWillLearn}
              onChange={(e) =>
                setFormData({ ...formData, whatYouWillLearn: e.target.value })
              }
              placeholder="Advanced skincare techniques&#10;Product formulation basics&#10;Client consultation skills"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Images</h2>

          <FormField label="Main Image">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 h-48 w-full object-cover rounded"
              />
            )}
          </FormField>

          <FormField label="Gallery Images (Multiple)">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {existingGalleryImages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                <div className="grid grid-cols-4 gap-2">
                  {existingGalleryImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="h-24 w-full object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
            {galleryPreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">New Images:</p>
                <div className="grid grid-cols-4 gap-2">
                  {galleryPreviews.map((preview, idx) => (
                    <img
                      key={idx}
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="h-24 w-full object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </FormField>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/seminars")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Saving..."
              : isEditing
              ? "Update Seminar"
              : "Create Seminar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
