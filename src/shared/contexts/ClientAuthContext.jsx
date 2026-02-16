import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/apiClient";

const ClientAuthContext = createContext(null);
const CLIENT_AUTH_DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_CLIENT_AUTH_DEBUG === "true";

const authDebug = (...args) => {
  if (CLIENT_AUTH_DEBUG) {
    console.log(...args);
  }
};

export function ClientAuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("clientToken");

    if (token) {
      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
        }
      }, 5000);

      fetchClientProfile().finally(() => {
        clearTimeout(timeoutId);
      });

      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
    }
  }, []);

  // Detect OAuth redirect and refresh profile
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authSuccess = params.get("auth");
    const tokenFromUrl = params.get("token");

    if (authSuccess === "success") {
      // If we have a token in URL (fallback), use it
      if (tokenFromUrl) {
        localStorage.setItem("clientToken", tokenFromUrl);

        // Fetch profile with the token
        fetchClientProfile().then((success) => {
          if (success) {
            // Clean up URL
            const newUrl = window.location.pathname;
            navigate(newUrl, { replace: true });
          }
        });
      } else {
        // No token in URL, rely on existing token
        setTimeout(() => {
          fetchClientProfile().then((success) => {
            if (success) {
              const newUrl = window.location.pathname;
              navigate(newUrl, { replace: true });
            }
          });
        }, 200);
      }
    }
  }, [location.search]);

  const fetchClientProfile = async () => {
    try {
      const response = await api.get("/client/me");
      setClient(response.data.client);
      return true;
    } catch (error) {
      // If unauthorized, clear client state
      if (error.response?.status === 401) {
        setClient(null);
        localStorage.removeItem("clientToken");
      } else if (!error.response) {
        // Network error or timeout
        authDebug("[ClientAuth] Network error - clearing client state");
        setClient(null);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post("/client/login", { email, password });
    const { client: clientData, token } = response.data;

    // Store token in BOTH localStorage and sessionStorage for cross-domain reliability
    if (token) {
      authDebug(
        "[ClientAuth] Storing token from login:",
        token.substring(0, 20) + "...",
      );

      // Try multiple storage methods for mobile Safari compatibility
      try {
        localStorage.setItem("clientToken", token);
        sessionStorage.setItem("clientToken", token);

        // Verify it was stored
        const verify = localStorage.getItem("clientToken");
        if (!verify) {
          console.error("[ClientAuth] localStorage failed to store token!");
          localStorage.setItem("clientToken", token);
        }
        authDebug(
          "[ClientAuth] Token stored:",
          verify ? "✓ localStorage" : "✓ sessionStorage",
        );
      } catch (e) {
        console.error("[ClientAuth] Storage error:", e);
        sessionStorage.setItem("clientToken", token);
      }
    } else {
      console.warn("[ClientAuth] No token received from login response");
    }

    setClient(clientData);
    return clientData;
  };

  const register = async (email, password, name, phone) => {
    const response = await api.post("/client/register", {
      email,
      password,
      name,
      phone,
    });
    const { client: clientData, token } = response.data;

    // Store token in localStorage for persistence
    if (token) {
      localStorage.setItem("clientToken", token);
    }

    setClient(clientData);
    return clientData;
  };

  const logout = async () => {
    authDebug("[ClientAuth] Starting logout process...");

    // Clear client state and localStorage immediately
    setClient(null);
    localStorage.removeItem("clientToken");

    try {
      // Call backend to clear httpOnly cookie
      await api.post("/client/logout");
      authDebug("[ClientAuth] Backend logout successful - cookie cleared");
      return true;
    } catch (error) {
      console.error("[ClientAuth] Backend logout error:", error);
      // Client state and localStorage already cleared
      return false;
    }
  };

  const value = {
    client,
    loading,
    isAuthenticated: !!client,
    login,
    register,
    logout,
    refreshProfile: fetchClientProfile,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within ClientAuthProvider");
  }
  return context;
}
