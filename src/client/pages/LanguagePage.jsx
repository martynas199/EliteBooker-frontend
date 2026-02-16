import { Globe } from "lucide-react";
import ClientAccountPageShell from "./ClientAccountPageShell";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function LanguagePage() {
  return (
    <>
      <SEOHead title="Language - EliteBooker" noindex={true} />
      <ClientAccountPageShell
        title="Language"
        description="Choose your preferred language"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current language: English</h2>
              <p className="text-gray-600 mt-1">
                Multi-language selection will be available here soon.
              </p>
            </div>
          </div>
        </div>
      </ClientAccountPageShell>
    </>
  );
}
