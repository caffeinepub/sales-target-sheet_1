import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type CurrencySymbol = "₹" | "$" | "€" | "£" | "¥";
export type ColorTheme =
  | "blue"
  | "green"
  | "red"
  | "purple"
  | "orange"
  | "pink"
  | "indigo"
  | "teal"
  | "gold";

interface Settings {
  currencySymbol: CurrencySymbol;
  colorTheme: ColorTheme;
  setCurrencySymbol: (s: CurrencySymbol) => void;
  setColorTheme: (t: ColorTheme) => void;
}

const SettingsContext = createContext<Settings>({
  currencySymbol: "₹",
  colorTheme: "blue",
  setCurrencySymbol: () => {},
  setColorTheme: () => {},
});

const VALID_THEMES: ColorTheme[] = [
  "blue",
  "green",
  "red",
  "purple",
  "orange",
  "pink",
  "indigo",
  "teal",
  "gold",
];

function storageKeyCurrency(mobile: string): string {
  return `settings_currency_${mobile}`;
}

function storageKeyTheme(mobile: string): string {
  return `settings_theme_${mobile}`;
}

function loadCurrency(mobile: string): CurrencySymbol {
  try {
    const raw = localStorage.getItem(storageKeyCurrency(mobile));
    if (raw && ["₹", "$", "€", "£", "¥"].includes(raw))
      return raw as CurrencySymbol;
  } catch {}
  return "₹";
}

function loadTheme(mobile: string): ColorTheme {
  try {
    const raw = localStorage.getItem(storageKeyTheme(mobile));
    if (raw && VALID_THEMES.includes(raw as ColorTheme))
      return raw as ColorTheme;
  } catch {}
  return "blue";
}

interface SettingsProviderProps {
  mobile: string;
  children: ReactNode;
}

export function SettingsProvider({ mobile, children }: SettingsProviderProps) {
  const [currencySymbol, setCurrencySymbolState] = useState<CurrencySymbol>(
    () => loadCurrency(mobile),
  );
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() =>
    loadTheme(mobile),
  );

  // Re-initialize when mobile changes
  useEffect(() => {
    setCurrencySymbolState(loadCurrency(mobile));
    setColorThemeState(loadTheme(mobile));
  }, [mobile]);

  const setCurrencySymbol = (s: CurrencySymbol) => {
    setCurrencySymbolState(s);
    try {
      localStorage.setItem(storageKeyCurrency(mobile), s);
    } catch {}
  };

  const setColorTheme = (t: ColorTheme) => {
    setColorThemeState(t);
    try {
      localStorage.setItem(storageKeyTheme(mobile), t);
    } catch {}
  };

  // Apply data-theme attribute to document root for CSS variable overrides
  useEffect(() => {
    if (colorTheme === "blue") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", colorTheme);
    }
  }, [colorTheme]);

  return (
    <SettingsContext.Provider
      value={{ currencySymbol, colorTheme, setCurrencySymbol, setColorTheme }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  return useContext(SettingsContext);
}
