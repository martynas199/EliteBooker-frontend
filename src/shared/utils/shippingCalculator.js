/**
 * Calculate shipping rates based on weight and destination
 * This replaces the backend shipping calculation for better performance
 */

/**
 * Calculate total weight including packaging
 * @param {Array} items - Cart items with weight and quantity
 * @returns {Object} Weight breakdown
 */
export const calculateTotalWeight = (items) => {
  // Calculate total product weight
  const totalWeight = items.reduce((sum, item) => {
    const weight = item.weight || 0.1; // Default 100g if not specified
    return sum + weight * item.quantity;
  }, 0);

  // Calculate total number of items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Add packaging weight based on number of items
  let packagingWeight = 0;
  if (totalItems <= 6) {
    packagingWeight = 0.025; // 25g for up to 6 items
  } else if (totalItems <= 12) {
    packagingWeight = 0.05; // 50g for 7-12 items
  } else if (totalItems <= 24) {
    packagingWeight = 0.1; // 100g for 13-24 items
  } else {
    packagingWeight = 0.15; // 150g for 25+ items
  }

  const totalWeightWithPackaging = totalWeight + packagingWeight;

  return {
    productWeight: totalWeight,
    packagingWeight,
    totalWeight: totalWeightWithPackaging,
    totalItems,
  };
};

/**
 * Get UK domestic shipping rates based on Royal Mail pricing
 * @param {number} weight - Total weight in kg
 * @returns {Array} Shipping options
 */
export const getUKShippingRates = (weight) => {
  if (weight <= 2) {
    // Small parcel (up to 2kg)
    return [
      {
        id: "tracked-48",
        name: "Tracked 48",
        price: 3.55,
        estimatedDays: "2-3 business days",
        description: "Two day delivery aim",
      },
      {
        id: "tracked-24",
        name: "Tracked 24",
        price: 4.45,
        estimatedDays: "1 business day",
        description: "Next day delivery aim",
      },
      {
        id: "tracked-24-signature",
        name: "Tracked 24 with Signature",
        price: 5.95,
        estimatedDays: "1 business day",
        description: "Next day delivery aim with signature",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 10) {
    // Medium parcel (2-10kg)
    return [
      {
        id: "tracked-48-signature",
        name: "Tracked 48 with Signature",
        price: 8.55,
        estimatedDays: "2-3 business days",
        description: "Two day delivery aim with signature",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else {
    // Over 10kg - custom quote needed
    return [
      {
        id: "custom-quote",
        name: "Custom Shipping Quote",
        price: 15.99,
        estimatedDays: "Contact us",
        description: "Please contact us for a custom shipping quote",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  }
};

/**
 * Get EU shipping rates based on Royal Mail International Standard
 * @param {number} weight - Total weight in kg
 * @returns {Array} Shipping options
 */
export const getEUShippingRates = (weight) => {
  if (weight <= 0.1) {
    return [
      {
        id: "eu-standard-100g",
        name: "International Standard",
        price: 6.3,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 100g)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 0.25) {
    return [
      {
        id: "eu-standard-250g",
        name: "International Standard",
        price: 8.5,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 250g)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 0.5) {
    return [
      {
        id: "eu-standard-500g",
        name: "International Standard",
        price: 9.95,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 500g)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 0.75) {
    return [
      {
        id: "eu-standard-750g",
        name: "International Standard",
        price: 11.25,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 750g)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 1.0) {
    return [
      {
        id: "eu-standard-1kg",
        name: "International Standard",
        price: 12.2,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 1kg)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 1.25) {
    return [
      {
        id: "eu-standard-1.25kg",
        name: "International Standard",
        price: 12.9,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 1.25kg)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 1.5) {
    return [
      {
        id: "eu-standard-1.5kg",
        name: "International Standard",
        price: 14.6,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 1.5kg)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 1.75) {
    return [
      {
        id: "eu-standard-1.75kg",
        name: "International Standard",
        price: 16.3,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 1.75kg)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else if (weight <= 2.0) {
    return [
      {
        id: "eu-standard-2kg",
        name: "International Standard",
        price: 18.0,
        estimatedDays: "3-5 business days",
        description: "Europe delivery (up to 2kg)",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  } else {
    return [
      {
        id: "custom-quote-eu",
        name: "Custom Shipping Quote",
        price: 25.0,
        estimatedDays: "Contact us",
        description: "Please contact us for a custom shipping quote",
      },
      {
        id: "collect-in-person",
        name: "Collect in Person",
        price: 0,
        estimatedDays: "Ready for collection",
        description: "Collect from 12 Blackfriars Rd, PE13 1AT",
        isCollection: true,
      },
    ];
  }
};

/**
 * Calculate shipping options based on items, destination, and currency
 * @param {Object} params - Calculation parameters
 * @param {Array} params.items - Cart items with weight
 * @param {string} params.currency - Selected currency (GBP or EUR)
 * @param {string} params.countryCode - Destination country code
 * @returns {Object} Shipping calculation result
 */
export const calculateShippingOptions = ({
  items,
  currency,
  countryCode = "GB",
}) => {
  const weightData = calculateTotalWeight(items);
  const { totalWeight } = weightData;

  // Determine shipping region based on currency or country
  const isEUShipping =
    currency === "EUR" || (countryCode !== "GB" && countryCode !== "US");

  let options;
  if (countryCode === "GB" && !isEUShipping) {
    options = getUKShippingRates(totalWeight);
  } else if (isEUShipping) {
    options = getEUShippingRates(totalWeight);
  } else {
    // International (non-EU)
    options = [
      {
        id: "international-standard",
        name: "International Standard",
        price: 15.99,
        estimatedDays: "7-14 business days",
        description: "Standard international delivery",
      },
      {
        id: "international-tracked",
        name: "International Tracked",
        price: 22.99,
        estimatedDays: "5-10 business days",
        description: "Tracked international delivery",
      },
    ];
  }

  return {
    options,
    weight: weightData.totalWeight,
    productWeight: weightData.productWeight,
    packagingWeight: weightData.packagingWeight,
    calculation: "weight-based",
  };
};
