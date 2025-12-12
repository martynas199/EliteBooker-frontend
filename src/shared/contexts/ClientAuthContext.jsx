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

  // Detect OAuth redirect and refresh profile
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authSuccess = params.get("auth");
    const tokenFromUrl = params.get("token");

    if (authSuccess === "success") {
      alert("[ClientAuth] OAuth redirect detected");

      // If we have a token in URL (fallback), use it
      if (tokenFromUrl) {
        alert("[ClientAuth] Token found in URL, storing...");
        // Set the token in Authorization header for this request
        api.defaults.headers.common["Authorization"] = `Bearer ${tokenFromUrl}`;
        
        // Fetch profile with the token
        fetchClientProfile().then((success) => {
          if (success) {
            alert("[ClientAuth] Profile loaded with URL token");
            // Clean up URL
            const newUrl = window.location.pathname;
            navigate(newUrl, { replace: true });
            // Remove the Authorization header (rely on cookies from now on)
            delete api.defaults.headers.common["Authorization"];
          } else {
            alert("[ClientAuth] Failed to load profile with URL token");
          }
        });
      } else {
        // No token in URL, rely on cookie
        alert("[ClientAuth] No URL token, using cookie");
        setTimeout(() => {
          fetchClientProfile().then((success) => {
            if (success) {
              alert("[ClientAuth] Profile loaded with cookie");
              const newUrl = window.location.pathname;
              navigate(newUrl, { replace: true });
            } else {
              alert("[ClientAuth] Failed to load profile with cookie");
            }
          });
        }, 200);
      }
    }
  }, [location.search]);

  const fetchClientProfile = async () => {
    try {
      alert("[ClientAuth] Attempting to fetch client profile...");
      const response = await api.get("/client/me");
      alert("[ClientAuth] Profile fetched successfully: " + response.data.client.email);
      setClient(response.data.client);
      return true;
    } catch (error) {
      alert("[ClientAuth] Failed to fetch: " + (error.response?.status || error.message));
      // If unauthorized, clear client state (don't call logout to avoid recursion)
      if (error.response?.status === 401) {
        alert("[ClientAuth] Unauthorized - clearing client state");
        setClient(null);
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
    const { client: clientData } = response.data;
    // Token is set as httpOnly cookie by backend
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
    const { client: clientData } = response.data;
    // Token is set as httpOnly cookie by backend
    setClient(clientData);
    return clientData;
  };

  const logout = async () => {
    console.log("[ClientAuth] Starting logout process...");

    // Clear client state immediately
    setClient(null);

    try {
      // Call backend to clear httpOnly cookie
      await api.post("/client/logout");
      console.log("[ClientAuth] Backend logout successful - cookie cleared");
      return true;
    } catch (error) {
      console.error("[ClientAuth] Backend logout error:", error);
      // Client state already cleared
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
