import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";
import { useTenant } from "../../shared/contexts/TenantContext";
import PageTransition from "../../shared/components/ui/PageTransition";
import SEOHead from "../../shared/components/seo/SEOHead";
import {
  generateBreadcrumbSchema,
  generateBlogPostSchema,
} from "../../shared/utils/schemaGenerator";
import BackBar from "../../shared/components/ui/BackBar";

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/blog-posts/${slug}`);
        setPost(response.data.data);

        // Fetch related posts (same tags)
        if (response.data.data.tags && response.data.data.tags.length > 0) {
          const relatedRes = await api.get("/blog-posts", {
            params: { tag: response.data.data.tags[0], limit: 3 },
          });
          // Filter out current post
          const related = relatedRes.data.data.filter((p) => p.slug !== slug);
          setRelatedPosts(related.slice(0, 2));
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <PageTransition className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!post) {
    return null;
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const blogPostSchema = generateBlogPostSchema({
    title: post.title,
    description: post.excerpt,
    content: post.content,
    author: post.author?.name || "Elite Booker",
    publishedDate: post.publishedAt,
    modifiedDate: post.updatedAt,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SEOHead
        title={`${post.title} | Elite Booker`}
        description={
          post.excerpt ||
          post.content
            .substring(0, 155)
            .replace(/<[^>]*>/g, "")
            .trim() + "..."
        }
        keywords={`${
          post.tags?.join(", ") || "appointment booking tips"
        }, service business blog, small business scheduling, client retention`}
        schema={[breadcrumbSchema, blogPostSchema]}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button - More visible and positioned left */}
        <button
          onClick={() => navigate("/blog")}
          className="group inline-flex items-center gap-2 mb-8 px-4 py-2.5 bg-white border-2 border-brand-400 text-brand-700 rounded-lg hover:bg-brand-50 hover:border-brand-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
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
          <span>Back to Blog</span>
        </button>

        {/* Header */}
        <header className="mb-10">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 bg-brand-100 text-brand-700 text-sm font-medium rounded-full capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-brand-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="font-medium">
                {post.author?.name || "Elite Booker"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
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
                className="w-5 h-5"
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
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Word count and reading stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>
              Last updated: {formatDate(post.updatedAt || post.publishedAt)}
            </p>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
            Share this article
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const url = window.location.href;
                const text = `Check out this article: ${post.title}`;
                if (navigator.share) {
                  navigator.share({ title: post.title, text, url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert("Link copied to clipboard!");
                }
              }}
              className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              Share
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-8">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost._id}
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-brand-200 p-6"
                >
                  <h4 className="font-serif text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h4>
                  {relatedPost.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
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
                    <span>{relatedPost.readingTime} min read</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl text-center">
          <h3 className="font-serif text-2xl font-bold text-gray-900 mb-4">
            Ready to Streamline Your Appointment Booking?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Discover how Elite Booker helps service professionals reduce
            no-shows, automate reminders, and grow repeat bookings online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/services")}
              className="px-8 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Explore Services
            </button>
            <button
              onClick={() => navigate("/salon")}
              className="px-8 py-3 bg-white text-brand-600 border-2 border-brand-600 rounded-lg hover:bg-brand-50 transition-all duration-300 font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      </article>

      <style>{`
        .blog-content h2 {
          font-family: var(--font-serif);
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h3 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
        }
        .blog-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
        }
        .blog-content ul,
        .blog-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }
        .blog-content blockquote {
          border-left: 4px solid #fad24e;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
        }
        .blog-content strong {
          font-weight: 600;
          color: #111827;
        }
        .blog-content a {
          color: #d4a710;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .blog-content a:hover {
          color: #b8910e;
        }
        .blog-content img {
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          max-width: 100%;
          height: auto;
        }
        .blog-content code {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .blog-content pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .blog-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </PageTransition>
  );
}
