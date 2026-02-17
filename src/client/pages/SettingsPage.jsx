import { Settings } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { client, refreshProfile } = useClientAuth();

  return (
    <>
      <SEOHead title="Settings - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Settings"
        description="Manage your account preferences"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Account settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Name
              </p>
              <p className="font-medium text-gray-900">
                {client?.name || "Not set"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Email
              </p>
              <p className="font-medium text-gray-900 break-all">
                {client?.email || "Not set"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Phone
              </p>
              <p className="font-medium text-gray-900">
                {client?.phone || "Not set"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Account
              </p>
              <p className="font-medium text-gray-900">
                {client ? "Signed in" : "Signed out"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={refreshProfile}>
              Refresh profile
            </Button>
            <Button variant="brand" onClick={() => navigate("/client/profile")}>
              Go to profile
            </Button>
          </div>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
