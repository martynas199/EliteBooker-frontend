/**
 * Format currency with proper symbol based on currency code
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (GBP, EUR, USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = "GBP") {
  const currencyUpper = (currency || "GBP").toUpperCase();

  const symbols = {
    GBP: "£",
    EUR: "€",
    USD: "$",
  };

  const symbol = symbols[currencyUpper] || currencyUpper + " ";
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code (GBP, EUR, USD)
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency = "GBP") {
  const currencyUpper = (currency || "GBP").toUpperCase();

  const symbols = {
    GBP: "£",
    EUR: "€",
    USD: "$",
  };

  return symbols[currencyUpper] || currencyUpper + " ";
}
