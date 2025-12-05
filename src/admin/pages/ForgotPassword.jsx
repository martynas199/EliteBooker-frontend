import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../../shared/hooks/useAuthQueries";
import Button from "../../shared/components/ui/Button";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    forgotPasswordMutation.mutate(email.trim().toLowerCase(), {
      onSuccess: () => {
        setSubmitted(true);
        toast.success(
          "If an account exists, a reset link has been sent to your email"
        );
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send reset email");
      },
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                If an account exists with <strong>{email}</strong>, you will
                receive a password reset link shortly.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>⏱️ The link expires in 10 minutes</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Please check your spam folder if you don't see the email
                  within a few minutes.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Try Another Email
              </Button>
              <Link to="/admin/login">
                <Button variant="brand" size="lg" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">B</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent mb-2">
            Elite Booker
          </h1>
          <p className="text-gray-600">Business Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="admin@nobleelegance.com"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full"
              loading={forgotPasswordMutation.isPending}
              disabled={forgotPasswordMutation.isPending}
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="text-[#3B82F6] hover:text-[#2563EB] font-medium inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Remember your password?{" "}
            <Link
              to="/admin/login"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
