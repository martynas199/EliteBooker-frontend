import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import StripeConnectSettings from "../components/connect/StripeConnectSettings";

export default function StripeConnect() {
  const admin = useSelector(selectAdmin);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide mb-2">
          Stripe Connect
        </h1>
        <p className="text-gray-600 font-light leading-relaxed">
          Manage your Stripe Connect account to receive payments from bookings
          and product orders.
        </p>
      </div>

      {admin?.specialistId && admin?.email ? (
        <StripeConnectSettings
          specialistId={admin.specialistId}
          email={admin.email}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0"
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
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                Admin Account Not Linked
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Your admin account is not linked to a specialist profile. To
                manage Stripe Connect settings, you need to be linked to a
                specialist.
              </p>
              <p className="text-sm text-yellow-800">
                Ask a super admin to link your account in the{" "}
                <a
                  href="/admin/admin-links"
                  className="underline font-medium hover:text-yellow-900"
                >
                  Admin-Specialist Links
                </a>{" "}
                page.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
