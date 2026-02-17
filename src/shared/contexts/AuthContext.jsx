import {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { api } from "../lib/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("userToken"));
  const [loading, setLoading] = useState(true);

  // Fetch current user helper (defined at component scope so it can be exposed in context)
  const logout = useCallback(() => {
    localStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(
    async (options = {}) => {
      try {
        // Always read the latest token from localStorage
        const currentToken = localStorage.getItem("userToken");

        if (!currentToken) {
          setLoading(false);
          return;
        }

        const response = await api.get("/user-auth/me", {
          signal: options.signal,
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });

        setUser(response.data?.user || null);
        setToken(currentToken);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        logout();
      } finally {
        setLoading(false);
      }
    },
    [logout],
  );

  // Load user on mount if token exists
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    fetchCurrentUser({ signal: controller.signal });

    return () => {
      controller.abort(); // Cancel request on unmount
    };
  }, [token, fetchCurrentUser]);

  // Register new user
  const register = useCallback(async (name, email, phone, password) => {
    try {
      const response = await api.post("/user-auth/register", {
        name,
        email,
        phone,
        password,
      });

      const data = response.data;

      // Save token and user
      localStorage.setItem("userToken", data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post("/user-auth/login", {
        email,
        password,
      });

      const data = response.data;

      // Save token and user
      localStorage.setItem("userToken", data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(
    async (updates) => {
      const response = await api.patch("/users/me", updates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setUser(data.user);
      return data.user;
    },
    [token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      updateProfile,
      refreshUser: fetchCurrentUser,
    }),
    [
      user,
      token,
      loading,
      register,
      login,
      logout,
      updateProfile,
      fetchCurrentUser,
    ],
  );

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
