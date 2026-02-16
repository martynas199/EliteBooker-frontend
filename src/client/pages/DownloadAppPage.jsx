import { Download } from "lucide-react";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function DownloadAppPage() {
  return (
    <>
      <SEOHead title="Download the App - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Download the app"
        description="Get faster booking access on mobile"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mobile app</h2>
              <p className="text-gray-600 mt-1">
                App download links will be available here soon.
              </p>
            </div>
          </div>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
