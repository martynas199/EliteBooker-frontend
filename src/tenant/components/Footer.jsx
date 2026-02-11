import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useSettings } from "../../shared/contexts/SettingsContext";
import OptimizedImage from "../../shared/components/OptimizedImage";

export default function TenantFooter() {
  const { tenant } = useTenant();
  const { settings, salonData: data } = useSettings();
  const currentYear = new Date().getFullYear();

  const salonName = tenant?.name || settings?.salonName || "Beauty Salon";
  const salonDescription =
    tenant?.description ||
    settings?.salonDescription ||
    "Your trusted beauty destination";
  const salonAddress = settings?.salonAddress;
  const salonPhone = settings?.salonPhone;
  const salonEmail = settings?.salonEmail;

  // Format address for display
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

  return (
    <footer
      className="relative bg-gray-50 text-gray-600 overflow-hidden mt-20 border-t border-gray-200"
      style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="" className="inline-block mb-6 group">
              <div className="flex items-center gap-3">
                {tenant?.branding?.logo?.url ? (
                  <img
                    src={tenant.branding.logo.url}
                    alt={salonName}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-black text-xl group-hover:scale-105 transition-transform">
                      {salonName?.[0]?.toUpperCase() || "B"}
                    </div>
                    <span className="text-2xl font-black text-gray-900">
                      {salonName}
                    </span>
                  </>
                )}
              </div>
            </Link>

            <p className="text-base leading-relaxed mb-8 text-gray-600 max-w-md">
              {salonDescription}
            </p>

            {/* Contact Info */}
            {(formattedAddress || salonPhone || salonEmail) && (
              <div className="space-y-3 mb-8">
                {formattedAddress && (
                  <div className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5"
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
                    className="flex items-center gap-3 text-sm hover:text-gray-900 transition-colors group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-900"
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
                    className="flex items-center gap-3 text-sm hover:text-gray-900 transition-colors group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-900"
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

            {/* Call to Action Button */}
            <Link
              to={`/salon/${tenant?.slug}/services`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
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

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-black rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Services", path: "services" },
                { label: "About Us", path: "about" },
                // { label: "Shop", path: "products" }, // Hidden - focusing on bookings
                { label: "Contact", path: "contact" },
                { label: "FAQ", path: "faq" },
                { label: "Blog", path: "blog" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={`/salon/${tenant?.slug}/${item.path}`}
                    className="text-gray-600 hover:text-gray-900 transition-colors hover:translate-x-1 inline-block transform duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-black rounded-full"></div>
              Opening Hours
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              {settings?.businessHours || data?.hours ? (
                Object.entries({
                  mon: "Monday",
                  tue: "Tuesday",
                  wed: "Wednesday",
                  thu: "Thursday",
                  fri: "Friday",
                  sat: "Saturday",
                  sun: "Sunday",
                }).map(([key, label]) => {
                  const h =
                    settings?.businessHours?.[key] || data?.hours?.[key];
                  const isOpen = h?.open;
                  return (
                    <li key={key} className="flex justify-between gap-4">
                      <span>{label}</span>
                      <span className="font-semibold text-gray-900">
                        {isOpen && h?.start && h?.end
                          ? `${h.start} – ${h.end}`
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

            {/* Social Media */}
            <div className="mt-8">
              <h4 className="text-gray-900 font-semibold text-sm mb-4">
                Follow Us
              </h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-900 flex items-center justify-center transition-all group"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-900 flex items-center justify-center transition-all group"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-900 flex items-center justify-center transition-all group"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Left: Copyright and Links - all on same line */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="whitespace-nowrap">
                &copy; {currentYear}{" "}
                <span className="text-gray-900 font-semibold">{salonName}</span>
                . All rights reserved.
              </span>
              <Link
                to="privacy"
                className="hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                Privacy
              </Link>
              <Link
                to="terms"
                className="hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                Terms
              </Link>
            </div>

            {/* Right: Trust Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200 text-sm">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600 whitespace-nowrap">
                Secure Booking
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
