import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "./seminars.api";

export default function SeminarsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    location: searchParams.get("location") || "",
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  useEffect(() => {
    loadSeminars();
  }, []);

  const loadSeminars = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.level) params.level = filters.level;
      if (filters.location) params.locationType = filters.location;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const data = await SeminarsAPI.listPublic(params);
      const seminarList = Array.isArray(data) ? data : data?.seminars || [];
      setSeminars(seminarList);
    } catch (error) {
      console.error("Failed to load seminars:", error);
      toast.error("Failed to load seminars");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      level: "",
      location: "",
      search: "",
      minPrice: "",
      maxPrice: "",
    });
    setSearchParams({});
    loadSeminars();
  };

  const getUpcomingSessions = (seminar) => {
    if (!seminar.upcomingSessions) return [];
    return seminar.upcomingSessions.slice(0, 3);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Seminars & Masterclasses
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Expand your skills with expert-led educational events
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 sticky top-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadSeminars()}
                  placeholder="Search seminars..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Hair Styling">Hair Styling</option>
                  <option value="Nails">Nails</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  <option value="physical">In-Person</option>
                  <option value="virtual">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={loadSeminars}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Seminars Grid */}
          <div className="lg:col-span-3">
            {seminars.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">No seminars found</p>
                <p className="text-gray-400 mt-2">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Showing {seminars.length} seminar
                  {seminars.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {seminars.map((seminar) => (
                    <Link
                      key={seminar._id}
                      to={`${seminar.slug}`}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      {seminar.images?.main && (
                        <img
                          src={seminar.images.main}
                          alt={seminar.title}
                          className="w-full h-48 object-cover"
                        />
                      )}

                      <div className="p-6">
                        {/* Category & Level */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {seminar.category}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {seminar.level}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            {seminar.location.type === "physical"
                              ? "In-Person"
                              : seminar.location.type === "virtual"
                              ? "Online"
                              : "Hybrid"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {seminar.title}
                        </h3>

                        {/* Short Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {seminar.shortDescription}
                        </p>

                        {/* Upcoming Sessions */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Upcoming Sessions:
                          </p>
                          {getUpcomingSessions(seminar).length > 0 ? (
                            <div className="space-y-1">
                              {getUpcomingSessions(seminar).map(
                                (session, idx) => (
                                  <div
                                    key={idx}
                                    className="text-sm text-gray-600 flex items-center"
                                  >
                                    <svg
                                      className="w-4 h-4 mr-2 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {formatDate(session.date)} •{" "}
                                    {session.startTime}
                                    <span className="ml-auto text-xs">
                                      {session.maxAttendees -
                                        session.currentAttendees}{" "}
                                      spots left
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No upcoming sessions
                            </p>
                          )}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {seminar.pricing.currency} {seminar.activePrice}
                            </p>
                            {seminar.pricing.earlyBirdPrice &&
                              seminar.activePrice ===
                                seminar.pricing.earlyBirdPrice && (
                                <p className="text-xs text-green-600 font-medium">
                                  Early Bird Price
                                </p>
                              )}
                          </div>
                          <span className="text-blue-600 font-medium hover:text-blue-800">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
