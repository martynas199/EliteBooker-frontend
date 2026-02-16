const DEFAULT_API_URL = "http://localhost:4000";

export const env = {
  API_URL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  API_BASE_URL: `${import.meta.env.VITE_API_URL || DEFAULT_API_URL}/api`,
};
