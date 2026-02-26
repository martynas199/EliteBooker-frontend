import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import toast from "react-hot-toast";
import eliteLogo from "../../assets/elite.png";
import { setAuth } from "../../shared/state/authSlice";
import { useAdminLogin } from "../../shared/hooks/useAuthQueries";
import SentryErrorButton from "../../shared/components/dev/SentryErrorButton";

const inputClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginMutation = useAdminLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("adminRememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const { admin } = data;
          dispatch(setAuth({ token: null, admin }));

          if (rememberMe) {
            localStorage.setItem("adminRememberedEmail", email);
          } else {
            localStorage.removeItem("adminRememberedEmail");
          }

          toast.success("Login successful");
          navigate("/admin");
        },
        onError: (error) => {
          toast.error(error.message || "Login failed. Please try again.");
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#eef4ff] via-[#edf4ff] to-[#dfeeff] px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 right-8 h-56 w-56 rounded-full bg-sky-300/40 blur-3xl sm:right-20 sm:h-72 sm:w-72" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute top-20 left-12 h-44 w-44 rounded-full bg-slate-300/20 blur-3xl sm:h-56 sm:w-56" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full"
        >
          <div className="mb-6 text-center sm:mb-8">
            <img
              src={eliteLogo}
              alt="Elite Booker"
              className="mx-auto h-16 w-auto sm:h-20"
            />
            <p className="mt-3 inline-flex rounded-full border border-sky-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
              Admin Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Manage services, bookings, and payments from one dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className={inputClassName}
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={loginMutation.isPending}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="********"
                    className={`${inputClassName} pr-11`}
                    required
                    autoComplete="current-password"
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-sky-500"
                  />
                  Remember me
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="font-semibold text-slate-700 transition-colors hover:text-slate-900"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-blue-700 px-4 text-sm font-semibold text-white transition-all hover:from-slate-800 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in to dashboard"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-slate-800 transition-colors hover:text-black"
              >
                Start free trial
              </Link>
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 sm:text-sm">
            <Lock className="h-4 w-4" />
            Secure encrypted connection
          </p>

          {import.meta.env.DEV && (
            <div className="mt-4 flex justify-center">
              <SentryErrorButton />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

