import { Link } from "react-router-dom";
import { useMemo } from "react";
import OptimizedImage from "../../../shared/components/OptimizedImage";

export default function MapPopoverCard({ venue, onClose }) {
  if (!venue) return null;

  const defaultImage =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80";
  const venueImage =
    venue.centerImage?.url || venue.coverImage?.url || defaultImage;

  const rating = venue.rating || 5.0;
  const reviewCount = venue.reviewCount || 0;

  const minPrice = useMemo(() => {
    const prices = (venue.services || [])
      .map((service) => service?.price)
      .filter((price) => typeof price === "number" && price > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [venue.services]);

  return (
    <div className="w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
      <div className="relative h-32 bg-slate-100">
        <OptimizedImage
          src={venueImage}
          alt={venue.name}
          width={640}
          height={256}
          crop="fill"
          quality="auto"
          format="auto"
          loading="eager"
          blur={false}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow transition-colors hover:bg-white"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>
        <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Open
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="line-clamp-1 font-semibold leading-tight text-slate-900">
              {venue.name}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 fill-current text-slate-900"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.348l-2.417 1.753c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.95 8.499c-.783-.57-.38-1.81.588-1.81H8a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-slate-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-slate-500">({reviewCount})</span>
              </span>
              {venue.distance !== undefined && (
                <span className="text-slate-500">{venue.distance.toFixed(1)} mi</span>
              )}
            </div>
          </div>

          <div className="text-right">
            {minPrice ? (
              <div className="text-sm font-semibold text-slate-900">
                From £{minPrice}
              </div>
            ) : (
              <div className="text-xs text-slate-500">View prices</div>
            )}
            <div className="mt-1 inline-flex items-center gap-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-medium">Available</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            to={`/salon/${venue.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-sm font-semibold text-white hover:from-slate-800 hover:to-slate-700"
          >
            View services
          </Link>
          <Link
            to={`/salon/${venue.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
