const metricCards = [
  {
    key: "todayAppointments",
    label: "Today",
    getValue: (metrics) => metrics?.todayAppointments ?? 0,
  },
  {
    key: "upcomingAppointments",
    label: "Next 7 Days",
    getValue: (metrics) => metrics?.upcomingAppointments ?? 0,
  },
  {
    key: "noShowsThisMonth",
    label: "No-Shows (Month)",
    getValue: (metrics) => metrics?.noShowsThisMonth ?? 0,
  },
  {
    key: "thisMonthRevenue",
    label: "Revenue (Month)",
    getValue: (metrics) =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(Number(metrics?.thisMonthRevenue || 0)),
  },
];

function MetricSkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-7 w-20 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

export default function AppointmentsMetricsStrip({ metrics, loading = false }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metricCards.map((card) =>
        loading ? (
          <MetricSkeletonCard key={card.key} />
        ) : (
          <div
            key={card.key}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              {card.label}
            </p>
            <p className="mt-1.5 text-xl font-semibold text-gray-900 sm:text-2xl">
              {card.getValue(metrics)}
            </p>
          </div>
        ),
      )}
    </div>
  );
}
