import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
  Scissors,
  Palette,
  Heart,
  Waves,
  Hand,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * BusinessesLandingPage - Fresha-style landing page
 *
 * Displays:
 * - Hero section with search
 * - Popular services categories
 * - Featured businesses
 * - Browse by location
 */
export default function BusinessesLandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to search with query params
    window.location.href = `/business?q=${encodeURIComponent(
      searchQuery
    )}&loc=${encodeURIComponent(location)}`;
  };

  const categories = [
    { name: "Hair Salons", icon: Scissors, count: "12+" },
    { name: "Nail Salons", icon: Hand, count: "8+" },
    { name: "Spas", icon: Heart, count: "5+" },
    { name: "Barbershops", icon: Scissors, count: "6+" },
    { name: "Beauty Salons", icon: Sparkles, count: "10+" },
    { name: "Massage", icon: Waves, count: "4+" },
  ];

  const featuredBusinesses = [
    {
      name: "Elite Booker Salon",
      slug: "elite-booker-1",
      rating: 4.9,
      reviews: 128,
      category: "Hair & Beauty",
      image:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
      location: "London, UK",
      nextAvailable: "Today at 2:00 PM",
    },
    {
      name: "Serenity Loves",
      slug: "serenity-loves-1",
      rating: 5.0,
      reviews: 95,
      category: "Spa & Wellness",
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
      location: "London, UK",
      nextAvailable: "Tomorrow at 10:00 AM",
    },
    {
      name: "Permanent By Juste",
      slug: "permanent-by-juste",
      rating: 4.8,
      reviews: 76,
      category: "Beauty Services",
      image:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop",
      location: "London, UK",
      nextAvailable: "Today at 4:30 PM",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Book beauty & wellness
              <br />
              <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                services online
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover and book top-rated salons, spas, and wellness services
              near you
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services, venues, or professionals"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base rounded-xl focus:outline-none"
              />
            </div>

            <div className="md:w-72 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base rounded-xl focus:outline-none border-l md:border-l border-gray-200"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-gray-900">50+</div>
              <div className="text-sm text-gray-600 mt-1">Venues</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">10,000+</div>
              <div className="text-sm text-gray-600 mt-1">Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">4.9★</div>
              <div className="text-sm text-gray-600 mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-gray-900 mb-8">
            Popular Services
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/business?category=${encodeURIComponent(category.name)}`}
                  className="group bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-all hover:shadow-lg border-2 border-transparent hover:border-black"
                >
                  <div className="flex justify-center mb-3">
                    <IconComponent className="w-10 h-10 text-gray-700 group-hover:text-black transition-colors" />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-500">{category.count}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">
              Featured Venues
            </h2>
            <Link
              to="/business"
              className="text-sm font-semibold text-black hover:underline flex items-center"
            >
              View all
              <TrendingUp className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBusinesses.map((business) => (
              <Link
                key={business.slug}
                to={`/salon/${business.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-black"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">
                      {business.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({business.reviews})
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black">
                    {business.name}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {business.category}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {business.location}
                  </div>

                  <div className="flex items-center text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 mr-1" />
                    {business.nextAvailable}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of beauty & wellness businesses using Elite Booker
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
