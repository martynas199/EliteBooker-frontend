/**
 * Tenant Context
 *
 * Provides tenant information and branding to all components
 */

import { createContext, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import { queryKeys } from "../lib/queryClient";

const TenantContext = createContext(null);

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
  const queryClient = useQueryClient();
  const location = useLocation();
  const tenantResolution = useMemo(
    () => resolveTenantFromURL(),
    [location.pathname],
  );
  const tenantResolutionKey = `${tenantResolution.type || "platform"}:${
    tenantResolution.slug || tenantResolution.domain || ""
  }`;

  const {
    data: tenantData,
    isLoading: loading,
    error: tenantError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.tenant.byResolution(tenantResolutionKey),
    queryFn: async ({ signal }) => {
      // If no tenant detected, show platform site
      if (!tenantResolution.slug && !tenantResolution.domain) {
        return {
          tenant: null,
          resolution: tenantResolution,
        };
      }

      let response;
      if (tenantResolution.slug) {
        response = await api.get(`/tenants/slug/${tenantResolution.slug}`, {
          signal,
        });
      } else {
        // Custom domain - backend resolves tenant by host
        response = await api.get("/tenants/current", {
          signal,
          headers: { Host: tenantResolution.domain },
        });
      }

      return {
        tenant: response?.data?.tenant || null,
        resolution: tenantResolution,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const tenant = tenantData?.tenant || null;
  const resolution = tenantData?.resolution || tenantResolution;
  const error = tenantError?.message || null;

  useEffect(() => {
    if (tenant) {
      applyTenantBranding(tenant);
    }
  }, [tenant]);

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
        await queryClient.invalidateQueries({
          queryKey: queryKeys.tenant.byResolution(tenantResolutionKey),
        });
        return refetch();
      },
    }),
    [
      tenant,
      loading,
      error,
      resolution,
      queryClient,
      tenantResolutionKey,
      refetch,
    ],
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
