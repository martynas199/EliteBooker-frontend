import { useState, useEffect } from "react";
import { api } from "../../shared/lib/apiClient";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import FormField from "../../shared/components/forms/FormField";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import toast from "react-hot-toast";

const formatCurrency = (amount) => `£${amount.toFixed(2)}`;
const formatPercentage = (percentage) => `${percentage.toFixed(1)}%`;

export default function ProfitAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    productId: "",
    beauticianId: "",
  });
  const [products, setProducts] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (products.length > 0 && beauticians.length > 0) {
      loadAnalytics();
    }
  }, [filters, products, beauticians]);

  const loadInitialData = async () => {
    try {
      const [productsRes, beauticiansRes] = await Promise.all([
        api.get("/products"),
        api.get("/beauticians", { params: { limit: 1000 } }),
      ]);

      const productData = productsRes.data || [];
      const beauticianData = beauticiansRes.data || [];

      // Log any invalid items for debugging
      const invalidProducts = productData.filter((p) => !p || !p._id);
      const invalidBeauticians = beauticianData.filter((b) => !b || !b._id);

      if (invalidProducts.length > 0) {
        console.error("Invalid products found:", invalidProducts);
      }
      if (invalidBeauticians.length > 0) {
        console.error("Invalid beauticians found:", invalidBeauticians);
      }

      setProducts(productData.filter((p) => p && p._id));
      setBeauticians(beauticianData.filter((b) => b && b._id));
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
      if (filters.beauticianId)
        params.append("beauticianId", filters.beauticianId);

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
    beauticians: beauticianData = [],
  } = analytics || {};

  return (
    <div className="space-y-6 p-3 sm:p-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">
          Profit Analytics
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Track your margins, profits, and product performance
        </p>
      </div>

      {/* Filters */}
      <Card className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <FormField label="Start Date">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="End Date">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
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

          <FormField label="Beautician">
            <select
              value={filters.beauticianId}
              onChange={(e) =>
                setFilters({ ...filters, beauticianId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">All Beauticians</option>
              {beauticians
                .filter((b) => b && b._id)
                .map((beautician) => (
                  <option key={beautician._id} value={beautician._id}>
                    {beautician.name}
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
        (filters.productId || filters.beauticianId) && (
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
                {filters.beauticianId &&
                  !filters.productId &&
                  "This beautician hasn't sold any products yet in the selected date range."}
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
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {[
            { id: "overview", name: "Overview" },
            { id: "products", name: "Products" },
            { id: "categories", name: "Categories" },
            { id: "beauticians", name: "Beauticians" },
            { id: "trends", name: "Trends" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
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

      {activeTab === "beauticians" && (
        <Card className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Beautician Performance
          </h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beautician
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
                  {beauticianData.map((beautician) => (
                    <tr key={beautician.beauticianId || "platform"}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                          {beautician.beauticianName}
                        </div>
                        {beautician.beauticianId ? (
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
                        {formatCurrency(beautician.totalRevenue)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-red-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(beautician.totalCost)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-brand-600 font-semibold text-xs sm:text-sm">
                        {formatCurrency(beautician.totalProfit)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold text-xs sm:text-sm ${
                            beautician.averageMargin > 50
                              ? "text-green-600"
                              : beautician.averageMargin > 30
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(beautician.averageMargin)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 text-xs sm:text-sm">
                        {beautician.totalQuantity}
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
    </div>
  );
}
