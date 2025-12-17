import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, GraduationCap } from "lucide-react";
import { SeminarsAPI } from "../../tenant/pages/seminars.api";
import Button from "../../shared/components/ui/Button";
import Card from "../../shared/components/ui/Card";
import ConfirmDeleteModal from "../../shared/components/forms/ConfirmDeleteModal";

export default function Seminars() {
  const navigate = useNavigate();
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    seminar: null,
  });

  useEffect(() => {
    loadSeminars();
  }, []);

  const loadSeminars = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== "all") params.status = filters.status;
      if (filters.category !== "all") params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const data = await SeminarsAPI.list(params);
      setSeminars(data);
    } catch (error) {
      console.error("Failed to load seminars:", error);
      toast.error("Failed to load seminars");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (seminar) => {
    try {
      await SeminarsAPI.delete(seminar._id);
      toast.success("Seminar deleted successfully");
      loadSeminars();
      setDeleteModal({ open: false, seminar: null });
    } catch (error) {
      console.error("Failed to delete seminar:", error);
      toast.error(error.response?.data?.message || "Failed to delete seminar");
    }
  };

  const handlePublish = async (id) => {
    try {
      await SeminarsAPI.publish(id);
      toast.success("Seminar published successfully");
      loadSeminars();
    } catch (error) {
      console.error("Failed to publish seminar:", error);
      toast.error(error.response?.data?.message || "Failed to publish seminar");
    }
  };

  const handleArchive = async (id) => {
    try {
      await SeminarsAPI.archive(id);
      toast.success("Seminar archived successfully");
      loadSeminars();
    } catch (error) {
      console.error("Failed to archive seminar:", error);
      toast.error("Failed to archive seminar");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: "bg-gray-100 text-gray-700",
      published: "bg-green-100 text-green-700",
      archived: "bg-red-100 text-red-700",
    };
    return badges[status] || badges.draft;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUpcomingSessions = (seminar) => {
    const now = new Date();
    return (
      seminar.sessions?.filter(
        (s) => new Date(s.date) > now && s.status === "scheduled"
      ).length || 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg hidden sm:flex">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Seminars & Masterclasses
            </h2>
            <p className="text-sm text-gray-600">
              Manage your educational events
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/admin/seminars/create")}
          variant="primary"
          className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2 inline-block" />
          Create Seminar
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && loadSeminars()}
              placeholder="Search seminars..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Skincare">Skincare</option>
              <option value="Makeup">Makeup</option>
              <option value="Hair Styling">Hair Styling</option>
              <option value="Nails">Nails</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={loadSeminars}
              variant="secondary"
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Seminars List */}
      {seminars.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">No seminars found</p>
          <p className="text-gray-400 mt-2">
            Create your first seminar to get started
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seminar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seminars.map((seminar) => (
                <tr key={seminar._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {seminar.images?.main && (
                        <img
                          src={seminar.images.main}
                          alt={seminar.title}
                          className="h-12 w-12 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {seminar.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seminar.level}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {seminar.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getUpcomingSessions(seminar)} upcoming
                    <br />
                    <span className="text-xs text-gray-400">
                      {seminar.sessions?.length || 0} total
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seminar.pricing.currency} {seminar.pricing.price}
                    {seminar.pricing.earlyBirdPrice && (
                      <div className="text-xs text-green-600">
                        Early: {seminar.pricing.currency}{" "}
                        {seminar.pricing.earlyBirdPrice}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        seminar.status
                      )}`}
                    >
                      {seminar.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/seminars/${seminar._id}/attendees`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Attendees
                    </Link>
                    <Link
                      to={`/admin/seminars/${seminar._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    {seminar.status === "draft" && (
                      <button
                        onClick={() => handlePublish(seminar._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Publish
                      </button>
                    )}
                    {seminar.status === "published" && (
                      <button
                        onClick={() => handleArchive(seminar._id)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteModal({ open: true, seminar })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, seminar: null })}
        onConfirm={() => handleDelete(deleteModal.seminar)}
        title="Delete Seminar"
        message={`Are you sure you want to delete "${deleteModal.seminar?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
