import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import api from "../../shared/lib/api";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function TenantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [expandedSpecialist, setExpandedSpecialist] = useState(null);
  const [specialistDetails, setSpecialistDetails] = useState({});
  const [error, setError] = useState("");

  // Check if user has access (super admin or support)
  const isSuperAdmin = admin?.role === "super_admin";
  const isSupport = admin?.role === "support";
  const hasAccess = isSuperAdmin || isSupport;

  useEffect(() => {
    if (hasAccess && id) {
      fetchTenantDetails();
      fetchSpecialists();
    }
  }, [id, hasAccess]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tenants/${id}`);
      setTenant(response.data);
    } catch (err) {
      console.error("Failed to load tenant:", err);
      setError(err.response?.data?.error || "Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    try {
      // Fetch specialists for this tenant
      const response = await api.get(`/api/specialists?tenantId=${id}`);
      setSpecialists(response.data || []);
    } catch (err) {
      console.error("Failed to load specialists:", err);
    }
  };

  const fetchSpecialistDetails = async (specialistId) => {
    if (specialistDetails[specialistId]) {
      return; // Already loaded
    }

    try {
      // Get the specialist object to access workingHours and customSchedule directly
      const specialist = specialists.find((s) => s._id === specialistId);

      const [servicesRes, timeOffRes] = await Promise.all([
        api
          .get(`/api/services?specialistId=${specialistId}&tenantId=${id}`)
          .catch(() => ({ data: [] })),
        api
          .get(`/api/timeoff?specialistId=${specialistId}&tenantId=${id}`)
          .catch(() => ({ data: [] })),
      ]);

      setSpecialistDetails((prev) => ({
        ...prev,
        [specialistId]: {
          services: servicesRes.data,
          workingHours: specialist?.workingHours || [],
          customSchedule: specialist?.customSchedule || {},
          timeOff: timeOffRes.data,
        },
      }));
    } catch (err) {
      console.error("Failed to load specialist details:", err);
    }
  };

  const toggleSpecialist = (specialistId) => {
    if (expandedSpecialist === specialistId) {
      setExpandedSpecialist(null);
    } else {
      setExpandedSpecialist(specialistId);
      fetchSpecialistDetails(specialistId);
    }
  };

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            This page is only accessible to super administrators and support
            team members.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error || "Tenant not found"}</p>
          <button
            onClick={() => navigate("/admin/tenants")}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/tenants")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tenants
        </button>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
          {tenant.businessName || tenant.name}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">{tenant.slug}</p>
      </div>

      {/* Tenant Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Business Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="text-gray-900 font-medium">
                  {tenant.businessName || tenant.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{tenant.email}</p>
              </div>
            </div>

            {tenant.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{tenant.phone}</p>
                </div>
              </div>
            )}

            {tenant.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">
                    {[
                      tenant.address.street,
                      tenant.address.city,
                      tenant.address.state,
                      tenant.address.postalCode,
                      tenant.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}

            {tenant.domains && tenant.domains.length > 0 && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Domains</p>
                  {tenant.domains.map((domain, idx) => (
                    <p key={idx} className="text-gray-900">
                      {domain.domain}
                      {domain.isPrimary && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                      {domain.verified ? (
                        <CheckCircle className="inline w-4 h-4 text-green-600 ml-1" />
                      ) : (
                        <XCircle className="inline w-4 h-4 text-red-600 ml-1" />
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Account Status</p>
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  tenant.status === "active"
                    ? "bg-green-100 text-green-800"
                    : tenant.status === "suspended"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {tenant.status || "unknown"}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Plan</p>
              <span className="text-gray-900 font-medium capitalize">
                {tenant.plan || "N/A"}
              </span>
            </div>

            {tenant.timezone && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Timezone</p>
                <p className="text-gray-900">{tenant.timezone}</p>
              </div>
            )}

            {tenant.currency && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Currency</p>
                <p className="text-gray-900">{tenant.currency}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-gray-900">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Specialists Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Specialists ({specialists.length})
        </h2>

        {specialists.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No specialists found</p>
        ) : (
          <div className="space-y-4">
            {specialists.map((specialist) => (
              <div
                key={specialist._id}
                className="border border-gray-200 rounded-xl"
              >
                {/* Specialist Header */}
                <button
                  onClick={() => toggleSpecialist(specialist._id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {specialist.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {specialist.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stripe Status */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">
                        Stripe Status
                      </p>
                      {specialist.stripeAccountId ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Not Connected
                        </span>
                      )}
                    </div>

                    {expandedSpecialist === specialist._id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Specialist Details */}
                {expandedSpecialist === specialist._id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {!specialistDetails[specialist._id] ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Services */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Services (
                            {specialistDetails[specialist._id]?.services
                              ?.length || 0}
                            )
                          </h4>
                          {specialistDetails[specialist._id]?.services?.length >
                          0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {specialistDetails[specialist._id].services.map(
                                (service) => (
                                  <div
                                    key={service._id}
                                    className="bg-white p-3 rounded border border-gray-200"
                                  >
                                    <p className="font-medium text-gray-900">
                                      {service.name}
                                    </p>
                                    {service.variants &&
                                    service.variants.length > 0 ? (
                                      service.variants.map((variant, vIdx) => (
                                        <div
                                          key={vIdx}
                                          className="flex justify-between text-sm text-gray-500 mt-1"
                                        >
                                          <span>
                                            {variant.durationMin} min
                                            {variant.name &&
                                              ` - ${variant.name}`}
                                          </span>
                                          <span>
                                            {variant.price
                                              ? `${service.currency || "£"}${
                                                  variant.price
                                                }`
                                              : "No price"}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                                        <span>
                                          {service.durationMin ||
                                            service.duration}{" "}
                                          min
                                        </span>
                                        <span>
                                          {service.priceVaries
                                            ? "Price varies"
                                            : service.price
                                            ? `${service.currency || "£"}${
                                                service.price
                                              }`
                                            : "No price set"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No services assigned
                            </p>
                          )}
                        </div>

                        {/* Working Hours */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Working Hours
                          </h4>
                          {specialistDetails[specialist._id]?.workingHours
                            ?.length > 0 ? (
                            <div className="space-y-2 bg-white p-3 rounded border border-gray-200 max-h-64 overflow-y-auto">
                              {specialistDetails[
                                specialist._id
                              ].workingHours.map((wh, idx) => {
                                const dayNames = [
                                  "Sunday",
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                ];
                                const dayName =
                                  dayNames[wh.dayOfWeek] || "Unknown";
                                return (
                                  <div
                                    key={idx}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-gray-700 capitalize font-medium">
                                      {dayName}
                                    </span>
                                    <span className="text-gray-600">
                                      {wh.start && wh.end
                                        ? `${wh.start} - ${wh.end}`
                                        : "Closed"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No schedule configured
                            </p>
                          )}

                          {/* Custom Schedule (Date Overrides) */}
                          {specialistDetails[specialist._id]?.customSchedule &&
                            Object.keys(
                              specialistDetails[specialist._id].customSchedule,
                            ).length > 0 && (
                              <div className="mt-4">
                                <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                  Custom Schedule (Date Overrides)
                                </h5>
                                <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-200 max-h-48 overflow-y-auto">
                                  {Object.entries(
                                    specialistDetails[specialist._id]
                                      .customSchedule,
                                  )
                                    .sort(
                                      ([dateA], [dateB]) =>
                                        new Date(dateA) - new Date(dateB),
                                    )
                                    .map(([date, hours]) => (
                                      <div
                                        key={date}
                                        className="flex justify-between text-xs"
                                      >
                                        <span className="text-gray-700 font-medium">
                                          {new Date(date).toLocaleDateString(
                                            "en-US",
                                            {
                                              weekday: "short",
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            },
                                          )}
                                        </span>
                                        <span className="text-gray-600">
                                          {Array.isArray(hours) &&
                                          hours.length > 0
                                            ? hours
                                                .map(
                                                  (h, i) =>
                                                    `${h.start}-${h.end}`,
                                                )
                                                .join(", ")
                                            : "Closed"}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Time Off */}
                        <div className="lg:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Time Off (
                            {specialistDetails[specialist._id]?.timeOff
                              ?.length || 0}
                            )
                          </h4>
                          {specialistDetails[specialist._id]?.timeOff?.length >
                          0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {specialistDetails[specialist._id].timeOff.map(
                                (timeOff) => (
                                  <div
                                    key={timeOff._id}
                                    className="bg-white p-3 rounded border border-gray-200"
                                  >
                                    <p className="font-medium text-gray-900">
                                      {timeOff.reason || "Time Off"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {new Date(
                                        timeOff.start,
                                      ).toLocaleDateString()}{" "}
                                      -{" "}
                                      {new Date(
                                        timeOff.end,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No time off scheduled
                            </p>
                          )}
                        </div>

                        {/* Additional Info */}
                        <div className="lg:col-span-2 border-t border-gray-200 pt-4 mt-2">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Additional Information
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="text-sm text-gray-900">
                                {specialist.phone || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Specialization
                              </p>
                              <p className="text-sm text-gray-900">
                                {specialist.specialization || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Experience
                              </p>
                              <p className="text-sm text-gray-900">
                                {specialist.yearsOfExperience
                                  ? `${specialist.yearsOfExperience} years`
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Active</p>
                              <p className="text-sm text-gray-900">
                                {specialist.isActive ? "Yes" : "No"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
