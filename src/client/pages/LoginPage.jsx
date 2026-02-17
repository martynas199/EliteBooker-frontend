import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import SEOHead from "../../shared/components/seo/SEOHead";
import Button from "../../shared/components/ui/Button";
import Input from "../../shared/components/ui/Input";

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useClientAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get("redirect");
  const storedRedirect = sessionStorage.getItem("clientAuthRedirectPath");
  const isSafeRedirect = (path) => {
    if (!path || typeof path !== "string") return false;
    if (!path.startsWith("/")) return false;
    if (path.startsWith("//")) return false;
    if (
      path.startsWith("/client/login") ||
      path.startsWith("/client/register")
    ) {
      return false;
    }
    return true;
  };
  const from = isSafeRedirect(location.state?.from)
    ? location.state.from
    : isSafeRedirect(redirectParam)
    ? redirectParam
    : isSafeRedirect(storedRedirect)
    ? storedRedirect
    : "/client/profile";

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      sessionStorage.removeItem("clientAuthRedirectPath");

      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL || "http://localhost:4000"
    }/api/oauth/google`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Log In - EliteBooker"
        description="Log in to your EliteBooker account to manage your bookings and appointments."
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div className="hidden lg:flex rounded-2xl border border-gray-200 bg-white p-8 flex-col gap-8 self-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wide">
                  Client Account
                </div>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
                  Welcome back
                </h1>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Sign in to manage bookings, update your details, and rebook
                  your favorite services faster.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-600">✓</span>
                  <span>Track upcoming and past appointments</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-600">✓</span>
                  <span>Save details for a faster checkout</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-600">✓</span>
                  <span>Access bookings across businesses</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Log in to your account
                </h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  New here?{" "}
                  <Link
                    to={`/client/register?redirect=${encodeURIComponent(from)}`}
                    state={{ from }}
                    className="font-semibold text-black hover:text-gray-700"
                  >
                    Create a client account
                  </Link>
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-600">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 border-gray-300 rounded"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/client/forgot-password"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center">
                  <Link
                    to="/"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Back to home
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
