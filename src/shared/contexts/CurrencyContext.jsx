import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

// Supported currencies
export const CURRENCIES = {
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
  },
};

export function CurrencyProvider({ children }) {
  // Get stored currency from localStorage or default to GBP
  const [currency, setCurrency] = useState(() => {
    const stored = localStorage.getItem("selectedCurrency");
    return stored && CURRENCIES[stored] ? stored : "GBP";
  });

  // Store selected currency when it changes
  useEffect(() => {
    localStorage.setItem("selectedCurrency", currency);
  }, [currency]);

  // Get price for current currency from product object
  const getPrice = (product) => {
    if (!product) return 0;
    
    // If EUR is selected and product has EUR price, use it
    if (currency === "EUR" && product.priceEUR != null) {
      return product.priceEUR;
    }
    
    // Otherwise use GBP price
    return product.price || 0;
  };

  // Get original price for current currency from product object
  const getOriginalPrice = (product) => {
    if (!product) return null;
    
    // If EUR is selected and product has EUR original price, use it
    if (currency === "EUR" && product.originalPriceEUR != null) {
      return product.originalPriceEUR;
    }
    
    // Otherwise use GBP original price
    return product.originalPrice;
  };

  // Format price with currency symbol (for displaying raw amounts)
  const formatPrice = (amount) => {
    if (!amount || isNaN(amount)) return `${CURRENCIES[currency].symbol}0.00`;
    const currencyInfo = CURRENCIES[currency];
    return `${currencyInfo.symbol}${Number(amount).toFixed(2)}`;
  };

  const value = {
    currency,
    setCurrency,
    currencyInfo: CURRENCIES[currency],
    getPrice,
    getOriginalPrice,
    formatPrice,
    allCurrencies: CURRENCIES,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Custom hook to use currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
