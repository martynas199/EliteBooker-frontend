import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, setAuth } from "../state/authSlice";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useEffect, useState } from "react";
import { api } from "../lib/apiClient";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Verify authentication with backend
    // This checks for HttpOnly cookies and restores Redux state if needed
    const verifyAuth = async () => {
      try {
        // Always call /auth/me to verify HttpOnly cookies
        // This will work even if Redux state is not initialized
        const response = await api.get("/auth/me");

        if (response.data.success && response.data.admin) {
          setIsValid(true);
          // Restore Redux auth state from cookie-based session
          // This works after page refresh or when cookies are set via cy.session()
          dispatch(setAuth({ admin: response.data.admin }));
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyAuth();
  }, [dispatch]);

  // Show loading spinner while verifying
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if token is invalid
  if (!isValid) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return children;
}
