import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "./seminars.api";
import Button from "../../shared/components/ui/Button";
import { useAuth } from "../../shared/contexts/AuthContext";

export default function SeminarDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [seminar, setSeminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSeminar();
  }, [slug]);

  const loadSeminar = async () => {
    try {
      setLoading(true);
      const data = await SeminarsAPI.getPublic(slug);
      setSeminar(data);
    } catch (error) {
      console.error("Failed to load seminar:", error);
      toast.error("Seminar not found");
      navigate("../seminars");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (session) => {
    const sessionIdentifier = session.sessionId || session._id;
    navigate(`book?session=${sessionIdentifier}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return time;
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

  const getSpotsAvailable = (session) => {
    return session.maxAttendees - session.currentAttendees;
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

  // Get all images (main + gallery)
  const allImages = [
    seminar.images?.main,
    ...(seminar.images?.gallery || []),
  ].filter(Boolean);

  const currentImage = allImages[selectedImageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link
              to="../seminars"
              className="text-gray-500 hover:text-gray-700"
            >
              Seminars
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{seminar.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={seminar.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      idx === selectedImageIndex
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${seminar.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Category & Level Badges */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {seminar.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {seminar.level}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                {seminar.location.type === "physical"
                  ? "In-Person"
                  : seminar.location.type === "virtual"
                  ? "Online"
                  : "Hybrid"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900">
              {seminar.title}
            </h1>

            {/* Short Description */}
            <p className="text-xl text-gray-600">{seminar.shortDescription}</p>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {seminar.pricing.currency} {seminar.activePrice}
                </span>
                {seminar.pricing.earlyBirdPrice &&
                  seminar.activePrice === seminar.pricing.earlyBirdPrice && (
                    <span className="text-sm font-medium text-green-600 px-3 py-1 bg-green-100 rounded-full">
                      Early Bird Price
                    </span>
                  )}
              </div>
              {seminar.pricing.earlyBirdDeadline && (
                <p className="text-sm text-gray-600 mt-2">
                  Early bird price valid until{" "}
                  {formatDate(seminar.pricing.earlyBirdDeadline)}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location
              </h3>
              {(seminar.location.type === "physical" ||
                seminar.location.type === "hybrid") && (
                <div className="flex items-start text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-400 mt-0.5"
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
                  <div>
                    {seminar.location.address && (
                      <p>{seminar.location.address}</p>
                    )}
                    {seminar.location.city && seminar.location.country && (
                      <p>
                        {seminar.location.city}, {seminar.location.country}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {(seminar.location.type === "virtual" ||
                seminar.location.type === "hybrid") && (
                <div className="flex items-center text-gray-600 mt-2">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <p>Online (meeting link will be provided after booking)</p>
                </div>
              )}
            </div>

            {/* Specialist Info */}
            {seminar.specialistInfo && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Hosted by</p>
                <p className="text-lg font-semibold text-gray-900">
                  {seminar.specialistInfo.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sessions Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Available Sessions
          </h2>
          {seminar.upcomingSessions && seminar.upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seminar.upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
                >
                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(session.date)}
                    </p>
                  </div>

                  {/* Time */}
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTime(session.startTime)} -{" "}
                      {formatTime(session.endTime)}
                    </p>
                  </div>

                  {/* Availability */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600">Availability</p>
                      <p className="text-sm font-medium text-gray-900">
                        {session.currentAttendees} / {session.maxAttendees}{" "}
                        booked
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getSpotsAvailable(session) > 5
                            ? "bg-green-600"
                            : getSpotsAvailable(session) > 0
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                        style={{
                          width: `${
                            (session.currentAttendees / session.maxAttendees) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getSpotsAvailable(session)} spots remaining
                    </p>
                  </div>

                  {/* Book Button */}
                  <Button
                    onClick={() => handleBookNow(session)}
                    disabled={!isSessionBookable(session)}
                    className="w-full"
                  >
                    {!isSessionBookable(session)
                      ? session.status === "full"
                        ? "Fully Booked"
                        : "Not Available"
                      : "Book This Session"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No upcoming sessions</p>
              <p className="text-gray-400 mt-2">
                Check back later for new session dates
              </p>
            </div>
          )}
        </div>

        {/* Full Description */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            About This Seminar
          </h2>
          <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
            {seminar.description}
          </div>
        </div>

        {/* What You Will Learn */}
        {seminar.whatYouWillLearn && seminar.whatYouWillLearn.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What You Will Learn
            </h2>
            <ul className="space-y-3">
              {seminar.whatYouWillLearn.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-600 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {seminar.requirements && seminar.requirements.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Requirements
            </h2>
            <ul className="space-y-3">
              {seminar.requirements.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <svg
                    className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
