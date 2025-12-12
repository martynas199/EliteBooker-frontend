import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/apiClient";

const ClientAuthContext = createContext(null);

export function ClientAuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch profile on mount (cookie-based auth)
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        alert("[ClientAuth] Fetch timeout - setting loading to false");
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    fetchClientProfile().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, []);

  // Detect OAuth redirect and handle token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authSuccess = params.get("auth");
    const tokenFromUrl = params.get("token");

    if (authSuccess === "success" && tokenFromUrl) {
      console.log("[ClientAuth] OAuth success - storing token in localStorage");
      // Store token in localStorage (like beauty salon app)
      localStorage.setItem("clientToken", tokenFromUrl);
      
      // Fetch profile
      fetchClientProfile().then((success) => {
        if (success) {
          console.log("[ClientAuth] Profile loaded successfully");
          // Clean up URL
          const newUrl = window.location.pathname;
          navigate(newUrl, { replace: true });
        }
      });
    }
  }, [location.search]);

  const fetchClientProfile = async () => {
    try {
      console.log("[ClientAuth] Attempting to fetch client profile...");
      const response = await api.get("/client/me");
      console.log("[ClientAuth] Profile fetched successfully:", response.data.client.email);
      setClient(response.data.client);
      return true;
    } catch (error) {
      console.log("[ClientAuth] Failed to fetch:", error.response?.status || error.message);
      // If unauthorized, clear client state and localStorage
      if (error.response?.status === 401) {
        console.log("[ClientAuth] Unauthorized - clearing client state");
        setClient(null);
        localStorage.removeItem("clientToken");
      } else if (!error.response) {
        // Network error or timeout
        console.log("[ClientAuth] Network error - clearing client state");
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
    // Store token in localStorage (like beauty salon app)
    if (token) {
      localStorage.setItem("clientToken", token);
      console.log("[ClientAuth] Token stored in localStorage");
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
    // Store token in localStorage (like beauty salon app)
    if (token) {
      localStorage.setItem("clientToken", token);
      console.log("[ClientAuth] Token stored in localStorage");
    }
    setClient(clientData);
    return clientData;
  };

  const logout = async () => {
    console.log("[ClientAuth] Starting logout process...");

    // Clear client state and localStorage immediately
    setClient(null);
    localStorage.removeItem("clientToken");

    try {
      // Call backend to clear httpOnly cookie (for backward compatibility)
      await api.post("/client/logout");
      console.log("[ClientAuth] Backend logout successful");
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
