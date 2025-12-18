/**
 * Tenant Context
 *
 * Provides tenant information and branding to all components
 */

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const TenantContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Resolve tenant from current URL
 */
function resolveTenantFromURL() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Check for path-based tenant (/salon/slug)
  const pathMatch = pathname.match(/^\/salon\/([^\/]+)/);
  if (pathMatch) {
    return {
      type: "path",
      slug: pathMatch[1],
    };
  }

  // Check for subdomain (tenant.platform.com)
  const parts = hostname.split(".");
  if (parts.length >= 3 && !["www", "api", "admin"].includes(parts[0])) {
    return {
      type: "subdomain",
      slug: parts[0],
    };
  }

  // Check for custom domain (not localhost or known platform domains)
  const platformDomains = [
    "localhost",
    "elitebooker.co.uk",
    "www.elitebooker.co.uk",
    "vercel.app", // All Vercel preview/production deployments
    "nobleelegance.co.uk",
    "permanentbyjuste.co.uk",
  ];

  if (!platformDomains.some((d) => hostname.includes(d))) {
    return {
      type: "custom-domain",
      domain: hostname,
    };
  }

  // Default/platform site (www.elitebooker.co.uk = platform marketing site)
  return {
    type: "platform",
    slug: null,
  };
}

export function TenantProvider({ children }) {
  const location = useLocation();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolution, setResolution] = useState(null);

  useEffect(() => {
    async function loadTenant() {
      try {
        setLoading(true);
        setError(null);

        const resolved = resolveTenantFromURL();
        setResolution(resolved);

        // If no tenant detected, show platform site
        if (!resolved.slug && !resolved.domain) {
          setTenant(null);
          setLoading(false);
          return;
        }

        // Fetch tenant data
        let response;
        if (resolved.slug) {
          response = await axios.get(
            `${API_URL}/api/tenants/slug/${resolved.slug}`
          );
        } else if (resolved.domain) {
          // Custom domain - backend will resolve
          response = await axios.get(`${API_URL}/api/tenants/current`, {
            headers: { Host: resolved.domain },
          });
        }

        if (response?.data?.tenant) {
          setTenant(response.data.tenant);

          // Apply branding
          applyTenantBranding(response.data.tenant);
        } else {
          setTenant(null);
        }
      } catch (err) {
        console.error("Failed to load tenant:", err);
        setError(err.message);
        setTenant(null);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [location.pathname]); // Re-run when pathname changes

  /**
   * Apply tenant branding to the page
   */
  function applyTenantBranding(tenantData) {
    if (!tenantData?.branding) return;

    const { branding } = tenantData;
    const root = document.documentElement;

    // Apply CSS custom properties
    if (branding.primaryColor) {
      root.style.setProperty("--primary-color", branding.primaryColor);
    }
    if (branding.secondaryColor) {
      root.style.setProperty("--secondary-color", branding.secondaryColor);
    }
    if (branding.accentColor) {
      root.style.setProperty("--accent-color", branding.accentColor);
    }

    // Update favicon
    if (branding.favicon?.url) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = branding.favicon.url;
      }
    }

    // Update page title
    if (tenantData.name) {
      document.title = `${tenantData.name} - Book Online | Elite Booker`;
    }
  }

  const value = useMemo(
    () => ({
      tenant,
      loading,
      error,
      resolution,
      isPlatform: resolution?.type === "platform",
      isCustomDomain: resolution?.type === "custom-domain",
      refreshTenant: async () => {
        // Re-fetch tenant data
        setLoading(true);
        const resolved = resolveTenantFromURL();
        if (resolved.slug) {
          const response = await axios.get(
            `${API_URL}/api/tenants/slug/${resolved.slug}`
          );
          setTenant(response.data.tenant);
          applyTenantBranding(response.data.tenant);
        }
        setLoading(false);
      },
    }),
    [tenant, loading, error, resolution]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}

/**
 * Hook to access tenant branding
 */
export function useTenantBranding() {
  const { tenant } = useTenant();
  return tenant?.branding || {};
}

/**
 * Hook to check if user is on platform site
 */
export function useIsPlatform() {
  const { isPlatform } = useTenant();
  return isPlatform;
}

export default TenantContext;
