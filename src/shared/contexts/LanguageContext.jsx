import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or default to EN
    return localStorage.getItem("adminLanguage") || "EN";
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem("adminLanguage", language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "EN" ? "LT" : "EN"));
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
