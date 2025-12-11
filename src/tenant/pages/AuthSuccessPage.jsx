import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../shared/contexts/AuthContext";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

export default function AuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        login(userData, token);
        // OAuth login is for global clients, redirect to client profile
        navigate("/client/profile", { replace: true });
      } catch (error) {
        console.error("Auth success error:", error);
        navigate("/login", { replace: true });
      }
    } else if (token) {
      // OAuth flow with token in URL - this shouldn't happen with httpOnly cookies
      // Redirect to login since proper OAuth sets cookie on backend
      console.error(
        "Unexpected token in URL - OAuth should use httpOnly cookies"
      );
      navigate("/login", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
