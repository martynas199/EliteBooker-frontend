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
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";

export default function Revenue() {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState("all");
  const [showSpecialistDrawer, setShowSpecialistDrawer] = useState(false);
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
      // Use platform specialists data if regular API returns empty array
      const specialistsData =
        regularRevenue?.specialists?.length > 0
          ? regularRevenue.specialists
          : (platformRevenue?.specialists || []).map((b) => ({
              specialistId: b?.specialistId || "",
              specialist: b?.beauticianName || "Unknown",
              revenue: b?.bookings?.revenue || 0,
              bookings: b?.bookings?.count || 0,
              serviceCount: b?.services?.length || 0,
            }));

      setData({
        startDate: regularRevenue?.startDate || startDate,
        endDate: regularRevenue?.endDate || endDate,
        totalRevenue: regularRevenue?.totalRevenue || 0,
        totalBookings: regularRevenue?.totalBookings || 0,
        specialists: specialistsData,
        platform: platformRevenue
          ? {
              totalRevenue: platformRevenue.platform?.totalBookingRevenue || 0,
              platformFees: platformRevenue.platform?.totalFees || 0,
              beauticianEarnings:
                platformRevenue.summary?.totalBeauticianEarnings || 0,
              bookingsRevenue:
                platformRevenue.platform?.totalBookingRevenue || 0,
              totalBookings:
                platformRevenue.specialists?.reduce(
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

  // Filter specialists based on selection
  const filteredSpecialists =
    data?.specialists?.filter((b) =>
      selectedSpecialist === "all"
        ? true
        : b.specialistId === selectedSpecialist
    ) || [];

  // Calculate filtered totals
  const filteredTotalRevenue = filteredSpecialists.reduce(
    (sum, b) => sum + b.revenue,
    0
  );
  const filteredTotalBookings = filteredSpecialists.reduce(
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
    <div className="px-2 sm:px-3 space-y-2">
      {/* Header */}
      <div className="mb-1.5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Revenue Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Track performance and booking revenue
        </p>
      </div>

      {/* Date Range Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-gray-600"
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
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            Date Range
          </h2>
        </div>

        {/* Quick Range Buttons */}
        <div className="flex flex-wrap gap-1 mb-2">
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
              className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-md transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative date-picker-container">
            <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Start Date
            </label>
            <button
              onClick={() => {
                setShowStartPicker(!showStartPicker);
                setShowEndPicker(false);
              }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900 font-medium">
                {dayjs(startDate).format("MMM DD, YYYY")}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
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
          <div className="relative date-picker-container">
            <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              End Date
            </label>
            <button
              onClick={() => {
                setShowEndPicker(!showEndPicker);
                setShowStartPicker(false);
              }}
              className="w-full px-2.5 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900 font-medium">
                {dayjs(endDate).format("MMM DD, YYYY")}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
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
          filteredSpecialists.length > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Total Revenue */}
                <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-sm p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      Total Revenue
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatCurrency(
                      data.platform?.bookingsRevenue || filteredTotalRevenue
                    )}
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {dayjs(startDate).format("MMM D")} -{" "}
                    {dayjs(endDate).format("MMM D, YY")}
                  </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                      Bookings
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {data.platform?.totalBookings || filteredTotalBookings}
                  </div>
                  <div className="text-[9px] text-gray-500">Completed</div>
                </div>

                {/* Average Per Booking */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                      Average
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(data.platform?.totalBookings || filteredTotalBookings) > 0
                      ? formatCurrency(
                          (data.platform?.bookingsRevenue ||
                            filteredTotalRevenue) /
                            (data.platform?.totalBookings ||
                              filteredTotalBookings)
                        )
                      : formatCurrency(0)}
                  </div>
                  <div className="text-[9px] text-gray-500">Per booking</div>
                </div>

                {/* Specialist Count */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                      Specialists
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {filteredSpecialists.length}
                  </div>
                  <div className="text-[9px] text-gray-500">Active team</div>
                </div>
              </div>

              {/* Specialist Filter */}
              {data.specialists.length > 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Filter Specialist
                    </label>
                  </div>
                  <SelectButton
                    onClick={() => setShowSpecialistDrawer(true)}
                    placeholder="Filter by Specialist"
                    value={selectedSpecialist}
                    options={[
                      { value: "all", label: "All Specialists" },
                      ...data.specialists.map((s) => ({
                        value: s.specialistId,
                        label: s.specialist,
                      })),
                    ]}
                    className="w-full sm:w-64"
                  />
                </div>
              )}

              {/* Bar Chart */}
              {filteredSpecialists.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 overflow-x-auto">
                  <div className="flex items-center gap-2 mb-2.5">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Revenue by Specialist
                    </h2>
                  </div>
                  <div className="min-w-full">
                    <BarChart
                      width={Math.max(800, filteredSpecialists.length * 150)}
                      height={350}
                      data={filteredSpecialists}
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
                        dataKey="specialist"
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

              {/* Table / Cards - Only show if there's specialist breakdown data */}
              {filteredSpecialists.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                        Detailed Breakdown
                      </h2>
                    </div>
                  </div>

                  {/* Card Grid View */}
                  <div className="p-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {filteredSpecialists.map((specialist) => (
                        <div
                          key={specialist.specialistId}
                          className="bg-white border border-gray-200 rounded-lg p-2.5 hover:shadow-md transition-shadow"
                        >
                          {/* Specialist Header */}
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-900 flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {specialist.specialist
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-gray-900 truncate">
                                {specialist.specialist}
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between py-1 border-b border-gray-100">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                                Revenue
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {formatCurrency(specialist.revenue)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-gray-100">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                                Bookings
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {specialist.bookings}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                                Average
                              </span>
                              <span className="text-xs font-semibold text-gray-700">
                                {formatCurrency(
                                  specialist.revenue / specialist.bookings
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary */}
                    <div className="mt-2.5 bg-gray-900 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-wide mb-1">
                            Total
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold block">
                                Revenue
                              </span>
                              <span className="text-sm font-bold text-white">
                                {formatCurrency(filteredTotalRevenue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold block">
                                Bookings
                              </span>
                              <span className="text-sm font-bold text-white">
                                {filteredTotalBookings}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold block">
                            Average
                          </span>
                          <span className="text-lg font-bold text-white">
                            {filteredTotalBookings > 0
                              ? formatCurrency(
                                  filteredTotalRevenue / filteredTotalBookings
                                )
                              : formatCurrency(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
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
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No Revenue Data
              </h3>
              <p className="text-sm text-gray-600">
                No completed bookings found for the selected date range.
              </p>
            </div>
          )}
        </>
      )}

      {/* Specialist Filter Drawer */}
      <SelectDrawer
        open={showSpecialistDrawer}
        onClose={() => setShowSpecialistDrawer(false)}
        title="Filter by Specialist"
        options={[
          { value: "all", label: "All Specialists" },
          ...(data?.specialists || []).map((s) => ({
            value: s.specialistId,
            label: s.specialist,
          })),
        ]}
        value={selectedSpecialist}
        onChange={(value) => {
          setSelectedSpecialist(value);
          setShowSpecialistDrawer(false);
        }}
      />
    </div>
  );
}
