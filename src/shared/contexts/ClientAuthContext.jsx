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
      const response = await api.get("/client/me");
      setClient(response.data.client);
    } catch (error) {
      console.error("Failed to fetch client profile:", error);
      // If unauthorized, clear token
      if (error.response?.status === 401) {
        logout();
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
    try {
      await api.post("/client/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setClient(null);
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
