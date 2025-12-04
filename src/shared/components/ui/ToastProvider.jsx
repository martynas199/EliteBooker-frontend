import { Toaster } from "react-hot-toast";

/**
 * Global toast notification provider
 * Provides elegant, animated toast messages throughout the app
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 9999,
      }}
      toastOptions={{
        // Default options
        duration: 4000,
        dismissible: true,
        style: {
          background: "#fff",
          color: "#1f2937",
          padding: "16px 20px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          maxWidth: "500px",
          fontFamily: "inherit",
          cursor: "pointer",
        },
        // Success toast
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
          style: {
            border: "1px solid #d1fae5",
          },
        },
        // Error toast
        error: {
          duration: 5000,
          dismissible: true,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
          style: {
            border: "1px solid #fee2e2",
            cursor: "pointer",
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: "#d4a710",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
