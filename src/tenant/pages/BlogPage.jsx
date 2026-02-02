import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../shared/components/ui/PageTransition";
import SEOHead from "../../shared/components/seo/SEOHead";
import { generateBreadcrumbSchema } from "../../shared/utils/schemaGenerator";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsRes, tagsRes] = await Promise.all([
          api.get("/blog-posts", {
            params: selectedTag ? { tag: selectedTag } : {},
          }),
          api.get("/blog-posts/tags/all"),
        ]);
        setPosts(postsRes.data.data || []);
        setAllTags(tagsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTag]);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Appointment Booking Tips", url: "/blog" },
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <PageTransition className="min-h-screen bg-gray-50">
      <SEOHead
        title="Appointment Booking Tips for Service Businesses | Elite Booker Blog"
        description="Practical guides for service professionals and small business owners on online bookings, payments, client retention, and reducing no-shows."
        keywords="appointment booking tips, service business blog, small business scheduling, reduce no shows, client retention strategies, online booking software"
        schema={breadcrumbSchema}
      />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Appointment Booking{" "}
            <span className="text-brand-600">Tips &amp; Insights</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Expert guidance for service professionals on growing repeat
            bookings, managing schedules, and delighting clients online
          </p>
        </div>
      </section>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                !selectedTag
                  ? "bg-brand-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              All Posts
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 capitalize ${
                  selectedTag === tag
                    ? "bg-brand-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-brand-400 hover:text-brand-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-100 mb-6">
              <svg
                className="w-10 h-10 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
              No posts yet
            </h2>
            <p className="text-gray-600">
              {selectedTag
                ? `No posts found with tag "${selectedTag}"`
                : "Check back soon for appointment booking guides, retention strategies, and automation tips."}
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <StaggerItem key={post._id}>
                <article
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100 hover:border-brand-200 h-full flex flex-col"
                >
                  {/* Decorative Header */}
                  <div className="h-2 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"></div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{post.readingTime} min read</span>
                      </div>
                    </div>

                    {/* Read More Arrow */}
                    <div className="flex items-center gap-2 mt-4 text-brand-600 font-medium group-hover:gap-4 transition-all">
                      <span>Read Article</span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>
    </PageTransition>
  );
}
