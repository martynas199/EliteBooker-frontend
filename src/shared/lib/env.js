// Use empty string to make requests to same origin (Vite proxy will forward to backend)
// This enables HttpOnly cookies to work properly
export const env = { API_URL: import.meta.env.VITE_API_URL || "" };
