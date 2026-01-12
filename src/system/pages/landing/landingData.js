/**
 * Static data for the landing page
 * Extracted to reduce main bundle size and improve initial load performance
 */

export const features = [
  {
    id: "booking",
    title: "24/7 Online Booking",
    description:
      "Let clients book appointments anytime, anywhere. Smart calendar prevents double bookings and shows real-time availability.",
  },
  {
    id: "payments",
    title: "Secure Payments",
    description:
      "Accept deposits, full payments, or pay-at-salon. Powered by Stripe with instant payouts to your bank account.",
  },
  {
    id: "reminders",
    title: "Automated Reminders",
    description:
      "Reduce no-shows by up to 70%. Automatic email reminders sent to clients before their appointments.",
  },
  {
    id: "staff",
    title: "Staff Management",
    description:
      "Manage your team's schedules, services, and availability. Track individual performance and earnings.",
  },
  {
    id: "mobile",
    title: "Mobile-Friendly",
    description:
      "Beautiful experience on any device. Clients can book from their phone, tablet, or computer.",
  },
  {
    id: "insights",
    title: "Business Insights",
    description:
      "See your revenue, popular services, and busiest times. Make data-driven decisions to grow your business.",
  },
];

export const testimonials = [
  {
    quote:
      "Our no-shows dropped by 65% in the first month. The automated reminders are a game-changer for our business.",
    author: "Sarah Thompson",
    role: "Owner, Bella Beauty Salon",
    rating: 5,
  },
  {
    quote:
      "Clients love booking online at 2am. We've gained 30% more appointments since switching to this system.",
    author: "Marcus Chen",
    role: "Manager, Serenity Spa",
    rating: 5,
  },
  {
    quote:
      "The payment system saves us hours every week. Everything is automated and money goes straight to our bank.",
    author: "Emma Rodriguez",
    role: "Owner, Elite Hair Studio",
    rating: 5,
  },
];

export const stats = [
  { value: "10,000+", label: "Appointments Booked" },
  { value: "500+", label: "Happy Businesses" },
  { value: "70%", label: "Fewer No-Shows" },
  { value: "24/7", label: "Online Booking" },
];

export const pricingPlans = [
  {
    name: "Basic",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for getting started",
    features: [
      "Unlimited staff members",
      "Unlimited bookings",
      "Online payments",
      "Email confirmations",
      "Mobile-friendly booking page",
      "Customer management",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
    learnMore: true,
  },
  {
    name: "Professional",
    price: { monthly: 9.99, annual: 8.33 },
    description: "For growing salons and spas",
    features: [
      "Everything in Basic",
      "No booking fees",
      "Advanced analytics",
      "Automated reminders",
      "Custom branding",
      "Staff earnings tracking",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
    learnMore: false,
  },
  {
    name: "Enterprise",
    price: { monthly: 49.99, annual: 41.66 },
    description: "For multi-location businesses",
    features: [
      "Everything in Professional",
      "Multiple locations",
      "E-commerce store",
      "Advanced reporting",
      "Dedicated account manager",
      "Training & onboarding",
      "24/7 phone support",
    ],
    cta: "Start Free Trial",
    popular: false,
    learnMore: false,
  },
];

export const demoVideoUrl = "https://www.youtube.com/embed/uJC681X-d2Q";
