import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useSettings } from "../../shared/contexts/SettingsContext";

export default function TenantFooter() {
  const { tenant } = useTenant();
  const { settings, salonData: data } = useSettings();
  const selectedServicesCount = useSelector(
    (state) => state.booking.services?.length || 0
  );

  const currentYear = new Date().getFullYear();
  const salonName = tenant?.name || settings?.salonName || "Beauty Salon";
  const salonDescription =
    tenant?.description ||
    settings?.salonDescription ||
    "Your trusted beauty destination";
  const salonAddress = settings?.salonAddress;
  const salonPhone = settings?.salonPhone;
  const salonEmail = settings?.salonEmail;
  const homePath = tenant?.slug ? `/salon/${tenant.slug}` : "/";
  const footerBottomPadding =
    selectedServicesCount > 0
      ? "calc(7rem + env(safe-area-inset-bottom))"
      : "max(env(safe-area-inset-bottom), 1rem)";
  const socialLinks = settings?.socialLinks || {};
  const socialPlatforms = [
    { key: "instagram", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
    { key: "tiktok", label: "TikTok" },
    { key: "youtube", label: "YouTube" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "x", label: "X" },
  ];
  const activeSocialLinks = socialPlatforms.filter(
    (platform) => typeof socialLinks[platform.key] === "string" && socialLinks[platform.key].trim()
  );

  const formattedAddress = salonAddress
    ? [
        salonAddress.street,
        salonAddress.city,
        salonAddress.postalCode,
        salonAddress.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const weeklyBusinessHours = Object.entries({
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  });

  return (
    <footer
      className="relative mt-20 overflow-hidden border-t border-gray-200 bg-gray-50 text-gray-600"
      style={{ paddingBottom: footerBottomPadding }}
    >
      <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to={homePath} className="group mb-6 inline-block">
              <div className="flex items-center gap-3">
                {tenant?.branding?.logo?.url ? (
                  <img
                    src={tenant.branding.logo.url}
                    alt={salonName}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-xl font-black text-white transition-transform group-hover:scale-105">
                      {salonName?.[0]?.toUpperCase() || "B"}
                    </div>
                    <span className="text-2xl font-black text-gray-900">
                      {salonName}
                    </span>
                  </>
                )}
              </div>
            </Link>

            <p className="mb-8 max-w-md text-base leading-relaxed text-gray-600">
              {salonDescription}
            </p>

            {(formattedAddress || salonPhone || salonEmail) && (
              <div className="mb-8 space-y-3">
                {formattedAddress && (
                  <div className="flex items-start gap-3 text-sm">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-600">{formattedAddress}</span>
                  </div>
                )}

                {salonPhone && (
                  <a
                    href={`tel:${salonPhone}`}
                    className="group flex items-center gap-3 text-sm transition-colors hover:text-gray-900"
                  >
                    <svg
                      className="h-5 w-5 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-gray-600 group-hover:text-gray-900">
                      {salonPhone}
                    </span>
                  </a>
                )}

                {salonEmail && (
                  <a
                    href={`mailto:${salonEmail}`}
                    className="group flex items-center gap-3 text-sm transition-colors hover:text-gray-900"
                  >
                    <svg
                      className="h-5 w-5 text-gray-900"
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
                    <span className="text-gray-600 group-hover:text-gray-900">
                      {salonEmail}
                    </span>
                  </a>
                )}
              </div>
            )}

            <Link
              to={`/salon/${tenant?.slug}/services`}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-gray-800 hover:shadow-lg"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Book Appointment
            </Link>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <div className="h-6 w-1 rounded-full bg-black"></div>
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Services", path: "services" },
                { label: "About Us", path: "about" },
                { label: "Contact", path: "contact" },
                { label: "FAQ", path: "faq" },
                { label: "Blog", path: "blog" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={`/salon/${tenant?.slug}/${item.path}`}
                    className="group inline-flex items-center gap-2 text-gray-600 transition-colors duration-200 hover:translate-x-1 hover:text-gray-900"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <div className="h-6 w-1 rounded-full bg-black"></div>
              Opening Hours
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              {settings?.businessHours || data?.hours ? (
                weeklyBusinessHours.map(([key, label]) => {
                  const hours =
                    settings?.businessHours?.[key] || data?.hours?.[key];
                  const isOpen = hours?.open;
                  return (
                    <li key={key} className="flex justify-between gap-4">
                      <span>{label}</span>
                      <span className="font-semibold text-gray-900">
                        {isOpen && hours?.start && hours?.end
                          ? `${hours.start} - ${hours.end}`
                          : "Closed"}
                      </span>
                    </li>
                  );
                })
              ) : (
                <>
                  <li className="flex justify-between gap-4">
                    <span>Monday - Friday</span>
                    <span className="font-semibold text-gray-900">
                      9:00 - 18:00
                    </span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Saturday</span>
                    <span className="font-semibold text-gray-900">
                      10:00 - 16:00
                    </span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Sunday</span>
                    <span className="font-semibold text-gray-900">Closed</span>
                  </li>
                </>
              )}
            </ul>

            {activeSocialLinks.length > 0 && (
              <div className="mt-8">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                  Follow Us
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeSocialLinks.map((platform) => (
                    <a
                      key={platform.key}
                      href={socialLinks[platform.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-500 hover:text-gray-900"
                    >
                      {platform.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600 md:justify-start md:gap-6">
              <span className="text-center md:text-left">
                &copy; {currentYear}{" "}
                <span className="font-semibold text-gray-900">{salonName}</span>
                . All rights reserved.
              </span>
              <Link
                to="/privacy"
                className="whitespace-nowrap transition-colors hover:text-gray-900"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="whitespace-nowrap transition-colors hover:text-gray-900"
              >
                Terms
              </Link>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm">
              <svg
                className="h-4 w-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="whitespace-nowrap text-gray-600">
                Secure Booking
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
