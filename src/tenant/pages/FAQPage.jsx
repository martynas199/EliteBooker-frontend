import { useNavigate } from "react-router-dom";
import Card from "../../shared/components/ui/Card";
import BackBar from "../../shared/components/ui/BackBar";
import SEOHead from "../../shared/components/seo/SEOHead";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "../../shared/utils/schemaGenerator";

export default function FAQPage() {
  const navigate = useNavigate();

  const faqs = [
    {
      category: "📋 Cancellation Policy",
      questions: [
        {
          q: "What is your cancellation policy?",
          a: "We offer flexible cancellation with automatic refunds based on when you cancel:",
          details: [
            {
              icon: "✓",
              color: "text-green-600",
              text: "Full refund within 15 minutes of booking (grace period)",
            },
            {
              icon: "✓",
              color: "text-green-600",
              text: "Free cancellation up to 24 hours before your appointment",
            },
            {
              icon: "⚠",
              color: "text-yellow-600",
              text: "50% refund between 2-24 hours before appointment",
            },
            {
              icon: "✗",
              color: "text-red-600",
              text: "No refund within 2 hours of appointment time",
            },
          ],
        },
        {
          q: "How do I cancel my appointment?",
          a: "If you booked as a registered user, you can cancel your appointment from your profile page. If you booked as a guest, please contact the salon directly to cancel. Refunds (if applicable) are processed automatically to your original payment method.",
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds are processed automatically within minutes of cancellation. Depending on your bank or card issuer, it may take 5-10 business days for the refund to appear in your account.",
        },
        {
          q: "What if I paid a deposit?",
          a: "If you paid a deposit, the refund percentage applies to your deposit amount. For example, if you cancel 12 hours before your appointment, you'll receive 50% of your deposit back.",
        },
      ],
    },
    {
      category: "💳 Payment",
      questions: [
        {
          q: "What payment options do you offer?",
          a: "We offer three convenient payment options:",
          details: [
            {
              text: "Pay Now - Pay the full amount upfront (most secure)",
            },
            {
              text: "Pay Deposit - Pay a partial amount now, rest at the salon",
            },
            {
              text: "Pay at Salon - Reserve now, pay when you arrive",
            },
          ],
        },
        {
          q: "Is my payment information secure?",
          a: "Yes! All payments are processed through Stripe, a leading payment processor used by millions of businesses worldwide. We never store your card details on our servers.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit and debit cards including Visa, Mastercard, and American Express through our secure payment gateway.",
        },
      ],
    },
    {
      category: "📅 Booking",
      questions: [
        {
          q: "How far in advance can I book?",
          a: "You can book appointments up to 3 months in advance. We recommend booking at least 1-2 weeks ahead for popular time slots.",
        },
        {
          q: "Can I choose a specific specialist?",
          a: "Yes! When booking, you can select a specific specialist or choose 'Any Available' to see all available time slots.",
        },
        {
          q: "What if I need to reschedule?",
          a: "To reschedule, simply cancel your current appointment (refund rules apply) and book a new time slot. We're working on a direct reschedule feature.",
        },
        {
          q: "Will I receive a confirmation?",
          a: "Yes! You'll receive an email confirmation immediately after booking with all the details of your appointment and a link to manage it.",
        },
      ],
    },
    {
      category: "🏢 Salon Information",
      questions: [
        {
          q: "What are your opening hours?",
          a: "Our hours vary by day. You can see our current availability when selecting your appointment time, or contact us directly for more information.",
        },
        {
          q: "Where are you located?",
          a: "Our address and contact details are available on our website. You'll also receive location details in your booking confirmation email.",
        },
        {
          q: "Do you offer gift cards?",
          a: "Please contact us directly for information about gift cards and special packages.",
        },
      ],
    },
  ];

  // Generate FAQ schema
  const allFAQs = faqs.flatMap((category) =>
    category.questions.map((q) => ({
      question: q.q,
      answer:
        q.a + (q.details ? "\n" + q.details.map((d) => d.text).join("\n") : ""),
    }))
  );
  const faqSchema = generateFAQSchema(allFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, breadcrumbSchema],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* SEO Meta Tags */}
      <SEOHead
        title="FAQ Wisbech Beauty Salon | Noble Elegance Booking & Services Guide"
        description="Answers to beauty salon FAQs in Wisbech: booking process, payment options, cancellation policy & services. Noble Elegance at 12 Blackfriars Rd, PE13 1AT."
        keywords="beauty salon FAQ, booking questions Wisbech, cancellation policy beauty salon, beauty treatment questions, payment options beauty salon, beauty salon information Wisbech"
        schema={combinedSchema}
      />

      <BackBar onBack={() => navigate(-1)} />

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">
          Frequently Asked Questions - Noble Elegance Wisbech
        </h1>
        <p className="text-gray-600">
          Find answers to common questions about{" "}
          <a
            href="/specialists"
            className="text-brand-600 hover:text-brand-700 underline"
          >
            bookings
          </a>
          , payments, cancellations and our{" "}
          <a href="/" className="text-brand-600 hover:text-brand-700 underline">
            beauty services
          </a>{" "}
          in Wisbech. Browse our{" "}
          <a
            href="/products"
            className="text-brand-600 hover:text-brand-700 underline"
          >
            product catalog
          </a>{" "}
          or{" "}
          <a
            href="/contact"
            className="text-brand-600 hover:text-brand-700 underline"
          >
            contact us
          </a>{" "}
          for more help.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((section, idx) => (
          <Card key={idx} className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {section.category}
            </h2>
            <div className="space-y-6">
              {section.questions.map((faq, qIdx) => (
                <div
                  key={qIdx}
                  className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-gray-700 mb-2">{faq.a}</p>
                  {faq.details && (
                    <ul className="space-y-2 mt-3">
                      {faq.details.map((detail, dIdx) => (
                        <li
                          key={dIdx}
                          className="flex items-start gap-2 text-sm"
                        >
                          {detail.icon && (
                            <span
                              className={`${
                                detail.color || "text-gray-600"
                              } flex-shrink-0`}
                            >
                              {detail.icon}
                            </span>
                          )}
                          {!detail.icon && (
                            <span className="text-gray-400 flex-shrink-0">
                              •
                            </span>
                          )}
                          <span className="text-gray-700">{detail.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-700 mb-4">
            We're here to help! Contact us directly for any other questions or
            concerns.
          </p>
          <p className="text-sm text-gray-600">
            Check your confirmation email for contact details
          </p>
        </div>
      </Card>
    </div>
  );
}
