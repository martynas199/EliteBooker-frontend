import { api } from "../lib/apiClient";

// Test API connection - you can call this from browser console
export const testApiConnection = async () => {
  console.log("🔍 Testing API connection...");

  try {
    console.log("📍 API Base URL:", api.defaults.baseURL);

    // Test basic connection
    console.log("1️⃣ Testing /api/services...");
    const servicesResponse = await api.get("/services");
    console.log("✅ Services response:", servicesResponse);

    console.log("2️⃣ Testing /api/beauticians...");
    const beauticiansResponse = await api.get("/beauticians");
    console.log("✅ Beauticians response:", beauticiansResponse);

    console.log("3️⃣ Testing /api/auth/me...");
    const authResponse = await api.get("/auth/me");
    console.log("✅ Auth response:", authResponse);

    return {
      success: true,
      services: servicesResponse.data,
      beauticians: beauticiansResponse.data,
      auth: authResponse.data,
    };
  } catch (error) {
    console.error("❌ API Test failed:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });

    return {
      success: false,
      error: error.message,
      details: error.response?.data || error,
    };
  }
};

// Add to window for easy console testing
if (typeof window !== "undefined") {
  window.testApiConnection = testApiConnection;
}
