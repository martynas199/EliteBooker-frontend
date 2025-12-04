import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTenant } from "../../shared/contexts/TenantContext";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

/**
 * TenantApp wrapper component
 * Handles tenant-specific routing for /salon/:slug/* paths
 * Automatically loads and applies tenant branding
 */
export default function TenantApp({ children }) {
  const { slug } = useParams();
  const { tenant, loading, error } = useTenant();

  // Tenant is automatically loaded by TenantContext based on URL
  // No need to manually load it here

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading salon...</p>
        </div>
      </div>
    );
  }

  // Error state - tenant not found
  if (error || (!loading && slug && !tenant)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Salon Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find a salon with the URL "{slug}". Please check the
              URL and try again.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Tenant loaded successfully, apply branding and render children
  // Branding is automatically applied by TenantContext
  return children;
}
