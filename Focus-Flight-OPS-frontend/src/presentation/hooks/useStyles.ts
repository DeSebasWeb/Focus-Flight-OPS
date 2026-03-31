import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, borderRadius, touchTarget, layout } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';

export interface StyleTheme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  touchTarget: typeof touchTarget;
  layout: typeof layout;
  isDark: boolean;
}

export function useStyles<T extends Record<string, any>>(
  factory: (theme: StyleTheme) => T,
): { [K in keyof T]: any } {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => {
      const raw = factory({ colors, typography, spacing, borderRadius, touchTarget, layout, isDark });
      return StyleSheet.create(raw as any) as any;
    },
    [colors, isDark],
  );
}
