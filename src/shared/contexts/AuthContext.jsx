import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("userToken"));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch current user from API
  const fetchCurrentUser = async () => {
    try {
      // Always read the latest token from localStorage
      const currentToken = localStorage.getItem("userToken");

      if (!currentToken) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/user-auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Update token state if it changed
        if (currentToken !== token) {
          setToken(currentToken);
        }
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (name, email, phone, password) => {
    try {
      const response = await fetch(`${API_URL}/api/user-auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Save token and user
      localStorage.setItem("userToken", data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/user-auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save token and user
      localStorage.setItem("userToken", data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (updates) => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || "Update failed");
      error.response = { data }; // Attach response data for error handling
      throw error;
    }

    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
