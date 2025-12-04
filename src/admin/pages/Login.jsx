import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "../../shared/state/authSlice";
import { useAdminLogin } from "../../shared/hooks/useAuthQueries";
import logo from "../../assets/logo.svg";
import Button from "../../shared/components/ui/Button";
import FormField from "../../shared/components/forms/FormField";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useAdminLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          // Store admin data in Redux
          const { admin } = data;
          dispatch(setAuth({ token: null, admin })); // Token is in httpOnly cookie

          toast.success("Login successful!");

          // Redirect to admin dashboard
          navigate("/admin");
        },
        onError: (error) => {
          toast.error(error.message || "Login failed. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">B</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent mb-2">
            BookFlow
          </h1>
          <p className="text-gray-600">Business Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Email Address" htmlFor="email" required>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                required
                autoComplete="email"
                autoFocus
                disabled={loginMutation.isPending}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                  required
                  autoComplete="current-password"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2563EB] border-gray-300 rounded focus:ring-[#3B82F6]"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8]"
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#5B68F4] hover:text-[#7C5CFC] font-medium"
              >
                Get Started Free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Secure encrypted login</p>
        </div>
      </div>
    </div>
  );
}
