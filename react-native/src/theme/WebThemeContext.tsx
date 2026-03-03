import React from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import {
  DEFAULT_PRICE_COLOR_STYLE,
  PRICE_COLOR_STYLE_PRESETS,
  isPriceColorStyle,
  type PriceColorStyle
} from '../constants/priceColorStyles';

export type ThemeMode = 'light' | 'dark' | 'system';
export type { PriceColorStyle } from '../constants/priceColorStyles';

export const LIGHT_MODE_BACKGROUND = '#EDEDF7';
export const DARK_MODE_BACKGROUND = '#1A1C21';
export const DARK_MODE_BORDER = '#36363B';
const THEME_MODE_STORAGE_KEY = 'gorani.web.themeMode';
const PRICE_COLOR_STYLE_STORAGE_KEY = 'gorani.web.priceColorStyle';

type ResolvedMode = 'light' | 'dark';

type ThemeColors = {
  pageBackground: string;
  topBarBackground: string;
  detailBackground: string;
  textPrimary: string;
  iconButtonBackground: string;
  menuBackground: string;
  menuBorder: string;
  menuHoverBackground: string;
  selectedTabBackground: string;
};

type TrendColors = {
  rise: string;
  fall: string;
};

type WebThemeContextValue = {
  themeMode: ThemeMode;
  resolvedMode: ResolvedMode;
  setThemeMode: (mode: ThemeMode) => void;
  priceColorStyle: PriceColorStyle;
  setPriceColorStyle: (style: PriceColorStyle) => void;
  colors: ThemeColors;
  trendColors: TrendColors;
};

const defaultColors: ThemeColors = {
  pageBackground: LIGHT_MODE_BACKGROUND,
  topBarBackground: LIGHT_MODE_BACKGROUND,
  detailBackground: '#ffffff',
  textPrimary: '#334155',
  iconButtonBackground: '#f1f5f9',
  menuBackground: '#ffffff',
  menuBorder: '#e2e8f0',
  menuHoverBackground: '#f8fafc',
  selectedTabBackground: '#0f172a'
};
const defaultTrendColors: TrendColors = PRICE_COLOR_STYLE_PRESETS[DEFAULT_PRICE_COLOR_STYLE];

const WebThemeContext = React.createContext<WebThemeContextValue>({
  themeMode: 'light',
  resolvedMode: 'light',
  setThemeMode: () => {},
  priceColorStyle: DEFAULT_PRICE_COLOR_STYLE,
  setPriceColorStyle: () => {},
  colors: defaultColors,
  trendColors: defaultTrendColors
});

function isThemeMode(value: string): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const savedValue = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (savedValue && isThemeMode(savedValue)) {
      return savedValue;
    }
  } catch {
    return 'light';
  }

  return 'light';
}

function readInitialPriceColorStyle(): PriceColorStyle {
  if (typeof window === 'undefined') {
    return DEFAULT_PRICE_COLOR_STYLE;
  }

  try {
    const savedValue = window.localStorage.getItem(PRICE_COLOR_STYLE_STORAGE_KEY);
    if (savedValue && isPriceColorStyle(savedValue)) {
      return savedValue;
    }
  } catch {
    return DEFAULT_PRICE_COLOR_STYLE;
  }

  return DEFAULT_PRICE_COLOR_STYLE;
}

function resolveMode(themeMode: ThemeMode, scheme: ColorSchemeName): ResolvedMode {
  if (themeMode === 'system') {
    return scheme === 'dark' ? 'dark' : 'light';
  }

  return themeMode;
}

function buildColors(mode: ResolvedMode): ThemeColors {
  if (mode === 'dark') {
    return {
      pageBackground: DARK_MODE_BACKGROUND,
      topBarBackground: DARK_MODE_BACKGROUND,
      detailBackground: '#212429',
      textPrimary: '#e2e8f0',
      iconButtonBackground: '#2c313b',
      menuBackground: '#20242c',
      menuBorder: DARK_MODE_BORDER,
      menuHoverBackground: '#2c313b',
      selectedTabBackground: '#334155'
    };
  }

  return defaultColors;
}

function buildTrendColors(style: PriceColorStyle): TrendColors {
  return PRICE_COLOR_STYLE_PRESETS[style];
}

export function WebThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(readInitialThemeMode);
  const [priceColorStyle, setPriceColorStyle] =
    React.useState<PriceColorStyle>(readInitialPriceColorStyle);
  const [systemScheme, setSystemScheme] = React.useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  React.useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
    } catch {
      // ignore storage failures and keep in-memory state
    }
  }, [themeMode]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(PRICE_COLOR_STYLE_STORAGE_KEY, priceColorStyle);
    } catch {
      // ignore storage failures and keep in-memory state
    }
  }, [priceColorStyle]);

  const resolvedMode = React.useMemo(
    () => resolveMode(themeMode, systemScheme),
    [themeMode, systemScheme]
  );

  const colors = React.useMemo(() => buildColors(resolvedMode), [resolvedMode]);
  const trendColors = React.useMemo(() => buildTrendColors(priceColorStyle), [priceColorStyle]);

  const value = React.useMemo(
    () => ({
      themeMode,
      resolvedMode,
      setThemeMode,
      priceColorStyle,
      setPriceColorStyle,
      colors,
      trendColors
    }),
    [themeMode, resolvedMode, priceColorStyle, colors, trendColors]
  );

  return <WebThemeContext.Provider value={value}>{children}</WebThemeContext.Provider>;
}

export function useWebTheme() {
  return React.useContext(WebThemeContext);
}
