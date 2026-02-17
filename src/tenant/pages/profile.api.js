import { api } from "../../shared/lib/apiClient";

// Get user's bookings
export const getUserBookings = async (token) => {
  const response = await api.get("/users/me/bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Get user's orders
export const getUserOrders = async (token) => {
  const response = await api.get("/users/me/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Cancel a booking
export const cancelBooking = async (token, bookingId, reason) => {
  const response = await api.patch(
    `/users/me/bookings/${bookingId}/cancel`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// Update user profile
export const updateUserProfile = async (token, updates) => {
  const response = await api.patch("/users/me", updates, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Delete user account
export const deleteUserAccount = async (token, password) => {
  const response = await api.delete("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { password },
  });

  return response.data;
};
