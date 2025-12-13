import { api } from "../lib/apiClient";

/**
 * Create a new gift card
 */
export const createGiftCard = async (data) => {
  const response = await api.post("/gift-cards", data);
  return response.data;
};

/**
 * Get gift card by code
 */
export const getGiftCard = async (code) => {
  const response = await api.get(`/gift-cards/${code}`);
  return response.data;
};

/**
 * Redeem a gift card
 */
export const redeemGiftCard = async (code, amount, appointmentId) => {
  const response = await api.patch(`/gift-cards/${code}/redeem`, {
    amount,
    appointmentId,
  });
  return response.data;
};

/**
 * Get purchased gift cards
 */
export const getPurchasedGiftCards = async () => {
  const response = await api.get("/gift-cards/my/purchased");
  return response.data;
};

/**
 * Get received gift cards
 */
export const getReceivedGiftCards = async () => {
  const response = await api.get("/gift-cards/my/received");
  return response.data;
};
