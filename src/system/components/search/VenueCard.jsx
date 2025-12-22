import { Link } from "react-router-dom";
import { useMemo } from "react";
import OptimizedImage from "../../../shared/components/OptimizedImage";

export default function VenueCard({ venue, active, onClick }) {
  const defaultImage =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80";
  const venueImage =
    venue.centerImage?.url || venue.coverImage?.url || defaultImage;

  const rating = venue.rating || 5.0;
  const reviewCount = venue.reviewCount || 0;

  const address = useMemo(() => {
    if (!venue.address) return "Address not available";
    if (typeof venue.address === "string") return venue.address;
    const parts = [venue.address.street, venue.address.city].filter(Boolean);
    return parts.length ? parts.join(", ") : "Address not available";
  }, [venue.address]);

  const topServices = useMemo(() => {
    const services = Array.isArray(venue.services) ? venue.services : [];
    const normalized = services
      .map((s) => ({
        name: s?.name || "Service",
        price: s?.price,
        durationMin: s?.durationMin,
      }))
      .filter((s) => s.name);

    normalized.sort((a, b) => (a.price ?? 9999) - (b.price ?? 9999));
    return normalized.slice(0, 3);
  }, [venue.services]);

  return (
    <Link
      to={`/salon/${venue.slug}`}
      onClick={onClick}
      className={[
        "group block bg-white rounded-2xl overflow-hidden border transition-all duration-200",
        active
          ? "border-black shadow-xl"
          : "border-gray-200 hover:border-gray-300 hover:shadow-lg",
      ].join(" ")}
    >
      <div className="relative h-48 bg-gray-100">
        <OptimizedImage
          src={venueImage}
          alt={venue.name}
          width={900}
          height={500}
          crop="fill"
          quality="auto"
          format="auto"
          loading="lazy"
          blur={false}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        {venue.distance !== undefined && (
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-[11px] font-semibold text-white">
              {venue.distance.toFixed(1)} mi
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
              {venue.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">{address}</p>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-gray-900 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.348l-2.417 1.753c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.95 8.499c-.783-.57-.38-1.81.588-1.81H8a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-gray-500">({reviewCount})</span>
              </span>

              <span className="inline-flex items-center gap-1 text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                <span className="text-xs font-medium">Available</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">From</div>
            <div className="text-base font-semibold text-gray-900">
              £
              {venue?.services?.length
                ? Math.min(...venue.services.map((s) => s.price || Infinity))
                : "—"}
            </div>
          </div>
        </div>

        {/* Top services preview */}
        {topServices.length > 0 && (
          <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
            {topServices.map((s, idx) => (
              <div
                key={`${s.name}-${idx}`}
                className="flex items-center justify-between px-3 py-2.5 bg-white"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {s.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {s.durationMin ? `${s.durationMin} min` : "—"}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {s.price ? `£${s.price}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <span className="flex-1 inline-flex items-center justify-center h-10 rounded-full bg-black text-white text-sm font-semibold group-hover:bg-gray-900">
            View services
          </span>
          <span className="inline-flex items-center justify-center h-10 px-4 rounded-full border border-gray-300 text-sm font-semibold text-gray-900 group-hover:bg-gray-50">
            Details
          </span>
        </div>
      </div>
    </Link>
  );
}
