import { useEffect, useState, useMemo } from "react";
import { SalonAPI } from "./salon.api";
import { api } from "../../shared/lib/apiClient";
import { useTenant } from "../../shared/contexts/TenantContext";
import Card from "../../shared/components/ui/Card";
import SEOHead from "../../shared/components/seo/SEOHead";
import {
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from "../../shared/utils/schemaGenerator";

const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export default function SalonDetails() {
  const { tenant } = useTenant();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [salonResponse, settingsResponse] = await Promise.all([
          SalonAPI.get().catch(() => null),
          api.get("/settings").catch(() => ({ data: null })),
        ]);
        setData(salonResponse);
        setSettings(settingsResponse.data);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
    loadData();
  }, []);

  const salonName = tenant?.name || settings?.salonName || "Beauty Salon";
  const salonDescription =
    tenant?.description || settings?.salonDescription || "";
  const salonAddress = settings?.salonAddress;
  const salonPhone = settings?.salonPhone;
  const salonEmail = settings?.salonEmail;
  const businessHours = settings?.businessHours;

  // Format address as a string for display and map query
  const formattedAddress = useMemo(() => {
    if (!salonAddress) return "";
    const parts = [
      salonAddress.street,
      salonAddress.city,
      salonAddress.postalCode,
      salonAddress.country,
    ].filter(Boolean);
    return parts.join(", ");
  }, [salonAddress]);

  const mapUrl = useMemo(
    () =>
      formattedAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            formattedAddress
          )}`
        : null,
    [formattedAddress]
  );

  // Generate schemas
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/salon" },
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [localBusinessSchema, breadcrumbSchema],
  };

  return (
    <div className="pb-10">
      {/* SEO Meta Tags */}
      <SEOHead
        title={`Contact ${salonName} | Bookings, Hours & Support`}
        description={`${
          formattedAddress ? `Visit us at ${formattedAddress}. ` : ""
        }${
          salonPhone ? `Call ${salonPhone} or message our team. ` : ""
        }We can help with appointment availability, rescheduling, and account support.`}
        keywords={`contact ${salonName}, appointment support, booking help, service business contact, opening hours, reschedule appointment`}
        schema={combinedSchema}
      />

      {/* Hero */}
      {data?.heroUrl ? (
        <div
          className="w-full h-56 md:h-72 bg-gray-100"
          style={{
            backgroundImage: `url(${data.heroUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <div className="w-full h-16" />
      )}

      <div className="max-w-6xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
            Contact {salonName}
          </h1>
          {salonDescription && (
            <p className="text-gray-700 text-lg leading-relaxed">
              {salonDescription}
            </p>
          )}
        </div>

        {/* Google Maps Embed */}
        {settings?.mapEmbedUrl && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <iframe
              src={settings.mapEmbedUrl}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${salonName} Location${
                salonAddress ? ` - ${salonAddress}` : ""
              }`}
            ></iframe>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Contact */}
          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="font-bold text-lg text-gray-900 mb-4">
              Contact Information
            </div>
            {formattedAddress && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Address</div>
                <div className="font-medium text-gray-900">
                  {salonAddress.street && <div>{salonAddress.street}</div>}
                  {(salonAddress.city || salonAddress.postalCode) && (
                    <div>
                      {[salonAddress.city, salonAddress.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                  {salonAddress.country && <div>{salonAddress.country}</div>}
                </div>
              </div>
            )}
            {salonPhone && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Phone</div>
                <a
                  className="text-gray-900 hover:text-gray-700 underline font-medium"
                  href={`tel:${salonPhone.replace(/\s/g, "")}`}
                >
                  {salonPhone}
                </a>
              </div>
            )}
            {salonEmail && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <a
                  className="text-gray-900 hover:text-gray-700 underline font-medium break-all"
                  href={`mailto:${salonEmail}`}
                >
                  {salonEmail}
                </a>
              </div>
            )}
            {mapUrl && (
              <a
                className="inline-flex items-center gap-2 mt-2 text-gray-900 hover:text-gray-700 font-medium underline"
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Get Directions
              </a>
            )}
          </Card>

          {/* Opening hours */}
          <Card className="p-6 md:col-span-2 border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7v5l3 2"
                />
              </svg>
              <div className="font-bold text-lg text-gray-900">
                Opening Hours
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(DAY_LABELS).map(([key, label]) => {
                const h = businessHours?.[key] || data?.hours?.[key];
                const isToday =
                  new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  }) === label;
                const isOpen = h?.open;

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                      isToday
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{label}</div>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-white text-gray-900 text-[10px] font-semibold rounded-full uppercase">
                          Today
                        </span>
                      )}
                    </div>
                    <div className={`font-medium flex items-center gap-1.5`}>
                      {isOpen ? (
                        <>
                          <svg
                            className={`w-4 h-4 ${
                              isToday ? "text-green-400" : "text-green-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            {h.start} – {h.end}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className={`w-4 h-4 ${
                              isToday ? "text-gray-400" : "text-gray-500"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Closed</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
