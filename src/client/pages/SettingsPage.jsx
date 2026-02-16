import { Settings } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

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
            <h2 className="text-lg font-semibold text-gray-900">Account settings</h2>
          </div>
          <p className="text-gray-600 mb-6">Update your profile details and preferences from your profile page.</p>
          <Button variant="brand" onClick={() => navigate("/client/profile")}>Go to profile</Button>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
