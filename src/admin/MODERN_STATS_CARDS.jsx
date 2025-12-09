/* Modern Dashboard Stats Cards - Copy this to replace the stats cards section */

{
  /* Stats Cards - Modern Design */
}
{
  (isSuperAdmin || admin?.specialistId) && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {/* Revenue Card */}
      <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            {/* Icon */}
            <div className="p-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg shadow-brand-500/20 group-hover:shadow-xl group-hover:shadow-brand-500/30 group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-7 h-7 text-white"
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

            {/* Trend Badge */}
            {stats.revenueTrend !== 0 && (
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  stats.revenueTrend > 0
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    stats.revenueTrend > 0 ? "rotate-0" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>{Math.abs(stats.revenueTrend).toFixed(1)}%</span>
              </div>
            )}
          </div>

          {/* Stats Content */}
          <div className="space-y-2">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Monthly Revenue
            </p>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(stats.thisMonthRevenue)}
            </p>
            <p className="text-gray-400 text-sm font-medium">
              Total: {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Appointments Card */}
      <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-7 h-7 text-white"
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
            {stats.appointmentsTrend !== 0 && (
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  stats.appointmentsTrend > 0
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    stats.appointmentsTrend > 0 ? "rotate-0" : "rotate-180"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>{Math.abs(stats.appointmentsTrend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
              This Month
            </p>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {stats.totalAppointments}
            </p>
            <p className="text-gray-400 text-sm font-medium">
              Appointments scheduled
            </p>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20 group-hover:shadow-xl group-hover:shadow-orange-500/30 group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
              <span>Today</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Appointments
            </p>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {stats.todayAppointments}
            </p>
            <p className="text-gray-400 text-sm font-medium">
              Scheduled for today
            </p>
          </div>
        </div>
      </div>

      {/* Total Customers */}
      <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/20 group-hover:shadow-xl group-hover:shadow-green-500/30 group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-7 h-7 text-white"
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
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Total Customers
            </p>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {stats.uniqueCustomers}
            </p>
            <p className="text-gray-400 text-sm font-medium">
              Unique clients served
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
