import { useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Only load analytics after user interacts with the landing page
// or navigates away from it to save initial load performance
export default function ConditionalAnalytics() {
  const location = useLocation();

  // Don't load on landing page
  const isLandingPage = location.pathname === "/";

  if (isLandingPage) {
    return null;
  }

  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
