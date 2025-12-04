const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Get user's bookings
export const getUserBookings = async (token) => {
  const response = await fetch(`${API_URL}/api/users/me/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch bookings");
  }

  return response.json();
};

// Get user's orders
export const getUserOrders = async (token) => {
  const response = await fetch(`${API_URL}/api/users/me/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch orders");
  }

  return response.json();
};

// Cancel a booking
export const cancelBooking = async (token, bookingId, reason) => {
  const response = await fetch(
    `${API_URL}/api/users/me/bookings/${bookingId}/cancel`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel booking");
  }

  return response.json();
};

// Update user profile
export const updateUserProfile = async (token, updates) => {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
};

// Delete user account
export const deleteUserAccount = async (token, password) => {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete account");
  }

  return response.json();
};
