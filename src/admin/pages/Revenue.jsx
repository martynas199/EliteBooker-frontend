import { useState, useEffect } from "react";
import { RevenueAPI } from "../components/revenue/revenue.api";
import dayjs from "dayjs";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Revenue() {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBeautician, setSelectedBeautician] = useState("all");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [dateError, setDateError] = useState("");

  // Fetch revenue data
  const fetchRevenue = async () => {
    try {
      console.log("Fetching revenue for:", startDate, "to", endDate);
      setLoading(true);
      setError(null);

      // Fetch both regular revenue and platform Connect revenue
      const [regularRevenue, platformRevenue] = await Promise.all([
        RevenueAPI.getRevenue(startDate, endDate),
        RevenueAPI.getPlatformRevenue(startDate, endDate).catch(() => null), // Don't fail if Connect not set up
      ]);

      console.log("Revenue data received:", regularRevenue);
      console.log("Platform Connect data:", platformRevenue);

      // Merge the data - map backend field names (bookings only)
      // Use platform beauticians data if regular API returns empty array
      const beauticiansData =
        regularRevenue?.beauticians?.length > 0
          ? regularRevenue.beauticians
          : (platformRevenue?.beauticians || []).map((b) => ({
              beauticianId: b?.beauticianId || "",
              beautician: b?.beauticianName || "Unknown",
              revenue: b?.bookings?.revenue || 0,
              bookings: b?.bookings?.count || 0,
              serviceCount: b?.services?.length || 0,
            }));

      setData({
        startDate: regularRevenue?.startDate || startDate,
        endDate: regularRevenue?.endDate || endDate,
        totalRevenue: regularRevenue?.totalRevenue || 0,
        totalBookings: regularRevenue?.totalBookings || 0,
        beauticians: beauticiansData,
        platform: platformRevenue
          ? {
              totalRevenue: platformRevenue.platform?.totalBookingRevenue || 0,
              platformFees: platformRevenue.platform?.totalFees || 0,
              beauticianEarnings:
                platformRevenue.summary?.totalBeauticianEarnings || 0,
              bookingsRevenue:
                platformRevenue.platform?.totalBookingRevenue || 0,
              totalBookings:
                platformRevenue.beauticians?.reduce(
                  (sum, b) => sum + b.bookings.count,
                  0
                ) || 0,
            }
          : {
              totalRevenue: 0,
              platformFees: 0,
              beauticianEarnings: 0,
              bookingsRevenue: 0,
              totalBookings: 0,
            },
      });
    } catch (err) {
      console.error("Failed to fetch revenue:", err);
      setError(err.message || "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  // Validate dates and auto-fetch when dates change
  useEffect(() => {
    if (startDate && endDate) {
      // Validate that start date is before or equal to end date
      if (dayjs(startDate).isAfter(dayjs(endDate))) {
        setDateError("Start date must be before or equal to end date");
        return;
      }
      setDateError("");
      fetchRevenue();
    }
  }, [startDate, endDate]);

  // Close date pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".date-picker-container")) {
        setShowStartPicker(false);
        setShowEndPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter beauticians based on selection
  const filteredBeauticians =
    data?.beauticians?.filter((b) =>
      selectedBeautician === "all"
        ? true
        : b.beauticianId === selectedBeautician
    ) || [];

  // Calculate filtered totals
  const filteredTotalRevenue = filteredBeauticians.reduce(
    (sum, b) => sum + b.revenue,
    0
  );
  const filteredTotalBookings = filteredBeauticians.reduce(
    (sum, b) => sum + b.bookings,
    0
  );

  // Quick date range shortcuts
  const setQuickRange = (range) => {
    const today = dayjs();
    switch (range) {
      case "today":
        setStartDate(today.format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        break;
      case "yesterday":
        setStartDate(today.subtract(1, "day").format("YYYY-MM-DD"));
        setEndDate(today.subtract(1, "day").format("YYYY-MM-DD"));
        break;
      case "last7days":
        setStartDate(today.subtract(6, "day").format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        break;
      case "last30days":
        setStartDate(today.subtract(29, "day").format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        break;
      case "thisMonth":
        setStartDate(today.startOf("month").format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        break;
      case "lastMonth":
        setStartDate(
          today.subtract(1, "month").startOf("month").format("YYYY-MM-DD")
        );
        setEndDate(
          today.subtract(1, "month").endOf("month").format("YYYY-MM-DD")
        );
        break;
      default:
        break;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Revenue Analytics
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Track your salon's revenue and performance from confirmed and
          completed appointments
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Date Range
        </h2>

        {/* Quick Range Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "Today", value: "today" },
            { label: "Yesterday", value: "yesterday" },
            { label: "Last 7 Days", value: "last7days" },
            { label: "Last 30 Days", value: "last30days" },
            { label: "This Month", value: "thisMonth" },
            { label: "Last Month", value: "lastMonth" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setQuickRange(range.value)}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors touch-manipulation"
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative date-picker-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <button
              onClick={() => {
                setShowStartPicker(!showStartPicker);
                setShowEndPicker(false);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900">
                {dayjs(startDate).format("MMM DD, YYYY")}
              </span>
              <svg
                className="w-5 h-5 text-gray-400"
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
            </button>
            {showStartPicker && (
              <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                <DayPicker
                  mode="single"
                  selected={new Date(startDate)}
                  onSelect={(date) => {
                    if (date) {
                      const newStartDate = dayjs(date).format("YYYY-MM-DD");
                      setStartDate(newStartDate);
                      setShowStartPicker(false);

                      // Auto-adjust end date if it becomes invalid
                      if (dayjs(newStartDate).isAfter(dayjs(endDate))) {
                        setEndDate(newStartDate);
                      }
                    }
                  }}
                  toDate={new Date()}
                  className="rdp-custom"
                  modifiersClassNames={{
                    selected: "!bg-brand-600 !text-white font-semibold",
                    today: "!text-brand-600 font-bold",
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex-1 relative date-picker-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <button
              onClick={() => {
                setShowEndPicker(!showEndPicker);
                setShowStartPicker(false);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900">
                {dayjs(endDate).format("MMM DD, YYYY")}
              </span>
              <svg
                className="w-5 h-5 text-gray-400"
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
            </button>
            {showEndPicker && (
              <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                <DayPicker
                  mode="single"
                  selected={new Date(endDate)}
                  onSelect={(date) => {
                    if (date) {
                      const newEndDate = dayjs(date).format("YYYY-MM-DD");
                      setEndDate(newEndDate);
                      setShowEndPicker(false);

                      // Auto-adjust start date if it becomes invalid
                      if (dayjs(startDate).isAfter(dayjs(newEndDate))) {
                        setStartDate(newEndDate);
                      }
                    }
                  }}
                  fromDate={new Date(startDate)}
                  toDate={new Date()}
                  className="rdp-custom"
                  modifiersClassNames={{
                    selected: "!bg-brand-600 !text-white font-semibold",
                    today: "!text-brand-600 font-bold",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Date Validation Error */}
        {dateError && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-amber-800">
              {dateError}
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      )}

      {/* Data Display */}
      {!loading && data && (
        <>
          {/* Check if we have any data at all */}
          {data.platform?.totalBookings > 0 ||
          filteredBeauticians.length > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-brand-100">
                      Total Revenue
                    </span>
                    <svg
                      className="w-8 h-8 text-brand-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(
                      data.platform?.bookingsRevenue || filteredTotalRevenue
                    )}
                  </div>
                  <div className="text-xs text-brand-100 mt-1">
                    {dayjs(startDate).format("MMM D")} -{" "}
                    {dayjs(endDate).format("MMM D, YYYY")}
                  </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Bookings
                    </span>
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {data.platform?.totalBookings || filteredTotalBookings}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Completed appointments
                  </div>
                </div>

                {/* Average Per Booking */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Average Per Booking
                    </span>
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {(data.platform?.totalBookings || filteredTotalBookings) > 0
                      ? formatCurrency(
                          (data.platform?.bookingsRevenue ||
                            filteredTotalRevenue) /
                            (data.platform?.totalBookings ||
                              filteredTotalBookings)
                        )
                      : formatCurrency(0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Revenue per appointment
                  </div>
                </div>
              </div>

              {/* Beautician Filter */}
              {data.beauticians.length > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Beautician
                  </label>
                  <select
                    value={selectedBeautician}
                    onChange={(e) => setSelectedBeautician(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="all">All Beauticians</option>
                    {data.beauticians.map((b) => (
                      <option key={b.beauticianId} value={b.beauticianId}>
                        {b.beautician}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bar Chart */}
              {filteredBeauticians.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-x-auto">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                    Revenue by Beautician
                  </h2>
                  <div className="min-w-full">
                    <BarChart
                      width={Math.max(800, filteredBeauticians.length * 150)}
                      height={350}
                      data={filteredBeauticians}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#9333ea"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#9333ea"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="beautician"
                        tick={{
                          fill: "#6b7280",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="#e5e7eb"
                      />
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 13 }}
                        tickFormatter={(value) => `£${value}`}
                        stroke="#e5e7eb"
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(147, 51, 234, 0.1)" }}
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "none",
                          borderRadius: "0.75rem",
                          boxShadow:
                            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                          padding: "12px 16px",
                        }}
                        labelStyle={{
                          color: "#111827",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                        itemStyle={{ color: "#9333ea", fontWeight: 500 }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        iconType="circle"
                      />
                      <Bar
                        dataKey="revenue"
                        fill="url(#colorRevenue)"
                        name="Revenue (£)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </div>
                </div>
              )}

              {/* Table / Cards - Only show if there's beautician breakdown data */}
              {filteredBeauticians.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Detailed Breakdown
                    </h2>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden divide-y divide-gray-200">
                    {filteredBeauticians.map((beautician) => (
                      <div
                        key={beautician.beauticianId}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Beautician Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
                            <span className="text-brand-700 font-medium text-sm">
                              {beautician.beautician
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {beautician.beautician}
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Revenue
                            </div>
                            <div className="text-base font-bold text-gray-900">
                              {formatCurrency(beautician.revenue)}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Bookings
                            </div>
                            <div className="text-base font-bold text-gray-900">
                              {beautician.bookings}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Avg/Booking
                            </div>
                            <div className="text-sm font-semibold text-gray-700">
                              {formatCurrency(
                                beautician.revenue / beautician.bookings
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Mobile Total */}
                    <div className="p-4 bg-gray-50 border-t-2 border-gray-300">
                      <div className="font-bold text-gray-900 mb-3">Total</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Revenue
                          </div>
                          <div className="text-base font-bold text-gray-900">
                            {formatCurrency(filteredTotalRevenue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Bookings
                          </div>
                          <div className="text-base font-bold text-gray-900">
                            {filteredTotalBookings}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Beautician
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg per Booking
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBeauticians.map((beautician) => (
                          <tr
                            key={beautician.beauticianId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                                  <span className="text-brand-700 font-medium text-sm">
                                    {beautician.beautician
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {beautician.beautician}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(beautician.revenue)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">
                                {beautician.bookings}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-600">
                                {formatCurrency(
                                  beautician.revenue / beautician.bookings
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-semibold">
                        <tr>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            {formatCurrency(filteredTotalRevenue)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            {filteredTotalBookings}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-600">
                            {filteredTotalBookings > 0
                              ? formatCurrency(
                                  filteredTotalRevenue / filteredTotalBookings
                                )
                              : formatCurrency(0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Revenue Data
              </h3>
              <p className="text-gray-600">
                No completed bookings found for the selected date range.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
