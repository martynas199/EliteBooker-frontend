import { useState, useEffect } from "react";
import { useAuth } from "../../shared/contexts/AuthContext";
import api from "../../shared/lib/api";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

export default function Tenants() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Check if user is super admin
  const isSuperAdmin =
    user?.role === "super-admin" || user?.role === "super_admin";

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTenants();
    }
  }, [isSuperAdmin]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/tenants");
      setTenants(response.data || []);
    } catch (err) {
      console.error("Failed to load tenants:", err);
      setError(err.response?.data?.error || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (tenantId) => {
    if (
      !confirm(
        "Are you sure you want to suspend this tenant? They will not be able to access their account."
      )
    ) {
      return;
    }

    try {
      await api.post(`/api/tenants/${tenantId}/suspend`);
      setSuccess("Tenant suspended successfully");
      fetchTenants();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to suspend tenant:", err);
      setError(err.response?.data?.error || "Failed to suspend tenant");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleActivate = async (tenantId) => {
    try {
      await api.post(`/api/tenants/${tenantId}/activate`);
      setSuccess("Tenant activated successfully");
      fetchTenants();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to activate tenant:", err);
      setError(err.response?.data?.error || "Failed to activate tenant");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleImpersonate = (tenant) => {
    // Store current super admin token
    const currentToken = localStorage.getItem("token");
    localStorage.setItem("superAdminToken", currentToken);

    // Switch to tenant context
    // Tenant context will be loaded from cookies/API, no localStorage needed

    // Reload to apply tenant context
    window.location.href = "/admin";
  };

  const exitImpersonation = () => {
    const superAdminToken = localStorage.getItem("superAdminToken");
    if (superAdminToken) {
      localStorage.setItem("token", superAdminToken);
      localStorage.removeItem("superAdminToken");
      localStorage.removeItem("tenantId");
      window.location.href = "/admin/tenants";
    }
  };

  // Filter tenants based on search and status
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.businessInfo?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tenant.businessInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tenant.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || tenant.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Access denied for non-super admins
  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            This page is only accessible to super administrators.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Impersonation Banner */}
      {localStorage.getItem("superAdminToken") && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium text-yellow-800">
                You are viewing as a tenant administrator
              </p>
            </div>
            <button
              onClick={exitImpersonation}
              className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-sm font-medium"
            >
              Exit Impersonation
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all salon tenants on the platform
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or slug..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="all">All Tenants</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Tenants</p>
          <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {tenants.filter((t) => t.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {tenants.filter((t) => t.status === "suspended").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Trial</p>
          <p className="text-2xl font-bold text-yellow-600">
            {tenants.filter((t) => t.status === "trial").length}
          </p>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No tenants found
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tenant.businessInfo?.name || "Unnamed Tenant"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tenant.businessInfo?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {tenant.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tenant.status === "active"
                            ? "bg-green-100 text-green-800"
                            : tenant.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : tenant.status === "trial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {tenant.status || "unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleImpersonate(tenant)}
                          className="text-brand-600 hover:text-brand-900"
                          title="View as this tenant"
                        >
                          View
                        </button>
                        {tenant.status === "active" ? (
                          <button
                            onClick={() => handleSuspend(tenant._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Suspend
                          </button>
                        ) : tenant.status === "suspended" ? (
                          <button
                            onClick={() => handleActivate(tenant._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
