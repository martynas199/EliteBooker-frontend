import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import Modal from "../../shared/components/ui/Modal";
import FormField from "../../shared/components/forms/FormField";
import toast from "react-hot-toast";
import { selectAdmin } from "../../shared/state/authSlice";
import AdminPageShell, { AdminSectionCard } from "../components/AdminPageShell";
import { queryKeys } from "../../shared/lib/queryClient";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Settings() {
  const admin = useSelector(selectAdmin);
  const tenantId = admin?.tenantId || "global";
  const [formData, setFormData] = useState({
    salonName: "",
    salonDescription: "",
    salonAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    salonPhone: "",
    salonEmail: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      tiktok: "",
      youtube: "",
      linkedin: "",
      x: "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [shareSettings, setShareSettings] = useState({
    shareTitle: "",
    shareDescription: "",
    shareImageUrl: "",
  });
  const [shareImageUploading, setShareImageUploading] = useState(false);

  // Working hours state
  const [workingHours, setWorkingHours] = useState([]);
  const [editWeeklyModalOpen, setEditWeeklyModalOpen] = useState(false);
  const [editingDayOfWeek, setEditingDayOfWeek] = useState(null);
  const [weeklyDayHours, setWeeklyDayHours] = useState([]);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  const {
    data: settingsPayload,
    isLoading: loading,
    isError: settingsLoadError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: queryKeys.admin.settings(tenantId),
    queryFn: async ({ signal }) => {
      const [settingsResponse, heroSectionsRes, tenantResponse] =
        await Promise.all([
          api.get("/settings", { signal }),
          api.get("/hero-sections", { signal }).catch(() => ({ data: [] })),
          admin?.tenantId
            ? api.get(`/tenants/${admin.tenantId}`, { signal }).catch(() => ({
                data: {},
              }))
            : Promise.resolve({ data: {} }),
        ]);

      return {
        settings: settingsResponse?.data || {},
        heroSections: Array.isArray(heroSectionsRes?.data)
          ? heroSectionsRes.data
          : [],
        tenant: tenantResponse?.data || {},
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const normalizeSocialLink = (value) => {
    const trimmedValue = String(value || "").trim();
    if (!trimmedValue) return "";
    if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;
    return `https://${trimmedValue}`;
  };

  useEffect(() => {
    if (!settingsLoadError) return;
    setMessage({
      type: "error",
      text: "Failed to load salon settings",
    });
  }, [settingsLoadError]);

  useEffect(() => {
    if (!settingsPayload) return;

    const settings = settingsPayload.settings || {};
    const heroSections = settingsPayload.heroSections || [];
    const tenant = settingsPayload.tenant || {};

    const activeHeroSection =
      heroSections.find((section) => section?.active) ||
      heroSections[0] ||
      null;
    const businessName = settings.salonName || "";
    const defaultShareTitle = businessName ? `Book with ${businessName}` : "";
    const defaultShareDescription =
      settings.salonDescription ||
      (businessName ? `Book with ${businessName} today.` : "");
    const defaultShareImageUrl =
      settings.heroImage?.url ||
      settings.heroImage ||
      activeHeroSection?.centerImage?.url ||
      activeHeroSection?.rightImage?.url ||
      "";

    setFormData({
      salonName: settings.salonName || "",
      salonDescription: settings.salonDescription || "",
      salonAddress: settings.salonAddress || {
        street: "",
        city: "",
        postalCode: "",
        country: "",
      },
      salonPhone: settings.salonPhone || "",
      salonEmail: settings.salonEmail || "",
      socialLinks: {
        instagram: settings.socialLinks?.instagram || "",
        facebook: settings.socialLinks?.facebook || "",
        tiktok: settings.socialLinks?.tiktok || "",
        youtube: settings.socialLinks?.youtube || "",
        linkedin: settings.socialLinks?.linkedin || "",
        x: settings.socialLinks?.x || "",
      },
    });

    const hours = settings.workingHours;
    if (hours) {
      const hoursArray = [];
      const dayMap = {
        sun: 0,
        mon: 1,
        tue: 2,
        wed: 3,
        thu: 4,
        fri: 5,
        sat: 6,
      };

      Object.entries(dayMap).forEach(([key, dayOfWeek]) => {
        if (hours[key] && hours[key].start && hours[key].end) {
          hoursArray.push({
            dayOfWeek,
            start: hours[key].start,
            end: hours[key].end,
          });
        }
      });

      setWorkingHours(hoursArray);
    } else {
      setWorkingHours([]);
    }

    setShareSettings({
      shareTitle: tenant.shareTitle || defaultShareTitle,
      shareDescription: tenant.shareDescription || defaultShareDescription,
      shareImageUrl: tenant.shareImageUrl || defaultShareImageUrl,
    });
  }, [settingsPayload]);

  // Open weekly schedule edit modal
  const openWeeklyEditModal = (dayOfWeek) => {
    setEditingDayOfWeek(dayOfWeek);
    const existingHours =
      workingHours.filter((wh) => wh.dayOfWeek === dayOfWeek) || [];

    if (existingHours.length > 0) {
      setWeeklyDayHours(existingHours);
    } else {
      setWeeklyDayHours([{ start: "09:00", end: "17:00" }]);
    }

    setEditWeeklyModalOpen(true);
  };

  // Add time slot for weekly schedule
  const addWeeklyTimeSlot = () => {
    setWeeklyDayHours([...weeklyDayHours, { start: "09:00", end: "17:00" }]);
  };

  // Remove time slot for weekly schedule
  const removeWeeklyTimeSlot = (index) => {
    setWeeklyDayHours(weeklyDayHours.filter((_, i) => i !== index));
  };

  // Update time slot for weekly schedule
  const updateWeeklyTimeSlot = (index, field, value) => {
    const updated = [...weeklyDayHours];
    updated[index][field] = value;
    setWeeklyDayHours(updated);
  };

  // Save weekly schedule
  const saveWeeklySchedule = async () => {
    if (editingDayOfWeek === null) return;

    try {
      // Remove existing hours for this day
      const otherDaysHours = workingHours.filter(
        (wh) => wh.dayOfWeek !== editingDayOfWeek,
      );

      // Add new hours for this day
      const newHours = weeklyDayHours
        .filter((h) => h.start && h.end)
        .map((h) => ({
          dayOfWeek: editingDayOfWeek,
          start: h.start,
          end: h.end,
        }));

      const updatedWorkingHours = [...otherDaysHours, ...newHours];

      // Convert to the format expected by backend (mon, tue, etc.)
      const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const workingHoursObject = {};

      dayMap.forEach((key, index) => {
        const dayHours = updatedWorkingHours.filter(
          (h) => h.dayOfWeek === index,
        );
        if (dayHours.length > 0) {
          // For now, just use the first time slot (backend format only supports one slot per day)
          workingHoursObject[key] = {
            start: dayHours[0].start,
            end: dayHours[0].end,
          };
        } else {
          workingHoursObject[key] = null;
        }
      });

      await api.patch("/settings", {
        workingHours: workingHoursObject,
      });

      // Update local state
      setWorkingHours(updatedWorkingHours);

      toast.success("Salon hours updated successfully");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to update salon hours:", error);
      toast.error(
        error.response?.data?.error || "Failed to update salon hours",
      );
    }
  };

  // Clear weekly schedule for a day
  const clearWeeklySchedule = async () => {
    if (editingDayOfWeek === null) return;

    try {
      // Remove all hours for this day
      const updatedWorkingHours = workingHours.filter(
        (wh) => wh.dayOfWeek !== editingDayOfWeek,
      );

      // Convert to backend format
      const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const workingHoursObject = {};

      dayMap.forEach((key, index) => {
        const dayHours = updatedWorkingHours.filter(
          (h) => h.dayOfWeek === index,
        );
        if (dayHours.length > 0) {
          workingHoursObject[key] = {
            start: dayHours[0].start,
            end: dayHours[0].end,
          };
        } else {
          workingHoursObject[key] = null;
        }
      });

      await api.patch("/settings", {
        workingHours: workingHoursObject,
      });

      // Update local state
      setWorkingHours(updatedWorkingHours);

      toast.success("Salon hours cleared for this day");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to clear salon hours:", error);
      toast.error(error.response?.data?.error || "Failed to clear salon hours");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleShareChange = (field, value) => {
    setShareSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleShareImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxSizeBytes) {
      toast.error("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setShareImageUploading(true);
    try {
      const payload = new FormData();
      payload.append("image", file);

      const response = await api.post("/settings/upload-hero", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = response?.data?.heroImage?.url;
      if (!uploadedUrl) {
        throw new Error("Uploaded image URL not returned");
      }

      setShareSettings((prev) => ({
        ...prev,
        shareImageUrl: uploadedUrl,
      }));
      toast.success("Share image uploaded");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to upload share image",
      );
    } finally {
      setShareImageUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Update settings
      await api.patch("/settings", {
        salonName: formData.salonName,
        salonDescription: formData.salonDescription,
        salonAddress: formData.salonAddress,
        salonPhone: formData.salonPhone,
        salonEmail: formData.salonEmail,
        socialLinks: {
          instagram: normalizeSocialLink(formData.socialLinks.instagram),
          facebook: normalizeSocialLink(formData.socialLinks.facebook),
          tiktok: normalizeSocialLink(formData.socialLinks.tiktok),
          youtube: normalizeSocialLink(formData.socialLinks.youtube),
          linkedin: normalizeSocialLink(formData.socialLinks.linkedin),
          x: normalizeSocialLink(formData.socialLinks.x),
        },
      });

      if (admin?.tenantId) {
        await api.put(`/tenants/${admin.tenantId}`, {
          shareTitle: shareSettings.shareTitle,
          shareDescription: shareSettings.shareDescription,
          shareImageUrl: shareSettings.shareImageUrl,
        });
      }

      setMessage({
        type: "success",
        text: "Salon settings saved successfully!",
      });

      // Reload settings to get the updated data
      await refetchSettings();

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const workingHoursSummary = useMemo(() => {
    const daySlots = DAY_NAMES.map((_, dayOfWeek) =>
      workingHours.filter((wh) => wh.dayOfWeek === dayOfWeek),
    );
    const openDays = daySlots.filter((slots) => slots.length > 0).length;
    const totalTimeSlots = daySlots.reduce(
      (sum, slots) => sum + slots.length,
      0,
    );

    return {
      openDays,
      closedDays: DAY_NAMES.length - openDays,
      totalTimeSlots,
    };
  }, [workingHours]);

  return (
    <AdminPageShell
      title="Contact Page / Business Details"
      description="Manage your business contact information, opening hours, and details shown on the contact page."
      maxWidth="md"
    >
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-8 text-center text-sm font-medium text-gray-600 shadow-sm">
          Loading settings...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Contact Information Form */}
          <AdminSectionCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Contact Information</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This information is displayed on your public contact page and
              throughout your website.
            </p>

            <div className="space-y-4">
              {/* Salon Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.salonName}
                  onChange={(e) => handleChange("salonName", e.target.value)}
                  placeholder="e.g., Your Business Name"
                  className={inputClass}
                  style={{ fontSize: "16px" }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <textarea
                  value={formData.salonDescription}
                  onChange={(e) =>
                    handleChange("salonDescription", e.target.value)
                  }
                  placeholder="Describe your business in a few sentences..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Address
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.salonAddress.street}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salonAddress: {
                          ...prev.salonAddress,
                          street: e.target.value,
                        },
                      }))
                    }
                    placeholder="Street Address"
                    className={inputClass}
                    style={{ fontSize: "16px" }}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={formData.salonAddress.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          salonAddress: {
                            ...prev.salonAddress,
                            city: e.target.value,
                          },
                        }))
                      }
                      placeholder="City"
                      className={inputClass}
                      style={{ fontSize: "16px" }}
                    />
                    <input
                      type="text"
                      value={formData.salonAddress.postalCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          salonAddress: {
                            ...prev.salonAddress,
                            postalCode: e.target.value,
                          },
                        }))
                      }
                      placeholder="Postal Code"
                      className={inputClass}
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.salonAddress.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salonAddress: {
                          ...prev.salonAddress,
                          country: e.target.value,
                        },
                      }))
                    }
                    placeholder="Country"
                    className={inputClass}
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.salonPhone}
                    onChange={(e) => handleChange("salonPhone", e.target.value)}
                    placeholder="e.g., +44 20 1234 5678"
                    className={inputClass}
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.salonEmail}
                    onChange={(e) => handleChange("salonEmail", e.target.value)}
                    placeholder="e.g., info@salon.com"
                    className={inputClass}
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard id="share-settings">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101"
                />
              </svg>
              <span>Share Settings</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Control the title, description, and image used in social link
              previews.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Title
                </label>
                <input
                  type="text"
                  value={shareSettings.shareTitle}
                  onChange={(e) =>
                    handleShareChange("shareTitle", e.target.value)
                  }
                  placeholder="e.g., Book with London Lash & Beauty"
                  className={inputClass}
                  maxLength={120}
                  style={{ fontSize: "16px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Description
                </label>
                <textarea
                  value={shareSettings.shareDescription}
                  onChange={(e) =>
                    handleShareChange("shareDescription", e.target.value)
                  }
                  placeholder="Short text shown in WhatsApp/Facebook link previews"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  maxLength={240}
                  style={{ fontSize: "16px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Image URL
                </label>
                <input
                  type="url"
                  value={shareSettings.shareImageUrl}
                  onChange={(e) =>
                    handleShareChange("shareImageUrl", e.target.value)
                  }
                  placeholder="https://..."
                  className={inputClass}
                  style={{ fontSize: "16px" }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Recommended size: 1200×630, JPG/PNG/WebP, max 5MB.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Share Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleShareImageUpload}
                  disabled={shareImageUploading || saving}
                  className="w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
                />
                {shareImageUploading && (
                  <p className="mt-2 text-xs text-gray-500">
                    Uploading image...
                  </p>
                )}
              </div>

              {shareSettings.shareImageUrl && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-700">
                    Current Share Preview Image
                  </p>
                  <img
                    src={shareSettings.shareImageUrl}
                    alt="Share preview"
                    className="h-32 w-full rounded-md object-cover sm:h-40"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </AdminSectionCard>

          <AdminSectionCard id="social-links">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-4v4m0-4v-4m0 4h-4m4 0h4M3 10a2 2 0 012-2h2"
                />
              </svg>
              <span>Social Media Links</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              These links are displayed on your public footer. Add full URLs or
              usernames (we&apos;ll auto-prefix with https://).
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { key: "instagram", label: "Instagram" },
                { key: "facebook", label: "Facebook" },
                { key: "tiktok", label: "TikTok" },
                { key: "youtube", label: "YouTube" },
                { key: "linkedin", label: "LinkedIn" },
                { key: "x", label: "X (Twitter)" },
              ].map((socialField) => (
                <div key={socialField.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {socialField.label}
                  </label>
                  <input
                    type="text"
                    value={formData.socialLinks[socialField.key]}
                    onChange={(event) =>
                      handleSocialLinkChange(
                        socialField.key,
                        event.target.value,
                      )
                    }
                    placeholder={`https://${socialField.key}.com/...`}
                    className={inputClass}
                    style={{ fontSize: "16px" }}
                  />
                </div>
              ))}
            </div>
          </AdminSectionCard>

          {/* Salon Working Hours */}
          <AdminSectionCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Business Working Hours</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Set the default operating hours for your business. These hours are
              displayed to customers on the website.
            </p>

            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Open Days
                </p>
                <p className="mt-1 text-lg font-semibold text-green-700">
                  {workingHoursSummary.openDays}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Closed Days
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-700">
                  {workingHoursSummary.closedDays}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Time Slots
                </p>
                <p className="mt-1 text-lg font-semibold text-brand-700">
                  {workingHoursSummary.totalTimeSlots}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {DAY_NAMES.map((dayName, dayOfWeek) => {
                const dayHours =
                  workingHours.filter((wh) => wh.dayOfWeek === dayOfWeek) || [];

                return (
                  <div
                    key={dayOfWeek}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-700 w-20 sm:w-28 text-sm sm:text-base">
                      {dayName}
                    </span>
                    <div className="flex-1 min-w-0">
                      {dayHours.length === 0 ? (
                        <span className="text-gray-600 text-xs sm:text-sm">
                          Not working
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {dayHours.map((h, idx) => (
                            <span
                              key={idx}
                              className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 whitespace-nowrap"
                            >
                              {h.start} - {h.end}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openWeeklyEditModal(dayOfWeek)}
                      className="ml-2 rounded border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:px-3 sm:text-sm whitespace-nowrap flex-shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          </AdminSectionCard>

          {/* Message */}
          {message.text && (
            <div
              className={`rounded-lg border p-4 text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <div className="sticky bottom-0 z-20 -mx-1 border-t border-gray-200 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-3 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:shadow-none">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                onClick={() => refetchSettings()}
                variant="outline"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                loading={saving}
                variant="brand"
                className="w-full sm:w-auto"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Weekly Schedule Modal */}
      <Modal
        open={editWeeklyModalOpen}
        onClose={() => setEditWeeklyModalOpen(false)}
        variant="dashboard"
        title={
          editingDayOfWeek !== null
            ? `Edit ${DAY_NAMES[editingDayOfWeek]} Hours`
            : "Edit Hours"
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Business Hours:</strong> These hours are displayed to
              customers on your website.
            </p>
          </div>

          {weeklyDayHours.map((slot, index) => (
            <div
              key={index}
              className="flex items-end gap-3 pb-3 border-b last:border-b-0"
            >
              <FormField
                label={`Time Slot ${index + 1}`}
                htmlFor={`salon-start-${index}`}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    id={`salon-start-${index}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    style={{ fontSize: "16px" }}
                    value={slot.start}
                    onChange={(e) =>
                      updateWeeklyTimeSlot(index, "start", e.target.value)
                    }
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="time"
                    id={`salon-end-${index}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    style={{ fontSize: "16px" }}
                    value={slot.end}
                    onChange={(e) =>
                      updateWeeklyTimeSlot(index, "end", e.target.value)
                    }
                  />
                </div>
              </FormField>
              {weeklyDayHours.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWeeklyTimeSlot(index)}
                  className="rounded border border-red-200 px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-700 transition-colors hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addWeeklyTimeSlot}
            className="w-full rounded-lg border border-brand-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            + Add Another Time Slot
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={clearWeeklySchedule}
              className="order-2 rounded px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-700 transition-colors hover:bg-red-50 sm:order-1"
            >
              Clear Hours
            </button>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => setEditWeeklyModalOpen(false)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={saveWeeklySchedule}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Save Hours
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </AdminPageShell>
  );
}
