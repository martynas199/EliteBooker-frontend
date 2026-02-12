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
    const addressParts = [venue.address.street, venue.address.city].filter(
      Boolean
    );
    return addressParts.length ? addressParts.join(", ") : "Address not available";
  }, [venue.address]);

  const topServices = useMemo(() => {
    const services = Array.isArray(venue.services) ? venue.services : [];
    const normalizedServices = services
      .map((service) => ({
        name: service?.name || "Service",
        price:
          typeof service?.price === "number" && service.price > 0
            ? service.price
            : null,
        durationMin:
          typeof service?.durationMin === "number" && service.durationMin > 0
            ? service.durationMin
            : null,
      }))
      .filter((service) => service.name);

    normalizedServices.sort((a, b) => (a.price ?? 9999) - (b.price ?? 9999));
    return normalizedServices.slice(0, 3);
  }, [venue.services]);

  const minPrice = useMemo(() => {
    const prices = (venue?.services || [])
      .map((service) => service?.price)
      .filter((price) => typeof price === "number" && price > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [venue?.services]);

  return (
    <Link
      to={`/salon/${venue.slug}`}
      onClick={onClick}
      className={[
        "group block overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        active
          ? "border-slate-900 shadow-xl shadow-slate-900/10"
          : "border-slate-200 hover:border-slate-300 hover:shadow-lg",
      ].join(" ")}
    >
      <div className="relative h-44 bg-slate-100 sm:h-48">
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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Open
        </div>
        {venue.distance !== undefined && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/75 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-white">
              {venue.distance.toFixed(1)} mi
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-base font-semibold leading-tight text-slate-900">
              {venue.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">{address}</p>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1">
                <svg
                  className="h-4 w-4 fill-current text-slate-900"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.348l-2.417 1.753c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.95 8.499c-.783-.57-.38-1.81.588-1.81H8a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-slate-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-slate-500">({reviewCount})</span>
              </span>

              <span className="inline-flex items-center gap-1 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span className="text-xs font-medium">Available</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500">From</div>
            <div className="text-base font-semibold text-slate-900">
              {minPrice ? `£${minPrice}` : "—"}
            </div>
          </div>
        </div>

        {topServices.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60">
            {topServices.map((service, index) => (
              <div
                key={`${service.name}-${index}`}
                className={`flex items-center justify-between px-3 py-2.5 ${
                  index !== topServices.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="line-clamp-1 text-sm font-medium text-slate-900">
                    {service.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {service.durationMin ? `${service.durationMin} min` : "—"}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {service.price ? `£${service.price}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <span className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-sm font-semibold text-white group-hover:from-slate-800 group-hover:to-slate-700">
            View services
          </span>
          <span className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-900 group-hover:bg-slate-50">
            Details
          </span>
        </div>
      </div>
    </Link>
  );
}
