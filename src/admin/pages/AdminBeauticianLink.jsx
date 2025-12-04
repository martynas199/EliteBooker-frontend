import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import Card from "../../shared/components/ui/Card";
import Input from "../../shared/components/ui/Input";
import toast from "react-hot-toast";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { selectAdmin } from "../../shared/state/authSlice";

export default function AdminBeauticianLink() {
  const currentAdmin = useSelector(selectAdmin);
  const [admins, setAdmins] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedBeautician, setSelectedBeautician] = useState("");
  const [linking, setLinking] = useState(false);
  const [searchAdmin, setSearchAdmin] = useState("");
  const [searchBeautician, setSearchBeautician] = useState("");

  // Debounce search inputs to avoid excessive re-renders
  const debouncedAdminSearch = useDebounce(searchAdmin, 300);
  const debouncedBeauticianSearch = useDebounce(searchBeautician, 300);

  // Create admin form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    beauticianId: "",
  });

  useEffect(() => {
    console.log(
      "AdminBeauticianLink mounted with current admin:",
      currentAdmin
    );
    console.log("Auth token:", localStorage.getItem("authToken"));
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading admin data...", { currentAdmin });

      // Fetch admins and beauticians in parallel - API client handles auth automatically
      const [adminsRes, beauticiansRes] = await Promise.all([
        api.get("/admin/admins"),
        api.get("/beauticians", { params: { limit: 1000 } }),
      ]);

      console.log("Loaded admins:", adminsRes.data);
      setAdmins(adminsRes.data || []);
      setBeauticians(beauticiansRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load admins and beauticians");
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedAdmin || !selectedBeautician) {
      toast.error("Please select both an admin and a beautician");
      return;
    }

    setLinking(true);
    try {
      await api.patch(`/admin/admins/${selectedAdmin}/link-beautician`, {
        beauticianId: selectedBeautician,
      });

      toast.success("Successfully linked admin to beautician!");
      loadData(); // Reload to show updated links
      setSelectedAdmin("");
      setSelectedBeautician("");
    } catch (error) {
      console.error("Failed to link:", error);
      toast.error(
        error.response?.data?.error || "Failed to link admin to beautician"
      );
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (adminId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">
            Are you sure you want to unlink this admin from their beautician?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performUnlink(adminId);
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            >
              Yes, Unlink
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const performUnlink = async (adminId) => {
    try {
      await api.patch(`/admin/admins/${adminId}/link-beautician`, {
        beauticianId: null,
      });

      toast.success("Successfully unlinked admin from beautician");
      loadData();
    } catch (error) {
      console.error("Failed to unlink:", error);
      toast.error("Failed to unlink admin");
    }
  };

  const handleDelete = async (admin) => {
    // Check if user is trying to delete themselves
    if (currentAdmin?.id === admin._id || currentAdmin?._id === admin._id) {
      toast.error("You cannot delete your own admin account");
      return;
    }

    // Check if current user has permission (only super_admin can delete admins)
    if (currentAdmin?.role !== "super_admin") {
      toast.error("Only super administrators can delete admin accounts");
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">Delete admin account "{admin.name}"?</p>
          <p className="text-sm text-gray-600">
            This will permanently delete the admin account. This action cannot
            be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performDelete(admin._id);
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const performDelete = async (adminId) => {
    // Dismiss any existing toasts first to prevent overlap
    toast.dismiss();

    try {
      console.log("=== DELETE ADMIN DEBUG INFO ===");
      console.log("Attempting to delete admin with ID:", adminId);
      console.log("Current admin:", currentAdmin);
      console.log("Auth token:", localStorage.getItem("authToken"));

      // Check token exists
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found!");
        throw new Error("Authentication required. Please log in again.");
      }

      console.log("Making DELETE request to:", `/admin/admins/${adminId}`);
      console.log("With headers:", {
        Authorization: `Bearer ${token.substring(0, 20)}...`,
      });

      // Make the delete request with explicit headers
      const response = await api.delete(`/admin/admins/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response:", response);
      console.log("Delete successful!");

      toast.success("Admin account deleted successfully", {
        duration: 3000,
        icon: "✅",
      });

      // Reload the data
      console.log("Reloading admin list...");
      await loadData();
      console.log("Admin list reloaded successfully");
    } catch (error) {
      console.error("Failed to delete admin - Full error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);

      // More descriptive error messages
      let errorMessage = "Failed to delete admin account";

      if (error.response) {
        // Server responded with error
        console.log("Server error status:", error.response.status);
        console.log("Server error data:", error.response.data);

        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage =
            "Permission denied. You don't have permission to delete this admin.";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  // Unlock admin account
  const handleUnlock = async (admin) => {
    // Check if current user has permission (only super_admin can unlock accounts)
    if (currentAdmin?.role !== "super_admin") {
      toast.error("Only super administrators can unlock accounts");
      return;
    }

    // Check if account is actually locked
    if (!admin.isLocked) {
      toast.error("This account is not locked");
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">Unlock admin account "{admin.name}"?</p>
          <p className="text-sm text-gray-600">
            This will reset failed login attempts and allow the user to log in
            immediately.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performUnlock(admin._id);
              }}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
            >
              Yes, Unlock
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const performUnlock = async (adminId) => {
    toast.dismiss();

    try {
      console.log("Unlocking admin account:", adminId);

      const response = await api.post(`/admin/admins/${adminId}/unlock`);

      console.log("Unlock response:", response);

      toast.success("Account unlocked successfully! User can now log in.", {
        duration: 4000,
        icon: "🔓",
      });

      // Reload the data to update lock status
      await loadData();
    } catch (error) {
      console.error("Failed to unlock admin:", error);

      let errorMessage = "Failed to unlock account";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    // Validation
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newAdmin.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setCreating(true);
    try {
      await api.post("/admin/admins", {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password,
        role: newAdmin.role,
        beauticianId: newAdmin.beauticianId || null,
      });

      toast.success("Admin created successfully!");
      setShowCreateForm(false);
      setNewAdmin({
        name: "",
        email: "",
        password: "",
        role: "admin",
        beauticianId: "",
      });
      loadData(); // Reload admins list
    } catch (error) {
      console.error("Failed to create admin:", error);
      toast.error(error.response?.data?.error || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const getBeauticianName = (beauticianId) => {
    const beautician = beauticians.find((b) => b._id === beauticianId);
    return beautician ? beautician.name : "Unknown";
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(debouncedAdminSearch.toLowerCase()) ||
      admin.email.toLowerCase().includes(debouncedAdminSearch.toLowerCase())
  );

  const filteredBeauticians = beauticians.filter(
    (beautician) =>
      beautician.name
        .toLowerCase()
        .includes(debouncedBeauticianSearch.toLowerCase()) ||
      (beautician.email || "")
        .toLowerCase()
        .includes(debouncedBeauticianSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-wide">
            Admin Management
          </h1>
          <p className="mt-2 text-gray-600 font-light">
            Create admin accounts and link them to beautician profiles
          </p>
        </div>
        <Button
          variant="brand"
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="whitespace-nowrap"
        >
          {showCreateForm ? "Cancel" : "+ Create New Admin"}
        </Button>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <Card className="p-6 border-4 border-brand-400 shadow-lg">
          <h2 className="text-xl font-serif font-semibold mb-4 tracking-wide">
            Create New Admin Account
          </h2>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter admin name"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                    minLength={8}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Link to Beautician (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Beautician (Optional)
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  value={newAdmin.beauticianId}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, beauticianId: e.target.value })
                  }
                >
                  <option value="">None - No beautician link</option>
                  {beauticians.map((beautician) => (
                    <option key={beautician._id} value={beautician._id}>
                      {beautician.name}{" "}
                      {beautician.email ? `(${beautician.email})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Link this admin to a beautician for Stripe Connect management
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="brand"
                loading={creating}
                disabled={creating}
                fullWidth
              >
                Create Admin Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewAdmin({
                    name: "",
                    email: "",
                    password: "",
                    role: "admin",
                    beauticianId: "",
                  });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Link Existing Admin to Beautician */}
      <Card className="p-6">
        <h2 className="text-xl font-serif font-semibold mb-4 tracking-wide">
          Link Existing Admin to Beautician
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Select Admin */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Admin
            </label>
            <Input
              placeholder="Search admin by name or email..."
              value={searchAdmin}
              onChange={(e) => setSearchAdmin(e.target.value)}
              className="mb-2"
            />
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredAdmins.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No admins found
                </div>
              ) : (
                filteredAdmins.map((admin) => (
                  <button
                    key={admin._id}
                    onClick={() => setSelectedAdmin(admin._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-brand-50 transition-colors ${
                      selectedAdmin === admin._id
                        ? "bg-brand-100 border-l-4 border-l-brand-600"
                        : ""
                    }`}
                  >
                    <div className="font-medium">{admin.name}</div>
                    <div className="text-sm text-gray-600">{admin.email}</div>
                    {admin.beauticianId && (
                      <div className="text-xs text-brand-700 mt-1">
                        Currently linked to:{" "}
                        {getBeauticianName(admin.beauticianId)}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Select Beautician */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Beautician
            </label>
            <Input
              placeholder="Search beautician by name or email..."
              value={searchBeautician}
              onChange={(e) => setSearchBeautician(e.target.value)}
              className="mb-2"
            />
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredBeauticians.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No beauticians found
                </div>
              ) : (
                filteredBeauticians.map((beautician) => (
                  <button
                    key={beautician._id}
                    onClick={() => setSelectedBeautician(beautician._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-brand-50 transition-colors ${
                      selectedBeautician === beautician._id
                        ? "bg-brand-100 border-l-4 border-l-brand-600"
                        : ""
                    }`}
                  >
                    <div className="font-medium">{beautician.name}</div>
                    <div className="text-sm text-gray-600">
                      {beautician.email || "No email"}
                    </div>
                    {beautician.specialty && (
                      <div className="text-xs text-gray-500 mt-1">
                        Specialty: {beautician.specialty}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Link Button */}
        <div className="mt-6">
          <Button
            variant="brand"
            onClick={handleLink}
            loading={linking}
            disabled={!selectedAdmin || !selectedBeautician}
            fullWidth
          >
            Link Admin to Beautician
          </Button>
          {selectedAdmin && selectedBeautician && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Linking: {admins.find((a) => a._id === selectedAdmin)?.name} →{" "}
              {beauticians.find((b) => b._id === selectedBeautician)?.name}
            </p>
          )}
        </div>
      </Card>

      {/* Current Links */}
      <Card className="p-4 sm:p-6 overflow-hidden">
        <h2 className="text-lg sm:text-xl font-serif font-semibold mb-4 tracking-wide break-words">
          Current Links
        </h2>
        <div className="space-y-3">
          {admins.filter((admin) => admin.beauticianId).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <p className="font-medium">No links created yet</p>
              <p className="text-sm">
                Use the form above to link an admin to a beautician
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Linked Beautician
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins
                    .filter((admin) => admin.beauticianId)
                    .map((admin) => {
                      const beautician = beauticians.find(
                        (b) => b._id === admin.beauticianId
                      );
                      return (
                        <tr key={admin._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4">
                            <div className="font-medium text-gray-900 text-sm break-words">
                              {admin.name}
                            </div>
                            <div className="sm:hidden text-xs text-gray-600 mt-1 break-all">
                              {admin.email}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 break-all">
                              {admin.email}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="font-medium text-brand-700 text-sm break-words">
                              {beautician?.name || "Unknown"}
                            </div>
                            {beautician?.email && (
                              <div className="text-xs text-gray-500 break-all">
                                {beautician.email}
                              </div>
                            )}
                            <span className="md:hidden inline-flex mt-1 px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Linked
                            </span>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Linked
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right text-sm">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUnlink(admin._id)}
                              className="text-xs sm:text-sm"
                            >
                              Unlink
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* All Admins List */}
      <Card className="p-4 sm:p-6 overflow-hidden">
        <h2 className="text-lg sm:text-xl font-serif font-semibold mb-4 tracking-wide break-words">
          All Admin Accounts
        </h2>
        <div className="space-y-3">
          {admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium">No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Linked To
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm break-words">
                          {admin.name}
                        </div>
                        <div className="sm:hidden text-xs text-gray-600 mt-1 break-all">
                          {admin.email}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <div className="text-sm text-gray-600 break-all">
                          {admin.email}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.role === "super_admin"
                              ? "bg-brand-100 text-brand-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {admin.role === "super_admin"
                            ? "Super Admin"
                            : "Admin"}
                        </span>
                        {admin.isLocked && (
                          <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            🔒 Locked
                          </span>
                        )}
                        {admin.beauticianId && (
                          <div className="lg:hidden text-xs text-brand-700 mt-1">
                            Linked: {getBeauticianName(admin.beauticianId)}
                          </div>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        {admin.beauticianId ? (
                          <div className="text-sm text-brand-700">
                            {getBeauticianName(admin.beauticianId)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not linked
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-right text-sm">
                        <div className="flex gap-2 justify-end flex-wrap">
                          {admin.isLocked &&
                            currentAdmin?.role === "super_admin" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnlock(admin)}
                                className="text-xs sm:text-sm border-green-300 text-green-700 hover:bg-green-50"
                                title="Unlock account"
                              >
                                🔓 Unlock
                              </Button>
                            )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(admin)}
                            disabled={
                              currentAdmin?.role !== "super_admin" ||
                              currentAdmin?.id === admin._id ||
                              currentAdmin?._id === admin._id
                            }
                            className="text-xs sm:text-sm"
                            title={
                              currentAdmin?.role !== "super_admin"
                                ? "Only super administrators can delete admin accounts"
                                : currentAdmin?.id === admin._id ||
                                  currentAdmin?._id === admin._id
                                ? "You cannot delete your own account"
                                : "Delete admin account"
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              About Admin-Beautician Links
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Linking an admin to a beautician allows the admin to manage
                that beautician's Stripe Connect settings
              </li>
              <li>
                • Each admin can only be linked to one beautician at a time
              </li>
              <li>
                • Unlinking will remove access to Stripe Connect management
              </li>
              <li>
                • The admin must log out and log back in to see changes take
                effect
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
