import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckoutAPI } from "./checkout.api";
import { BookingAPI } from "./booking.api";
import {
  setClient,
  setMode,
  setAppointmentId,
  setService,
  setSpecialist,
} from "../state/bookingSlice";
import {
  useNavigate,
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import { Input, Textarea } from "../../shared/components/ui/Input";
import Card from "../../shared/components/ui/Card";
import { ServicesAPI } from "./services.api";
import BackBar from "../../shared/components/ui/BackBar";
import FormField from "../../shared/components/forms/FormField";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import PageTransition from "../../shared/components/ui/PageTransition";
import toast from "react-hot-toast";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function CheckoutPage() {
  const booking = useSelector((s) => s.booking);
  const {
    service: bookingService,
    specialist: bookingBeautician,
    time,
  } = booking;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { client } = useClientAuth();
  const { currency, formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    acceptPolicy: false,
  });
  const [errors, setErrors] = useState({});
  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[k]) {
      setErrors({ ...errors, [k]: "" });
    }
  };

  // Restore booking state from URL parameters if Redux state is empty
  useEffect(() => {
    if (!bookingService || !bookingBeautician) {
      const serviceParam = searchParams.get("service");
      const variantParam = searchParams.get("variant");
      const beauticianParam = searchParams.get("specialist");

      if (serviceParam && beauticianParam) {
        // Restore service and specialist to Redux from URL
        api
          .get(`/services/${serviceParam}`)
          .then((res) => {
            const service = res.data;
            const variant =
              service.variants?.find((v) => v.name === variantParam) ||
              service.variants?.[0];

            if (variant) {
              const finalPrice = variant.promoPrice || variant.price;
              dispatch(
                setService({
                  serviceId: service._id,
                  serviceName: service.name,
                  variantName: variant.name,
                  price: finalPrice,
                  durationMin: variant.durationMin,
                  bufferBeforeMin: variant.bufferBeforeMin,
                  bufferAfterMin: variant.bufferAfterMin,
                })
              );
            }
          })
          .catch((err) => console.error("Failed to restore service:", err));

        api
          .get(`/specialists/${beauticianParam}`)
          .then((res) => {
            dispatch(
              setSpecialist({
                specialistId: res.data._id,
                any: false,
                inSalonPayment: res.data.inSalonPayment || false,
              })
            );
          })
          .catch((err) => console.error("Failed to restore specialist:", err));
      }
    }
  }, [bookingService, bookingBeautician, searchParams, dispatch]);

  // Pre-fill form with user data if logged in (tenant customer or global client)
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        notes: "",
        acceptPolicy: false,
      });
    } else if (client) {
      setForm({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        notes: "",
        acceptPolicy: false,
      });
    }
  }, [user, client]);

  function validateForm() {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^[\d\s\-\+\(\)]+$/.test(form.phone) ||
      form.phone.replace(/\D/g, "").length < 10
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Policy acceptance validation
    if (!form.acceptPolicy) {
      newErrors.acceptPolicy =
        "You must accept the cancellation policy and terms to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit(mode) {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    dispatch(setMode(mode));
    dispatch(setClient(form));
    setLoading(true);
    try {
      // Prepare booking data with userId if user is logged in
      const bookingData = {
        specialistId: bookingBeautician?.any
          ? undefined
          : bookingBeautician?.specialistId,
        any: bookingBeautician?.any,
        serviceId: bookingService?.serviceId,
        variantName: bookingService?.variantName,
        startISO: time,
        client: form,
        mode: mode === "pay_in_salon" ? "pay_in_salon" : mode,
        currency, // Add selected currency
        ...(user ? { userId: user._id } : {}), // Add userId if logged in
      };

      if (mode === "pay_in_salon") {
        const res = await BookingAPI.reserveWithoutPayment(bookingData);
        if (res?.appointmentId) dispatch(setAppointmentId(res.appointmentId));
        navigate("/confirmation");
      } else {
        const res = await CheckoutAPI.createSession(bookingData);
        if (res?.url) window.location.href = res.url;
      }
    } catch (e) {
      // If slot is no longer available (409 conflict), redirect back to booking
      if (e.response?.status === 409) {
        toast.error(
          "This time slot is no longer available. Please select another time."
        );
        // Clear the selected slot and redirect to booking page
        dispatch(setService(null));
        dispatch(setSpecialist(null));
        navigate("/book");
      } else {
        toast.error(e.message || "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Pricing helpers
  const bookingFee = 0.5;
  const servicePrice = Number(bookingService?.price || 0);
  const totalAmount = bookingBeautician?.inSalonPayment
    ? bookingFee
    : servicePrice + bookingFee;

  return (
    <>
      <SEOHead
        title="Checkout - Noble Elegance"
        description="Complete your booking at Noble Elegance Beauty Salon."
        noindex={true}
      />
      {/* Fixed background layer */}
      <div className="fixed inset-0 bg-white -z-10"></div>

      <div className="min-h-screen relative">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <BackBar onBack={() => navigate(-1)} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 tracking-tight text-gray-900">
                Checkout
              </h1>

              {/* In-Salon Payment Notice */}
              {bookingBeautician?.inSalonPayment && (
                <div className="p-4 bg-green-400/10 border border-green-400/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        Pay in Salon
                      </div>
                      <div className="text-sm text-gray-700">
                        You'll only pay a £{bookingFee.toFixed(2)} booking fee
                        now. The full service amount of{" "}
                        {formatPrice(servicePrice)} will be paid directly at the
                        salon.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div className="font-bold text-xl mb-2 text-gray-900">
                    Your Details
                  </div>
                  <FormField
                    label="Name"
                    error={errors.name}
                    required
                    htmlFor="name"
                  >
                    <Input
                      id="name"
                      placeholder="Name"
                      value={form.name}
                      onChange={update("name")}
                      className={errors.name ? "border-red-500" : ""}
                    />
                  </FormField>
                  <FormField
                    label="Email"
                    error={errors.email}
                    required
                    htmlFor="email"
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={update("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                  </FormField>
                  <FormField
                    label="Phone"
                    error={errors.phone}
                    required
                    htmlFor="phone"
                  >
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={update("phone")}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                  </FormField>
                  <FormField label="Notes" htmlFor="notes" hint="Optional">
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or notes"
                      value={form.notes}
                      onChange={update("notes")}
                    />
                  </FormField>

                  {/* Cancellation Policy Agreement */}
                  <div
                    className={`p-4 border rounded-xl bg-gray-50 ${
                      errors.acceptPolicy ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.acceptPolicy}
                        onChange={(e) =>
                          setForm({ ...form, acceptPolicy: e.target.checked })
                        }
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">
                        I have reviewed and agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-gray-900 hover:text-black font-semibold underline"
                        >
                          cancellation policy and terms of service
                        </Link>
                      </span>
                    </label>
                    {errors.acceptPolicy && (
                      <p className="text-red-600 text-sm mt-2 ml-7">
                        {errors.acceptPolicy}
                      </p>
                    )}
                  </div>

                  {/* Sign-in prompt for guests */}
                  {!user && (
                    <div className="p-4 border border-gray-200 rounded-xl text-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">ℹ️</span>
                        <div>
                          <span className="text-gray-700">
                            <Link
                              to="/login"
                              state={{ from: location.pathname }}
                              className="text-gray-900 hover:text-black font-semibold underline"
                            >
                              Sign in
                            </Link>{" "}
                            or{" "}
                            <Link
                              to="/register"
                              state={{ from: location.pathname }}
                              className="text-gray-900 hover:text-black font-semibold underline"
                            >
                              create an account
                            </Link>{" "}
                            to track your bookings and easily rebook in the
                            future.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Policy Link */}
                  <div className="text-sm text-gray-600 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Review our</span>
                    <Link
                      to="/faq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-black underline font-semibold"
                    >
                      cancellation policy
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      disabled={loading}
                      loading={loading}
                      onClick={() => submit("pay_now")}
                      variant="brand"
                      className="w-full"
                    >
                      {bookingBeautician?.inSalonPayment
                        ? "Pay Booking Fee"
                        : "Pay now"}
                    </Button>
                    {!bookingBeautician?.inSalonPayment && (
                      <Button
                        disabled={loading}
                        onClick={() => submit("deposit")}
                        variant="outline"
                        className="w-full"
                      >
                        Pay deposit
                      </Button>
                    )}
                    {/* <Button
                disabled={loading}
                onClick={() => submit("pay_in_salon")}
                variant="outline"
                className="w-full"
              >
                Pay at salon
              </Button> */}
                  </div>
                </div>
                <div className="lg:sticky lg:top-8">
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="font-bold mb-4 text-xl text-gray-900">
                      Summary
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Service</div>
                    <div className="flex items-center justify-between mb-4 text-gray-900">
                      <div className="font-medium">
                        {bookingService?.serviceName} —{" "}
                        {bookingService?.variantName}
                      </div>
                      <div className="font-bold text-lg">
                        {formatPrice(servicePrice)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Booking Fee</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(bookingFee)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-300">
                      <div className="font-bold text-lg text-gray-900">
                        Total
                      </div>
                      <div className="font-bold text-2xl text-gray-900">
                        {formatPrice(totalAmount)}
                      </div>
                    </div>
                    {bookingBeautician?.inSalonPayment && (
                      <div className="text-sm text-gray-700 mb-3 p-3 rounded-lg">
                        Full service amount {formatPrice(servicePrice)} payable
                        in salon.
                      </div>
                    )}
                    {time && (
                      <div className="mt-4 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          Appointment Time
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {new Date(time).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
