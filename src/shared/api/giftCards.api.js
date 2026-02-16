import { api } from "../lib/apiClient";

/**
 * Create a new gift card
 */
export const createGiftCard = async (data) => {
  const response = await api.post("/gift-cards", data);
  return response.data;
};

/**
 * Create Stripe checkout session for gift card purchase
 */
export const createGiftCardCheckoutSession = async (data) => {
  const response = await api.post("/gift-cards/create-session", data);
  return response.data;
};

/**
 * Confirm gift card checkout after Stripe redirect
 */
export const confirmGiftCardCheckout = async (sessionId) => {
  const response = await api.get(
    `/gift-cards/confirm?session_id=${encodeURIComponent(sessionId)}`
  );
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
