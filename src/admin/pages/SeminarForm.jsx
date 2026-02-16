import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "../../tenant/pages/seminars.api";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import FormField from "../../shared/components/forms/FormField";
import UnsavedChangesModal from "../../shared/components/forms/UnsavedChangesModal";
import AdminPageShell, {
  AdminSectionCard,
} from "../components/AdminPageShell";

const inputClassName =
  "w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200";
const textareaClassName = `${inputClassName} min-h-[120px]`;

const createDefaultSeminarForm = () => ({
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

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const buildDraftSnapshot = ({
  formData,
  imageFile,
  imagePreview,
  galleryFiles,
  existingGalleryImages,
}) =>
  JSON.stringify({
    formData,
    imagePreview,
    imageFile: imageFile
      ? {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          lastModified: imageFile.lastModified,
        }
      : null,
    galleryFiles: galleryFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    })),
    existingGalleryImages,
  });

export default function SeminarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    ...createDefaultSeminarForm(),
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    buildDraftSnapshot({
      formData: createDefaultSeminarForm(),
      imageFile: null,
      imagePreview: null,
      galleryFiles: [],
      existingGalleryImages: [],
    })
  );
  const [savedDraft, setSavedDraft] = useState(() => ({
    formData: createDefaultSeminarForm(),
    imagePreview: null,
    existingGalleryImages: [],
  }));

  useEffect(() => {
    loadSpecialists();
    if (isEditing) {
      loadSeminar();
      return;
    }

    const initialFormData = createDefaultSeminarForm();
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingGalleryImages([]);

    setSavedDraft({
      formData: cloneValue(initialFormData),
      imagePreview: null,
      existingGalleryImages: [],
    });

    setSavedSnapshot(
      buildDraftSnapshot({
        formData: initialFormData,
        imageFile: null,
        imagePreview: null,
        galleryFiles: [],
        existingGalleryImages: [],
      })
    );
  }, [id]);

  const hasUnsavedChanges = useMemo(
    () =>
      buildDraftSnapshot({
        formData,
        imageFile,
        imagePreview,
        galleryFiles,
        existingGalleryImages,
      }) !== savedSnapshot,
    [
      formData,
      imageFile,
      imagePreview,
      galleryFiles,
      existingGalleryImages,
      savedSnapshot,
    ]
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
        sessions: (seminar.sessions || []).map((session) => ({
          sessionId: session._id,
          date: new Date(session.date).toISOString().split("T")[0],
          startTime: session.startTime?.length === 5 ? session.startTime : "",
          endTime: session.endTime?.length === 5 ? session.endTime : "",
          maxAttendees: session.maxAttendees?.toString() || "",
          currentAttendees: session.currentAttendees || 0,
          status: session.status || "scheduled",
        })),
      });

      const mainImage = seminar.images?.main;
      setImagePreview(
        typeof mainImage === "string" ? mainImage : mainImage?.url || null
      );

      const galleryImages = seminar.images?.gallery || [];
      setExistingGalleryImages(
        galleryImages.map((img) =>
          typeof img === "string" ? img : img?.url || img
        )
      );

      const initialFormData = {
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
        sessions: (seminar.sessions || []).map((session) => ({
          sessionId: session._id,
          date: new Date(session.date).toISOString().split("T")[0],
          startTime: session.startTime?.length === 5 ? session.startTime : "",
          endTime: session.endTime?.length === 5 ? session.endTime : "",
          maxAttendees: session.maxAttendees?.toString() || "",
          currentAttendees: session.currentAttendees || 0,
          status: session.status || "scheduled",
        })),
      };

      const mainImagePreview =
        typeof mainImage === "string" ? mainImage : mainImage?.url || null;

      const normalizedExistingGalleryImages = galleryImages.map((img) =>
        typeof img === "string" ? img : img?.url || img
      );

      setSavedDraft({
        formData: cloneValue(initialFormData),
        imagePreview: mainImagePreview,
        existingGalleryImages: cloneValue(normalizedExistingGalleryImages),
      });
      setSavedSnapshot(
        buildDraftSnapshot({
          formData: initialFormData,
          imageFile: null,
          imagePreview: mainImagePreview,
          galleryFiles: [],
          existingGalleryImages: normalizedExistingGalleryImages,
        })
      );
    } catch (error) {
      console.error("Failed to load seminar:", error);
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

  const handleResetChanges = () => {
    setFormData(cloneValue(savedDraft.formData));
    setImageFile(null);
    setImagePreview(savedDraft.imagePreview);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingGalleryImages(cloneValue(savedDraft.existingGalleryImages));
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
      return;
    }

    navigate("/admin/seminars");
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    navigate("/admin/seminars");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles(files);

    const previews = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(previews).then(setGalleryPreviews);
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePricingField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }));
  };

  const updateLocationField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const addSession = () => {
    setFormData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          date: "",
          startTime: "",
          endTime: "",
          maxAttendees: 20,
          status: "scheduled",
        },
      ],
    }));
  };

  const updateSession = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.sessions];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, sessions: next };
    });
  };

  const removeSession = (index) => {
    setFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, sessionIndex) => sessionIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
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

      const validSessions = formData.sessions.filter(
        (session) =>
          session.date &&
          session.startTime &&
          session.endTime &&
          Number(session.maxAttendees) > 0
      );

      if (validSessions.length === 0) {
        toast.error("Please complete all session details");
        setSubmitting(false);
        return;
      }

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
          .map((requirement) => requirement.trim())
          .filter(Boolean),
        whatYouWillLearn: formData.whatYouWillLearn
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        sessions: validSessions.map((session) => ({
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          maxAttendees: parseInt(session.maxAttendees, 10),
          status: session.status || "scheduled",
          ...(session.sessionId && { sessionId: session.sessionId }),
          ...(session.currentAttendees !== undefined && {
            currentAttendees: session.currentAttendees,
          }),
        })),
      };

      let result;
      if (isEditing) {
        result = await SeminarsAPI.update(id, data);
        toast.success("Seminar updated successfully");
      } else {
        result = await SeminarsAPI.create(data);
        toast.success("Seminar created successfully");
      }

      const seminarId = result.seminar?._id || result._id || id;

      if (imageFile && seminarId) {
        await SeminarsAPI.uploadImage(seminarId, imageFile);
        toast.success("Image uploaded successfully");
      }

      if (galleryFiles.length > 0 && seminarId) {
        await SeminarsAPI.uploadImages(seminarId, galleryFiles);
        toast.success("Gallery images uploaded successfully");
      }

      setSavedDraft({
        formData: cloneValue(formData),
        imagePreview,
        existingGalleryImages: cloneValue(existingGalleryImages),
      });
      setSavedSnapshot(
        buildDraftSnapshot({
          formData,
          imageFile: null,
          imagePreview,
          galleryFiles: [],
          existingGalleryImages,
        })
      );

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
      <AdminPageShell
        title={isEditing ? "Edit Seminar" : "Create Seminar"}
        description="Set up event details and sessions."
        maxWidth="xl"
      >
        <AdminSectionCard className="flex items-center justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        </AdminSectionCard>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={isEditing ? "Edit Seminar" : "Create Seminar"}
      description={
        isEditing
          ? "Update seminar details, schedule, and pricing."
          : "Create a new educational event with sessions and ticket details."
      }
      action={
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
        >
          Back to seminars
        </Button>
      }
      maxWidth="xl"
      contentClassName="space-y-4 sm:space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {hasUnsavedChanges && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You have unsaved changes.
          </div>
        )}

        <AdminSectionCard className="space-y-4 sm:space-y-5" padding="p-4 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              {specialists.length} specialists currently available in your team.
            </p>
          </div>

          <FormField label="Title" required>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => updateFormField("title", event.target.value)}
              placeholder="e.g., Advanced Skincare Techniques Masterclass"
              className={inputClassName}
              required
            />
          </FormField>

          <FormField label="Short Description" required>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(event) =>
                updateFormField("shortDescription", event.target.value)
              }
              placeholder="Brief one-line summary"
              maxLength={200}
              className={inputClassName}
              required
            />
          </FormField>

          <FormField label="Full Description" required>
            <textarea
              value={formData.description}
              onChange={(event) =>
                updateFormField("description", event.target.value)
              }
              placeholder="Detailed description of the seminar"
              rows={6}
              className={textareaClassName}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Category" required>
              <select
                value={formData.category}
                onChange={(event) =>
                  updateFormField("category", event.target.value)
                }
                className={inputClassName}
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
                onChange={(event) => updateFormField("level", event.target.value)}
                className={inputClassName}
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </FormField>
          </div>
        </AdminSectionCard>

        <AdminSectionCard className="space-y-4 sm:space-y-5" padding="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Price" required>
              <input
                type="number"
                step="0.01"
                value={formData.pricing.price}
                onChange={(event) =>
                  updatePricingField("price", event.target.value)
                }
                placeholder="99.99"
                className={inputClassName}
                required
              />
            </FormField>

            <FormField label="Currency" required>
              <select
                value={formData.pricing.currency}
                onChange={(event) =>
                  updatePricingField("currency", event.target.value)
                }
                className={inputClassName}
                required
              >
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Early Bird Price (Optional)">
              <input
                type="number"
                step="0.01"
                value={formData.pricing.earlyBirdPrice}
                onChange={(event) =>
                  updatePricingField("earlyBirdPrice", event.target.value)
                }
                placeholder="79.99"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Early Bird Deadline (Optional)">
              <input
                type="date"
                value={formData.pricing.earlyBirdDeadline}
                onChange={(event) =>
                  updatePricingField("earlyBirdDeadline", event.target.value)
                }
                className={inputClassName}
              />
            </FormField>
          </div>
        </AdminSectionCard>

        <AdminSectionCard className="space-y-4 sm:space-y-5" padding="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Location</h2>

          <FormField label="Location Type" required>
            <select
              value={formData.location.type}
              onChange={(event) =>
                updateLocationField("type", event.target.value)
              }
              className={inputClassName}
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
                  onChange={(event) =>
                    updateLocationField("address", event.target.value)
                  }
                  placeholder="123 Main Street"
                  className={inputClassName}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="City">
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(event) =>
                      updateLocationField("city", event.target.value)
                    }
                    placeholder="London"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Country">
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(event) =>
                      updateLocationField("country", event.target.value)
                    }
                    placeholder="United Kingdom"
                    className={inputClassName}
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
                onChange={(event) =>
                  updateLocationField("meetingLink", event.target.value)
                }
                placeholder="https://zoom.us/j/123456789"
                className={inputClassName}
              />
            </FormField>
          )}
        </AdminSectionCard>

        <AdminSectionCard className="space-y-4 sm:space-y-5" padding="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
            <Button type="button" onClick={addSession} variant="outline">
              Add Session
            </Button>
          </div>

          {formData.sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
              No sessions added yet. Click "Add Session" to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.sessions.map((session, index) => (
                <div
                  key={session.sessionId || index}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-slate-900">
                      Session {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeSession(index)}
                      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <FormField label="Date" required>
                      <input
                        type="date"
                        value={session.date}
                        onChange={(event) =>
                          updateSession(index, "date", event.target.value)
                        }
                        className={inputClassName}
                        required
                      />
                    </FormField>

                    <FormField label="Start Time" required>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(event) =>
                          updateSession(index, "startTime", event.target.value)
                        }
                        className={inputClassName}
                        required
                      />
                    </FormField>

                    <FormField label="End Time" required>
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(event) =>
                          updateSession(index, "endTime", event.target.value)
                        }
                        className={inputClassName}
                        required
                      />
                    </FormField>
                  </div>

                  <FormField label="Maximum Attendees" required>
                    <input
                      type="number"
                      value={session.maxAttendees}
                      onChange={(event) =>
                        updateSession(index, "maxAttendees", event.target.value)
                      }
                      min="1"
                      className={inputClassName}
                      required
                    />
                    {session.currentAttendees !== undefined && (
                      <p className="mt-1 text-xs text-slate-500">
                        Current attendees: {session.currentAttendees}
                      </p>
                    )}
                  </FormField>
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>

        <AdminSectionCard className="space-y-4 sm:space-y-5" padding="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Additional Details
          </h2>

          <FormField label="Requirements (one per line)">
            <textarea
              value={formData.requirements}
              onChange={(event) =>
                updateFormField("requirements", event.target.value)
              }
              placeholder="No prior experience required&#10;Bring your own materials&#10;Laptop recommended"
              rows={4}
              className={textareaClassName}
            />
          </FormField>

          <FormField label="What You Will Learn (one per line)">
            <textarea
              value={formData.whatYouWillLearn}
              onChange={(event) =>
                updateFormField("whatYouWillLearn", event.target.value)
              }
              placeholder="Advanced skincare techniques&#10;Product formulation basics&#10;Client consultation skills"
              rows={4}
              className={textareaClassName}
            />
          </FormField>
        </AdminSectionCard>

        <AdminSectionCard className="space-y-4 sm:space-y-5" padding="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Images</h2>

          <FormField label="Main Image">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={inputClassName}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 h-48 w-full rounded-2xl border border-slate-200 object-cover"
              />
            )}
          </FormField>

          <FormField label="Gallery Images (Multiple)">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className={inputClassName}
            />

            {existingGalleryImages.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-slate-600">Existing Images:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {existingGalleryImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="h-24 w-full rounded-xl border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {galleryPreviews.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-slate-600">New Images:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {galleryPreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full rounded-xl border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </FormField>
        </AdminSectionCard>

        <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges || submitting}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={submitting || !hasUnsavedChanges}
            >
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update Seminar"
                  : "Create Seminar"}
            </Button>
          </div>
        </div>
      </form>

      <UnsavedChangesModal
        isOpen={showDiscardModal}
        onStay={() => setShowDiscardModal(false)}
        onDiscard={handleDiscardChanges}
      />
    </AdminPageShell>
  );
}
