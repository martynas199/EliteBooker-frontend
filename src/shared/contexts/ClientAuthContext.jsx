import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/apiClient";

const ClientAuthContext = createContext(null);

export function ClientAuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch profile on mount (cookie-based auth)
    fetchClientProfile();
  }, []);

  const fetchClientProfile = async () => {
    try {
      console.log("[ClientAuth] Attempting to fetch client profile...");
      const response = await api.get("/client/me");
      console.log(
        "[ClientAuth] Profile fetched successfully:",
        response.data.client
      );
      console.log("[ClientAuth] Avatar URL:", response.data.client.avatar);
      setClient(response.data.client);
    } catch (error) {
      console.log(
        "[ClientAuth] Failed to fetch client profile:",
        error.response?.status
      );
      // If unauthorized, clear client state (don't call logout to avoid recursion)
      if (error.response?.status === 401) {
        console.log("[ClientAuth] Unauthorized - clearing client state");
        setClient(null);
      }
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
