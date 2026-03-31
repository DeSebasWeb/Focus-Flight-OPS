import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, darkColors, lightColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, touchTarget, layout } from './spacing';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  touchTarget: typeof touchTarget;
  layout: typeof layout;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  touchTarget,
  layout,
  mode: 'dark',
  isDark: true,
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('dark');

  const isDark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';
  const themeColors = isDark ? darkColors : lightColors;

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({
      colors: themeColors,
      typography,
      spacing,
      borderRadius,
      touchTarget,
      layout,
      mode,
      isDark,
      setMode,
      toggleTheme,
    }),
    [themeColors, mode, isDark, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
