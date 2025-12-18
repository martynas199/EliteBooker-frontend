import { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { clearBooking } from '../state/bookingSlice';

/**
 * useBookingGuard - Protects against losing booking state
 * 
 * Returns modal state and handlers for showing confirmation dialog
 * Page components should use Link wrapper or call checkNavigation before navigating
 */
export function useBookingGuard() {
  const location = useLocation();
  const dispatch = useDispatch();
  const services = useSelector((state) => state.booking.services || []);
  const hasServices = services.length > 0;
  const [showModal, setShowModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Define booking flow paths (relative to /salon/:slug)
  const bookingPaths = [
    '/services',
    '/specialists',
    '/times',
    '/checkout',
    '/confirmation',
  ];

  // Check if current path is in booking flow
  const isInBookingFlow = useCallback(() => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = '/' + pathSegments[pathSegments.length - 1];
    return bookingPaths.includes(lastSegment);
  }, [location.pathname]);

  // Check if path is in booking flow
  const isPathInBookingFlow = useCallback((pathname) => {
    const pathSegments = pathname.split('/');
    const lastSegment = '/' + pathSegments[pathSegments.length - 1];
    return bookingPaths.includes(lastSegment);
  }, []);

  // Warn user before closing browser/tab if services selected
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasServices && isInBookingFlow()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasServices, isInBookingFlow]);

  // Handle modal confirmation
  const handleConfirmLeave = useCallback(() => {
    setShowModal(false);
    dispatch(clearBooking());
    
    // Execute pending navigation callback
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [dispatch, pendingNavigation]);

  // Handle modal cancel
  const handleCancelLeave = useCallback(() => {
    setShowModal(false);
    setPendingNavigation(null);
  }, []);

  // Check if navigation should be blocked
  const shouldBlock = useCallback((targetPath) => {
    if (!hasServices) return false;
    if (!isInBookingFlow()) return false;
    if (isPathInBookingFlow(targetPath)) return false;
    if (targetPath.includes('/success') || targetPath.includes('/cancel')) return false;
    return true;
  }, [hasServices, isInBookingFlow, isPathInBookingFlow]);

  // Intercept navigation
  const checkNavigation = useCallback((targetPath, onProceed) => {
    if (shouldBlock(targetPath)) {
      setPendingNavigation(() => onProceed);
      setShowModal(true);
      return false; // Block navigation
    }
    return true; // Allow navigation
  }, [shouldBlock]);

  return {
    hasServices,
    isInBookingFlow: isInBookingFlow(),
    clearBooking: () => dispatch(clearBooking()),
    showModal,
    onConfirmLeave: handleConfirmLeave,
    onCancelLeave: handleCancelLeave,
    checkNavigation,
  };
}

/**
 * useBookingAutoCleanup - Automatically clears booking on landing page
 * 
 * Use this on the landing page to ensure clean state
 */
export function useBookingAutoCleanup() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Check if we're on the landing page (just /salon/:slug)
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const isLandingPage = pathSegments.length === 2 && pathSegments[0] === 'salon';

    if (isLandingPage) {
      // Clear any stale booking state when landing on home
      dispatch(clearBooking());
    }
  }, [location.pathname, dispatch]);
}
