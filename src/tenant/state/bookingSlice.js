import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  service: null,
  beautician: null,
  date: null,
  time: null,
  customerInfo: null,
  client: null,
  mode: null,
  appointmentId: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setService: (state, action) => {
      state.service = action.payload;
    },
    setBeautician: (state, action) => {
      state.beautician = action.payload;
    },
    setDateTime: (state, action) => {
      state.date = action.payload.date;
      state.time = action.payload.time;
    },
    setCustomerInfo: (state, action) => {
      state.customerInfo = action.payload;
    },
    setClient: (state, action) => {
      state.client = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setAppointmentId: (state, action) => {
      state.appointmentId = action.payload;
    },
    clearBooking: (state) => {
      state.service = null;
      state.beautician = null;
      state.date = null;
      state.time = null;
      state.customerInfo = null;
      state.client = null;
      state.mode = null;
      state.appointmentId = null;
    },
  },
});

export const {
  setService,
  setBeautician,
  setDateTime,
  setCustomerInfo,
  setClient,
  setMode,
  setAppointmentId,
  clearBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
