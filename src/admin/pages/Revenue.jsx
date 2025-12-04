import { useState, useEffect, lazy, Suspense } from "react";
import { RevenueAPI } from "../components/revenue/revenue.api";
import dayjs from "dayjs";

// Lazy load recharts components (~50KB)
const BarChart = lazy(() =>
  import("recharts").then((module) => ({ default: module.BarChart }))
);
const Bar = lazy(() =>
  import("recharts").then((module) => ({ default: module.Bar }))
);
const XAxis = lazy(() =>
  import("recharts").then((module) => ({ default: module.XAxis }))
);
const YAxis = lazy(() =>
  import("recharts").then((module) => ({ default: module.YAxis }))
);
const CartesianGrid = lazy(() =>
  import("recharts").then((module) => ({ default: module.CartesianGrid }))
);
const Tooltip = lazy(() =>
  import("recharts").then((module) => ({ default: module.Tooltip }))
);
const ResponsiveContainer = lazy(() =>
  import("recharts").then((module) => ({ default: module.ResponsiveContainer }))
);
const Legend = lazy(() =>
  import("recharts").then((module) => ({ default: module.Legend }))
);

export default function Revenue() {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBeautician, setSelectedBeautician] = useState("all");

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

      // Merge the data - map backend field names
      setData({
        ...regularRevenue,
        platform: platformRevenue
          ? {
              totalRevenue: platformRevenue.platform?.totalRevenue || 0,
              platformFees: platformRevenue.platform?.totalFees || 0,
              beauticianEarnings:
                platformRevenue.summary?.totalBeauticianEarnings || 0,
              bookingsRevenue:
                platformRevenue.platform?.totalBookingRevenue || 0,
              productsRevenue:
                platformRevenue.platform?.totalProductRevenue || 0,
              totalBookings:
                platformRevenue.beauticians?.reduce(
                  (sum, b) => sum + b.bookings.count,
                  0
                ) || 0,
              totalOrders:
                platformRevenue.beauticians?.reduce(
                  (sum, b) => sum + b.products.count,
                  0
                ) || 0,
            }
          : {
              totalRevenue: 0,
              platformFees: 0,
              beauticianEarnings: 0,
              bookingsRevenue: 0,
              productsRevenue: 0,
              totalBookings: 0,
              totalOrders: 0,
            },
      });
    } catch (err) {
      console.error("Failed to fetch revenue:", err);
      setError(err.message || "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenue();
    }
  }, [startDate, endDate]);

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your salon's revenue and performance from confirmed and
          completed appointments
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>

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
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={dayjs().format("YYYY-MM-DD")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            />
          </div>
        </div>
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
          {/* Platform Revenue Card (Stripe Connect) */}
          {data.platform && data.platform.totalRevenue > 0 && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">
                  Platform Revenue (Stripe Connect)
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Platform Fees */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-xs text-green-700 font-medium mb-1">
                    Platform Fees
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {formatCurrency(data.platform.platformFees)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    £0.50 per booking
                  </div>
                </div>

                {/* Beautician Earnings */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-xs text-blue-700 font-medium mb-1">
                    Beautician Earnings
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatCurrency(data.platform.beauticianEarnings)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Direct transfers
                  </div>
                </div>

                {/* Bookings Revenue */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-xs text-[#3B82F6] font-medium mb-1">
                    Bookings
                  </div>
                  <div className="text-xl font-bold text-[#4A2CCC]">
                    {formatCurrency(data.platform.bookingsRevenue)}
                  </div>
                  <div className="text-xs text-[#2563EB] mt-1">
                    {data.platform.totalBookings} appointments
                  </div>
                </div>

                {/* Products Revenue */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-xs text-orange-700 font-medium mb-1">
                    Products
                  </div>
                  <div className="text-xl font-bold text-orange-900">
                    {formatCurrency(data.platform.productsRevenue)}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {data.platform.totalOrders} orders
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="text-xs text-gray-700 font-medium mb-1">
                    Total Revenue
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(data.platform.totalRevenue)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Bookings + Products
                  </div>
                </div>
              </div>
            </div>
          )}

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
                {formatCurrency(filteredTotalRevenue)}
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
                {filteredTotalBookings}
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
                {filteredTotalBookings > 0
                  ? formatCurrency(filteredTotalRevenue / filteredTotalBookings)
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue by Beautician
              </h2>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredBeauticians}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="beautician"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `£${value}`}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#9333ea" name="Revenue (£)" />
                  </BarChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          )}

          {/* Table / Cards */}
          {filteredBeauticians.length > 0 ? (
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
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">
                          Services
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          {beautician.serviceCount}
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
                      <div className="text-xs text-gray-500 mb-1">Revenue</div>
                      <div className="text-base font-bold text-gray-900">
                        {formatCurrency(filteredTotalRevenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Bookings</div>
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
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
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-600">
                            {beautician.serviceCount}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Total</td>
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
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
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
