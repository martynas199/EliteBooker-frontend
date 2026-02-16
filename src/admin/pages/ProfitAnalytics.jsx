import { useState, useEffect } from "react";
import { api } from "../../shared/lib/apiClient";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import FormField from "../../shared/components/forms/FormField";
import TabNav from "../../shared/components/ui/TabNav";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import toast from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import AdminPageShell from "../components/AdminPageShell";

const formatCurrency = (amount) => `£${amount.toFixed(2)}`;
const formatPercentage = (percentage) => `${percentage.toFixed(1)}%`;

export default function ProfitAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    productId: "",
    specialistId: "",
  });
  const [products, setProducts] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

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

  useEffect(() => {
    if (products.length > 0 && specialists.length > 0) {
      loadAnalytics();
    }
  }, [filters, products, specialists]);

  const loadInitialData = async () => {
    try {
      const [productsRes, specialistsRes] = await Promise.all([
        api.get("/products"),
        api.get("/specialists", { params: { limit: 1000 } }),
      ]);

      const productData = productsRes.data || [];
      const specialistData = specialistsRes.data || [];

      // Log any invalid items for debugging
      const invalidProducts = productData.filter((p) => !p || !p._id);
      const invalidSpecialists = specialistData.filter((b) => !b || !b._id);

      if (invalidProducts.length > 0) {
        console.error("Invalid products found:", invalidProducts);
      }
      if (invalidSpecialists.length > 0) {
        console.error("Invalid specialists found:", invalidSpecialists);
      }

      setProducts(productData.filter((p) => p && p._id));
      setSpecialists(specialistData.filter((b) => b && b._id));
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load data");
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.productId) params.append("productId", filters.productId);
      if (filters.specialistId)
        params.append("specialistId", filters.specialistId);

      const response = await api.get(`/analytics/profit?${params.toString()}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (days) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    setFilters({
      ...filters,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    });
  };

  const handleMonthFilter = () => {
    const now = new Date();
    setFilters({
      ...filters,
      startDate: format(startOfMonth(now), "yyyy-MM-dd"),
      endDate: format(endOfMonth(now), "yyyy-MM-dd"),
    });
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-2"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const {
    summary = {},
    products: productData = [],
    categories = [],
    monthly = [],
    specialists: specialistData = [],
  } = analytics || {};

  const analyticsTabs = [
    { key: "overview", label: "Overview" },
    { key: "products", label: "Products" },
    { key: "categories", label: "Categories" },
    { key: "specialists", label: "Specialists" },
    { key: "trends", label: "Trends" },
  ];

  return (
    <AdminPageShell
      title="Profit Analytics"
      description="Track your margins, profits, and product performance"
      maxWidth="2xl"
      contentClassName="space-y-6 overflow-x-hidden"
      className="px-3 sm:px-6 lg:px-8"
    >
      {/* Filters */}
      <Card className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <FormField label="Start Date">
            <div className="date-picker-container relative">
              <button
                type="button"
                onClick={() => {
                  setShowStartPicker(!showStartPicker);
                  setShowEndPicker(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {dayjs(filters.startDate).format("MMM DD, YYYY")}
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
                    selected={new Date(filters.startDate)}
                    onSelect={(date) => {
                      if (date) {
                        const newStartDate = dayjs(date).format("YYYY-MM-DD");
                        setFilters({ ...filters, startDate: newStartDate });
                        setShowStartPicker(false);

                        // Auto-adjust end date if it becomes invalid
                        if (
                          dayjs(newStartDate).isAfter(dayjs(filters.endDate))
                        ) {
                          setFilters((prev) => ({
                            ...prev,
                            startDate: newStartDate,
                            endDate: newStartDate,
                          }));
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
          </FormField>

          <FormField label="End Date">
            <div className="date-picker-container relative">
              <button
                type="button"
                onClick={() => {
                  setShowEndPicker(!showEndPicker);
                  setShowStartPicker(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {dayjs(filters.endDate).format("MMM DD, YYYY")}
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
                    selected={new Date(filters.endDate)}
                    onSelect={(date) => {
                      if (date) {
                        const newEndDate = dayjs(date).format("YYYY-MM-DD");
                        setFilters({ ...filters, endDate: newEndDate });
                        setShowEndPicker(false);

                        // Auto-adjust start date if it becomes invalid
                        if (
                          dayjs(filters.startDate).isAfter(dayjs(newEndDate))
                        ) {
                          setFilters((prev) => ({
                            ...prev,
                            endDate: newEndDate,
                            startDate: newEndDate,
                          }));
                        }
                      }
                    }}
                    fromDate={new Date(filters.startDate)}
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
          </FormField>

          <FormField label="Product">
            <select
              value={filters.productId}
              onChange={(e) =>
                setFilters({ ...filters, productId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">All Products</option>
              {products
                .filter((p) => p && p._id)
                .map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title}
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="Specialist">
            <select
              value={filters.specialistId}
              onChange={(e) =>
                setFilters({ ...filters, specialistId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">All Specialists</option>
              {specialists
                .filter((b) => b && b._id)
                .map((specialist) => (
                  <option key={specialist._id} value={specialist._id}>
                    {specialist.name}
                  </option>
                ))}
            </select>
          </FormField>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter(7)}
          >
            Last 7 Days
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter(30)}
          >
            Last 30 Days
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter(90)}
          >
            Last 90 Days
          </Button>
          <Button size="sm" variant="outline" onClick={handleMonthFilter}>
            This Month
          </Button>
        </div>
      </Card>

      {/* No Data Message */}
      {summary.totalOrders === 0 &&
        (filters.productId || filters.specialistId) && (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Sales Data Found
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.productId &&
                  "This product hasn't been sold yet in the selected date range."}
                {filters.specialistId &&
                  !filters.productId &&
                  "This specialist hasn't sold any products yet in the selected date range."}
              </p>
              <p className="text-sm text-gray-500">
                Try selecting "All Products" or adjusting the date range to see
                available data.
              </p>
            </div>
          </Card>
        )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(summary.totalRevenue || 0)}
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              Total Revenue
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
              {formatCurrency(summary.totalCost || 0)}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Total Cost</div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-brand-600 mb-1">
              {formatCurrency(summary.totalProfit || 0)}
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              Total Profit
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
              {formatPercentage(summary.overallMargin || 0)}
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              Overall Margin
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {summary.totalOrders || 0}
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              Total Orders
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {summary.totalItems || 0}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Items Sold</div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(summary.averageOrderValue || 0)}
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              Avg Order Value
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-brand-600 mb-1">
              {formatPercentage(summary.profitabilityRate || 0)}
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              Profitability Rate
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <TabNav
          tabs={analyticsTabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          accent="brand"
          showCounts={false}
          buttonClassName="text-xs sm:text-sm"
        />
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Products */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Top Performing Products
            </h3>
            <div className="space-y-3">
              {productData.slice(0, 5).map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {product.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">
                      {product.category} • Qty: {product.totalQuantity}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-green-600 text-sm sm:text-base">
                      {formatCurrency(product.totalProfit)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {formatPercentage(product.averageMargin)} margin
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Performance */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Category Performance
            </h3>
            <div className="space-y-3">
              {categories.slice(0, 5).map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {category.category}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Qty: {category.totalQuantity}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-green-600 text-sm sm:text-base">
                      {formatCurrency(category.totalProfit)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {formatPercentage(category.averageMargin)} margin
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "products" && (
        <Card className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Product Performance
          </h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productData.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                          {product.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.category}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-green-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-red-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(product.totalCost)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-brand-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(product.totalProfit)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold text-xs sm:text-sm ${
                            product.averageMargin > 50
                              ? "text-green-600"
                              : product.averageMargin > 30
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(product.averageMargin)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 text-xs sm:text-sm">
                        {product.totalQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "categories" && (
        <Card className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Category Performance
          </h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.category}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-xs sm:text-sm">
                        {category.category}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-green-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(category.totalRevenue)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-red-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(category.totalCost)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-brand-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(category.totalProfit)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold text-xs sm:text-sm ${
                            category.averageMargin > 50
                              ? "text-green-600"
                              : category.averageMargin > 30
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(category.averageMargin)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 text-xs sm:text-sm">
                        {category.totalQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "specialists" && (
        <Card className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Specialist Performance
          </h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialist
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {specialistData.map((specialist) => (
                    <tr key={specialist.specialistId || "platform"}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                          {specialist.beauticianName}
                        </div>
                        {specialist.specialistId ? (
                          <div className="text-xs text-[#2563EB]">
                            Individual Owner
                          </div>
                        ) : (
                          <div className="text-xs text-[#3B82F6]">
                            Platform Products
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-green-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(specialist.totalRevenue)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-red-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(specialist.totalCost)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-brand-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(specialist.totalProfit)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold text-xs sm:text-sm ${
                            specialist.averageMargin > 50
                              ? "text-green-600"
                              : specialist.averageMargin > 30
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(specialist.averageMargin)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 text-xs sm:text-sm">
                        {specialist.totalQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "trends" && (
        <Card className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Monthly Trends
          </h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthly.map((month) => (
                    <tr key={month.month}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-xs sm:text-sm">
                        {format(new Date(month.month + "-01"), "MMM yyyy")}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-green-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(month.totalRevenue)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-red-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(month.totalCost)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-brand-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(month.totalProfit)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold text-xs sm:text-sm ${
                            month.averageMargin > 50
                              ? "text-green-600"
                              : month.averageMargin > 30
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(month.averageMargin)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 text-xs sm:text-sm">
                        {month.totalOrders}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </AdminPageShell>
  );
}
