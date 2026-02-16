import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import SEOHead from "../../shared/components/seo/SEOHead";
import Button from "../../shared/components/ui/Button";
import Input from "../../shared/components/ui/Input";

export default function ClientRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, loading } = useClientAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get("redirect");
  const isSafeRedirect = (path) => {
    if (!path || typeof path !== "string") return false;
    if (!path.startsWith("/")) return false;
    if (path.startsWith("//")) return false;
    if (path.startsWith("/client/login") || path.startsWith("/client/register")) {
      return false;
    }
    return true;
  };
  const from = isSafeRedirect(location.state?.from)
    ? location.state.from
    : isSafeRedirect(redirectParam)
      ? redirectParam
      : "/client/profile";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
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
        title="Sign Up - EliteBooker"
        description="Create your EliteBooker account to start booking beauty appointments."
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div className="hidden lg:flex rounded-2xl border border-gray-200 bg-white p-8 flex-col gap-8 self-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wide">
                  New Client
                </div>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
                  Create your client account
                </h1>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Register once to keep your booking history, manage upcoming
                  appointments, and rebook in seconds.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-600">✓</span>
                  <span>Access bookings across businesses</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-600">✓</span>
                  <span>Save details for quicker checkout</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-600">✓</span>
                  <span>Easily manage your appointments</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Create your account
                </h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to={`/client/login?redirect=${encodeURIComponent(from)}`}
                    state={{ from }}
                    className="font-semibold text-black hover:text-gray-700"
                  >
                    Log in
                  </Link>
                </p>
              </div>

              <button
                onClick={handleGoogleSignup}
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
                Sign up with Google
              </button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-600">
                      Or sign up with email
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
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Full name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Phone number (optional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07123456789"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-gray-900 hover:text-black"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="font-medium text-gray-900 hover:text-black"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
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
