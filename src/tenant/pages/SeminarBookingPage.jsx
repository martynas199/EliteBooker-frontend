import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "./seminars.api";
import Button from "../../shared/components/ui/Button";
import FormField from "../../shared/components/forms/FormField";
import { useAuth } from "../../shared/contexts/AuthContext";

export default function SeminarBookingPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [seminar, setSeminar] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  useEffect(() => {
    loadSeminar();
  }, [slug]);

  const loadSeminar = async () => {
    try {
      setLoading(true);
      const data = await SeminarsAPI.getPublic(slug);
      setSeminar(data);

      // Pre-select session from URL param
      const sessionId = searchParams.get("session");
      if (sessionId) {
        const session = data.upcomingSessions?.find(
          (s) => s.sessionId === sessionId || s._id === sessionId
        );
        if (session) {
          setSelectedSession(session);
        }
      }

      // Pre-fill user data if logged in
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          specialRequests: "",
        });
      }
    } catch (error) {
      console.error("Failed to load seminar:", error);
      toast.error("Seminar not found");
      navigate("../../seminars");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSession) {
      toast.error("Please select a session");
      return;
    }

    // Validate form
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const checkoutData = {
        seminarId: seminar._id,
        sessionId: selectedSession.sessionId || selectedSession._id,
        attendeeInfo: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          specialRequests: formData.specialRequests.trim() || undefined,
        },
      };

      const { url } = await SeminarsAPI.createCheckout(checkoutData);

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Failed to create checkout:", error);
      toast.error(
        error.response?.data?.message || "Failed to proceed to checkout"
      );
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isSessionBookable = (session) => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    return (
      sessionDate > now &&
      session.status === "scheduled" &&
      session.currentAttendees < session.maxAttendees
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!seminar) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`../seminars/${slug}`)}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Seminar Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Book: {seminar.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Session Display */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selected Session
                </h2>
                {selectedSession ? (
                  <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatDate(selectedSession.date)}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {selectedSession.startTime} -{" "}
                          {selectedSession.endTime}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedSession.maxAttendees -
                            selectedSession.currentAttendees}{" "}
                          spots remaining
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`..`)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No session selected</p>
                    <button
                      type="button"
                      onClick={() => navigate(`..`)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Select a session
                    </button>
                  </div>
                )}
              </div>

              {/* Attendee Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Information
                </h2>
                <div className="space-y-4">
                  <FormField label="Full Name" required>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </FormField>

                  <FormField label="Email" required>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </FormField>

                  <FormField label="Phone Number (Optional)">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+44 123 456 7890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Special Requests (Optional)">
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder="Any dietary requirements, accessibility needs, or other requests..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!selectedSession || submitting}
                className="w-full"
              >
                {submitting ? "Processing..." : "Proceed to Payment"}
              </Button>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Booking Summary
              </h2>

              {/* Seminar Image */}
              {seminar.images?.main && (
                <img
                  src={seminar.images.main}
                  alt={seminar.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}

              {/* Seminar Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Seminar</p>
                  <p className="font-semibold text-gray-900">{seminar.title}</p>
                </div>

                {selectedSession && (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedSession.date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSession.startTime} - {selectedSession.endTime}
                      </p>
                    </div>
                  </>
                )}

                {/* Location */}
                <div className="border-t pt-3">
                  <p className="text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">
                    {seminar.location.type === "physical"
                      ? "In-Person"
                      : seminar.location.type === "virtual"
                      ? "Online"
                      : "Hybrid"}
                  </p>
                  {seminar.location.city && (
                    <p className="text-sm text-gray-600">
                      {seminar.location.city}
                      {seminar.location.country &&
                        `, ${seminar.location.country}`}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {seminar.pricing.currency} {seminar.activePrice}
                    </p>
                  </div>
                  {seminar.pricing.earlyBirdPrice &&
                    seminar.activePrice === seminar.pricing.earlyBirdPrice && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Early Bird Discount Applied
                      </p>
                    )}
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="border-t pt-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-900 mb-2">
                  Cancellation Policy
                </p>
                <ul className="space-y-1">
                  <li>• 100% refund if cancelled more than 48 hours before</li>
                  <li>• 50% refund if cancelled 24-48 hours before</li>
                  <li>• No refund if cancelled less than 24 hours before</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
