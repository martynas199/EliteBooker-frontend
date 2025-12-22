import { Link } from "react-router-dom";
import OptimizedImage from "../../../shared/components/OptimizedImage";

export default function MapPopoverCard({ venue, onClose }) {
  if (!venue) return null;

  const defaultImage =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80";
  const venueImage =
    venue.centerImage?.url || venue.coverImage?.url || defaultImage;

  const rating = venue.rating || 5.0;
  const reviewCount = venue.reviewCount || 0;

  const minPrice = (() => {
    if (!venue.services || venue.services.length === 0) return null;
    const prices = venue.services.map((s) => s.price).filter(Boolean);
    return prices.length ? Math.min(...prices) : null;
  })();

  return (
    <div className="w-[320px] rounded-2xl overflow-hidden bg-white shadow-2xl border border-black/10">
      <div className="relative h-32 bg-gray-100">
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
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow flex items-center justify-center"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
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
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 leading-tight line-clamp-1">
              {venue.name}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5 text-gray-900 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.348l-2.417 1.753c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.95 8.499c-.783-.57-.38-1.81.588-1.81H8a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-gray-500">({reviewCount})</span>
              </span>
              {venue.distance !== undefined && (
                <span className="text-gray-500">
                  {venue.distance.toFixed(1)} mi
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            {minPrice ? (
              <div className="text-sm font-semibold text-gray-900">
                From £{minPrice}
              </div>
            ) : (
              <div className="text-xs text-gray-500">View prices</div>
            )}
            <div className="mt-1 inline-flex items-center gap-1 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              <span className="text-[11px] font-medium">Available</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            to={`/salon/${venue.slug}`}
            className="flex-1 inline-flex items-center justify-center h-10 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900"
          >
            View services
          </Link>
          <Link
            to={`/salon/${venue.slug}`}
            className="inline-flex items-center justify-center h-10 px-4 rounded-full border border-gray-300 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
