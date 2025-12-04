import { api } from "../../../shared/lib/apiClient";

/**
 * Get shipping rates from ShipEngine
 * @param {Object} shipmentData - ShipEngine shipment data
 * @returns {Promise<Object>} ShipEngine rate response
 */
export const getShippingRates = async (shipmentData) => {
  const response = await api.post("/shipping/rates", shipmentData);
  return response.data;
};

/**
 * Calculate shipping cost for cart items
 * @param {Object} params - Shipping calculation parameters
 * @param {string} params.postalCode - Destination postal code
 * @param {string} params.countryCode - Destination country code (default: GB)
 * @param {string} params.city - Destination city
 * @param {Array} params.items - Cart items with weight and quantity
 * @returns {Promise<Object>} Shipping cost and service info
 */
export const calculateShipping = async ({
  postalCode,
  countryCode = "GB",
  city,
  items,
}) => {
  const response = await api.post("/shipping/calculate", {
    postalCode,
    countryCode,
    city,
    items,
  });
  return response.data;
};

/**
 * Royal Mail service options
 */
export const ROYAL_MAIL_SERVICES = [
  { code: "royal_mail_tracked_24", label: "Tracked 24 (Next Day)" },
  { code: "royal_mail_tracked_48", label: "Tracked 48 (2 Days)" },
  { code: "royal_mail_signed_1st_class", label: "Signed For 1st Class" },
  { code: "royal_mail_signed_2nd_class", label: "Signed For 2nd Class" },
  { code: "royal_mail_standard_1st_class", label: "Standard 1st Class" },
  { code: "royal_mail_standard_2nd_class", label: "Standard 2nd Class" },
  { code: "", label: "Any available service" },
];
