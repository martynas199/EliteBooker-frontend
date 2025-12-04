import { api } from "../../shared/lib/apiClient";

export const getWishlist = async (token) => {
  const response = await api.get("/wishlist", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const toggleWishlist = async (token, productId) => {
  const response = await api.post(
    "/wishlist/toggle",
    { productId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const addToWishlist = async (token, productId) => {
  const response = await api.post(
    "/wishlist",
    { productId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const removeFromWishlist = async (token, productId) => {
  const response = await api.delete(`/wishlist/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const clearWishlist = async (token) => {
  const response = await api.delete("/wishlist", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
