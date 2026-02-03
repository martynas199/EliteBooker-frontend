import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  FileText,
  Copy,
  CheckCircle,
  Download,
  Shield,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * Deposit Policy Generator - Product-Led SEO Tool
 * Target keywords: "salon cancellation policy template UK", "HMRC compliant deposit policy"
 *
 * Strategy: Free HMRC-compliant policy template that solves a real legal need
 * Result: High-quality backlinks + establishes authority + builds trust
 */
export default function DepositPolicyGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [depositAmount, setDepositAmount] = useState("20");
  const [depositType, setDepositType] = useState("fixed");
  const [cancellationWindow, setCancellationWindow] = useState("48");
  const [refundPolicy, setRefundPolicy] = useState("full");
  const [copied, setCopied] = useState(false);

  // Generate policy text
  const generatePolicy = () => {
    const businessNameText = businessName || "[Your Business Name]";
    const depositText =
      depositType === "fixed"
        ? `£${depositAmount}`
        : `${depositAmount}% of the treatment price`;

    const refundPolicyText =
      refundPolicy === "full"
        ? `You will receive a full refund of your deposit if you cancel at least ${cancellationWindow} hours before your appointment.`
        : refundPolicy === "partial"
        ? `You will receive a 50% refund of your deposit if you cancel between ${cancellationWindow} hours and 24 hours before your appointment. No refund is available for cancellations made less than 24 hours before your appointment.`
        : `All deposits are non-refundable. However, we understand emergencies happen. Please contact us to discuss rescheduling options.`;

    return `APPOINTMENT BOOKING & DEPOSIT POLICY

Business Name: ${businessNameText}
Policy Effective Date: ${new Date().toLocaleDateString("en-GB")}

1. APPOINTMENT BOOKING
All appointments must be booked in advance through our online booking system, by phone, or in person. We recommend booking at least 7 days in advance to secure your preferred date and time.

2. DEPOSIT REQUIREMENT
To secure your appointment, a deposit of ${depositText} is required at the time of booking. This deposit will be deducted from your final payment on the day of your appointment.

Deposits are required for:
• All appointments over £50
• First-time clients
• Appointments on Saturdays and bank holidays
• Multiple services booked together

3. PAYMENT METHODS
We accept deposits via:
• Credit/Debit card (online or in person)
• Bank transfer (account details provided upon booking)
• Cash (in person only)

All online payments are processed securely through Stripe and are fully PCI-DSS compliant. We do not store your card details.

4. CANCELLATION & REFUND POLICY
We understand that sometimes plans change. ${refundPolicyText}

To cancel or reschedule your appointment, please contact us by:
• Email: [your email]
• Phone: [your phone number]
• Online booking system: [your website]

5. NO-SHOW POLICY
If you fail to attend your appointment without prior notice, your deposit will be forfeited. This is because we have reserved time specifically for you, and late cancellations prevent other clients from booking.

For repeat no-shows, we reserve the right to require full prepayment for future bookings.

6. RESCHEDULING
You may reschedule your appointment free of charge if you provide at least ${cancellationWindow} hours' notice. Your deposit will be transferred to your new appointment date.

If you need to reschedule with less than ${cancellationWindow} hours' notice, your deposit may be forfeited (see Cancellation Policy above).

7. LATE ARRIVALS
We kindly ask that you arrive 5-10 minutes before your appointment time. If you arrive more than 15 minutes late, we may need to shorten your treatment time to accommodate other clients, or reschedule your appointment. Deposits for late-arrival rescheduling are handled as per our standard cancellation policy.

8. HMRC COMPLIANCE & VAT
${businessNameText} is registered for VAT (if applicable). All deposits and final payments include VAT at the standard UK rate where applicable. You will receive a VAT receipt for your payment.

For business clients reclaiming VAT, please request a VAT invoice at the time of booking.

9. DATA PROTECTION & GDPR
Your personal information and payment details are processed in accordance with UK GDPR and Data Protection Act 2018. We only use your information to:
• Process bookings and payments
• Send appointment reminders (if you've opted in)
• Comply with legal obligations (e.g., HMRC records)

We will never share your data with third parties for marketing purposes. You can request deletion of your data at any time by contacting us.

10. FORCE MAJEURE
In the unlikely event that we need to cancel your appointment due to circumstances beyond our control (e.g., illness, emergency, government restrictions), you will receive a full refund of your deposit within 7 working days.

11. CHANGES TO THIS POLICY
We reserve the right to update this policy at any time. Any changes will be posted on our website and communicated to clients with upcoming appointments.

12. CONTACT INFORMATION
For questions about this policy or to discuss your booking, please contact us:
• Business Name: ${businessNameText}
• Email: [your email]
• Phone: [your phone number]
• Address: [your business address]

By booking an appointment with ${businessNameText}, you acknowledge that you have read, understood, and agree to this Appointment Booking & Deposit Policy.

---
This policy template is HMRC-compliant and follows UK consumer protection laws. It is recommended that you consult with a legal professional to ensure it meets your specific business needs.

Generated by Elite Booker - UK Booking Software
https://www.elitebooker.co.uk`;
  };

  const policyText = generatePolicy();

  const handleCopy = () => {
    navigator.clipboard.writeText(policyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([policyText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${businessName || "Business"}-Deposit-Policy.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Schema.org
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salon Deposit Policy Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    description:
      "Free HMRC-compliant deposit policy generator for UK salons, spas, and beauty businesses. Generate a professional cancellation policy in seconds.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this deposit policy template legally compliant in the UK?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this template follows UK consumer protection laws and HMRC VAT regulations. It includes GDPR-compliant data protection statements and clear refund terms. However, we recommend having a solicitor review it for your specific business needs.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to charge VAT on deposits?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If you're VAT-registered, yes. Deposits are advance payments for services, so they're subject to VAT at the standard rate. The policy template includes VAT compliance language to keep you HMRC-compliant.",
        },
      },
      {
        "@type": "Question",
        name: "What's a fair cancellation window for salons?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "48 hours is the UK industry standard for beauty treatments. This gives you time to fill the slot while being fair to clients. High-value treatments (£100+) often require 72 hours notice.",
        },
      },
      {
        "@type": "Question",
        name: "Can I legally keep deposits for no-shows?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, as long as your policy clearly states this upfront and the client agrees when booking. The deposit compensates you for reserved time and lost opportunity to book another client.",
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>
          Free Salon Deposit Policy Generator | HMRC-Compliant Template UK
        </title>
        <meta
          name="description"
          content="Generate a free, HMRC-compliant deposit & cancellation policy for your UK salon, spa, or beauty business in 30 seconds. Copy-paste ready, legally sound."
        />
        <meta
          name="keywords"
          content="salon cancellation policy template UK, deposit policy generator, HMRC compliant salon policy, beauty business terms and conditions"
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/tools/deposit-policy-generator"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Free Salon Deposit Policy Generator UK"
        />
        <meta
          property="og:description"
          content="Generate an HMRC-compliant deposit policy in 30 seconds. Free template for UK salons."
        />
        <meta
          property="og:url"
          content="https://www.elitebooker.co.uk/tools/deposit-policy-generator"
        />
        <meta property="og:type" content="website" />

        {/* Schema */}
        <script type="application/ld+json">{JSON.stringify(toolSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero */}
        <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-blue-100 mb-6">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  HMRC-Compliant • Free Tool
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Salon Deposit Policy Generator
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Generate a professional, HMRC-compliant deposit & cancellation
                policy for your UK salon in 30 seconds. Copy-paste ready, no
                legal jargon.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Generator Section */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Policy Settings
                </h2>

                <div className="space-y-6">
                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Bella Beauty Salon"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg"
                    />
                  </div>

                  {/* Deposit Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deposit Type
                    </label>
                    <select
                      value={depositType}
                      onChange={(e) => setDepositType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg bg-white"
                    >
                      <option value="fixed">Fixed amount (£)</option>
                      <option value="percentage">
                        Percentage of treatment price (%)
                      </option>
                    </select>
                  </div>

                  {/* Deposit Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deposit Amount {depositType === "fixed" ? "(£)" : "(%)"}
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg"
                      min="1"
                      max={depositType === "percentage" ? "100" : "500"}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {depositType === "fixed"
                        ? "Typical: £10-£30 for standard treatments, £50+ for high-value services"
                        : "Typical: 20-50% of treatment price"}
                    </p>
                  </div>

                  {/* Cancellation Window */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cancellation Notice Period (hours)
                    </label>
                    <select
                      value={cancellationWindow}
                      onChange={(e) => setCancellationWindow(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg bg-white"
                    >
                      <option value="24">24 hours</option>
                      <option value="48">48 hours (recommended)</option>
                      <option value="72">72 hours</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                      48 hours is UK industry standard for beauty treatments
                    </p>
                  </div>

                  {/* Refund Policy */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Refund Policy
                    </label>
                    <select
                      value={refundPolicy}
                      onChange={(e) => setRefundPolicy(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none text-lg bg-white"
                    >
                      <option value="full">Full refund with notice</option>
                      <option value="partial">
                        Partial refund (50%) with short notice
                      </option>
                      <option value="none">
                        Non-refundable (rescheduling only)
                      </option>
                    </select>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <strong className="text-blue-900">
                          HMRC Compliance:
                        </strong>{" "}
                        This generator creates a policy that follows UK consumer
                        protection laws and includes GDPR-compliant data
                        handling statements.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Generated Policy */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Your Policy
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                      {policyText}
                    </pre>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    Need Deposit Collection Too?
                  </h3>
                  <p className="mb-6 opacity-90">
                    Elite Booker automatically collects deposits when clients
                    book. Reduce no-shows by 85%.
                  </p>
                  <a
                    href="/features/no-show-protection"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:shadow-2xl transition-all text-lg"
                  >
                    See How It Works
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why You Need This */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Every Salon Needs a Deposit Policy
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">😤</span>
                </div>
                <h3 className="font-bold text-lg mb-2">
                  No-Shows Cost £500-£2000/Month
                </h3>
                <p className="text-gray-600 text-sm">
                  Without deposits, 20-35% of bookings are no-shows. That's
                  thousands in lost revenue every month.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Legal Protection</h3>
                <p className="text-gray-600 text-sm">
                  Clear T&Cs protect you from disputes. HMRC compliance keeps
                  you out of VAT trouble.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">85% Fewer No-Shows</h3>
                <p className="text-gray-600 text-sm">
                  When clients pay a deposit, they show up. It's psychology:
                  they've already invested.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 group"
                >
                  <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {faq.name}
                    <span className="text-blue-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {faq.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
