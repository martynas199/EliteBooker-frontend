import { api } from "../lib/apiClient";

/**
 * Get user's favorite tenants
 */
export const getFavorites = async () => {
  const response = await api.get("/favorites");
  return response.data;
};

/**
 * Add tenant to favorites
 */
export const addToFavorites = async (tenantId) => {
  const response = await api.post(`/favorites/${tenantId}`);
  return response.data;
};

/**
 * Remove tenant from favorites
 */
export const removeFromFavorites = async (tenantId) => {
  const response = await api.delete(`/favorites/${tenantId}`);
  return response.data;
};

/**
 * Check if tenant is in favorites
 */
export const isFavorite = async (tenantId, favorites) => {
  if (!favorites || !Array.isArray(favorites)) return false;
  return favorites.some((fav) => fav._id === tenantId || fav === tenantId);
};
