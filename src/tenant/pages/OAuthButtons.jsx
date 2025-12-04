import { useState, useEffect } from "react";
import Button from "../../shared/components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OAuthButtons({ context = "Sign in" }) {
  const [providers, setProviders] = useState({ google: false, apple: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check which OAuth providers are configured
    fetch(`${API_URL}/api/auth/providers`)
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to check OAuth providers:", err);
        setLoading(false);
      });
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleAppleLogin = () => {
    window.location.href = `${API_URL}/api/auth/apple`;
  };

  // Don't show anything if no providers are configured
  if (loading) {
    return null;
  }

  if (!providers.google && !providers.apple) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Google OAuth Button */}
      {providers.google && (
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
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
          <span>{context} with Google</span>
        </button>
      )}

      {/* Apple OAuth Button */}
      {providers.apple && (
        <button
          onClick={handleAppleLogin}
          className="w-full bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 shadow-sm hover:bg-gray-900 transition-all font-medium"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span>{context} with Apple</span>
        </button>
      )}
    </div>
  );
}
