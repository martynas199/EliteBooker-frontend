import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { store } from "./app/store";
import AppRoutes from "./app/routes";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import { AuthProvider } from "./shared/contexts/AuthContext";
import { ClientAuthProvider } from "./shared/contexts/ClientAuthContext";
import { CurrencyProvider } from "./shared/contexts/CurrencyContext";
import { LanguageProvider } from "./shared/contexts/LanguageContext";
import { TenantProvider } from "./shared/contexts/TenantContext";
import ToastProvider from "./shared/components/ui/ToastProvider";
import { queryClient } from "./shared/lib/queryClient";
import "./styles.css";
import {
  initializeCapacitor,
  addSafeAreaSupport,
  disablePullToRefresh,
} from "./capacitor/appInit";

// Initialize Capacitor for mobile apps
initializeCapacitor();
addSafeAreaSupport();
disablePullToRefresh();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <BrowserRouter>
              <TenantProvider>
                <AuthProvider>
                  <ClientAuthProvider>
                    <CurrencyProvider>
                      <LanguageProvider>
                        <AppRoutes />
                        <ToastProvider />
                        <SpeedInsights />
                        <Analytics />
                      </LanguageProvider>
                    </CurrencyProvider>
                  </ClientAuthProvider>
                </AuthProvider>
              </TenantProvider>
            </BrowserRouter>
          </Provider>
          {/* React Query DevTools - Only shows in development */}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
