import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../shared/contexts/TenantContext';
import { useCurrency } from '../../shared/contexts/CurrencyContext';
import dayjs from 'dayjs';
import Card from '../../shared/components/ui/Card';

/**
 * BookingSummary - Sticky booking summary sidebar/footer
 * 
 * Reduces "back button anxiety" by always showing:
 * - Selected services with variants
 * - Chosen specialist
 * - Date and time
 * - Total duration
 * - Total price
 * 
 * Sticky on desktop (right sidebar), bottom on mobile
 * Hidden on landing page
 */
export default function BookingSummary({ className = '' }) {
  const location = useLocation();
  const booking = useSelector((s) => s.booking);
  const { tenant } = useTenant();
  const { formatPrice } = useCurrency();

  // Check if we're on the landing page
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLandingPage = pathSegments.length === 2 && pathSegments[0] === 'salon';
  
  // Don't show on landing page
  if (isLandingPage) return null;

  const {
    service,
    services,
    specialist,
    time,
  } = booking;

  // Don't show if no services selected
  const hasServices = services?.length > 0 || service;
  if (!hasServices) return null;

  // Calculate totals
  const allServices = services?.length > 0 ? services : service ? [service] : [];
  const totalDuration = allServices.reduce((sum, svc) => sum + (svc.durationMin || 0), 0);
  const totalPrice = allServices.reduce((sum, svc) => sum + (svc.price || 0), 0);

  // Format date/time
  const formattedDateTime = time
    ? dayjs(time).format('ddd, MMM D, YYYY [at] h:mm A')
    : 'Not selected';

  return (
    <Card elevated className={`sticky top-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-gray-900">Your Booking</h3>
          <p className="text-sm text-gray-500 mt-1">
            {allServices.length} {allServices.length === 1 ? 'service' : 'services'} selected
          </p>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Services
          </p>
          {allServices.map((svc, index) => (
            <div key={index} className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {svc.serviceName}
                </p>
                <p className="text-sm text-gray-500">
                  {svc.variantName} • {svc.durationMin} min
                </p>
              </div>
              <p className="font-semibold text-gray-900 flex-shrink-0">
                {formatPrice(svc.price)}
              </p>
            </div>
          ))}
        </div>

        {/* Specialist */}
        {specialist && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Specialist
            </p>
            <p className="text-sm text-gray-900">
              {specialist.any ? 'Any available specialist' : specialist.name || 'Selected specialist'}
            </p>
          </div>
        )}

        {/* Date & Time */}
        {time && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Date & Time
            </p>
            <p className="text-sm text-gray-900">{formattedDateTime}</p>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t-2 border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Duration</span>
            <span className="font-semibold text-gray-900">
              {totalDuration} min
            </span>
          </div>
        </div>

        {/* Reassurance */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>You won't be charged until checkout</span>
          </div>
          {tenant?.cancellationPolicy && (
            <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free cancellation up to 24 hours before</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
