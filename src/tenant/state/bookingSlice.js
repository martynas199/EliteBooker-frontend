import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  services: [], // Array of services
  specialist: null,
  date: null,
  time: null,
  customerInfo: null,
  client: null,
  mode: null,
  appointmentId: null,
  // Legacy single service support
  service: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Multi-service actions
    addService: (state, action) => {
      state.services.push(action.payload);
      // Update legacy field for first service
      if (state.services.length === 1) {
        state.service = action.payload;
      }
    },
    removeService: (state, action) => {
      const index = action.payload;
      if (
        typeof index === "number" &&
        index >= 0 &&
        index < state.services.length
      ) {
        state.services.splice(index, 1);
      }
      // Update legacy field
      state.service = state.services[0] || null;
    },
    clearServices: (state) => {
      state.services = [];
      state.service = null;
    },
    setServices: (state, action) => {
      state.services = action.payload;
      state.service = action.payload[0] || null;
    },
    // Legacy single service action
    setService: (state, action) => {
      state.service = action.payload;
      state.services = action.payload ? [action.payload] : [];
    },
    setSpecialist: (state, action) => {
      state.specialist = action.payload;
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
      state.services = [];
      state.service = null;
      state.specialist = null;
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
  addService,
  removeService,
  clearServices,
  setServices,
  setService,
  setSpecialist,
  setDateTime,
  setCustomerInfo,
  setClient,
  setMode,
  setAppointmentId,
  clearBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
