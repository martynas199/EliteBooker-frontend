import { configureStore } from "@reduxjs/toolkit";
import booking from "../tenant/state/bookingSlice";
import auth from "../shared/state/authSlice";
import cart from "../tenant/state/cartSlice";

export const store = configureStore({
  reducer: {
    booking,
    auth,
    cart,
  },
});
