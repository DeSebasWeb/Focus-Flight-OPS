/**
 * Spacing and layout constants
 *
 * Minimum touch targets:
 * - Standard: 48x48dp (Material) / 44x44pt (Apple HIG)
 * - Emergency button: 64x64dp minimum
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const touchTarget = {
  minimum: 48,
  emergency: 64,
  checklistItem: 56,
} as const;

export const layout = {
  screenPaddingH: spacing.md,
  screenPaddingV: spacing.lg,
  cardPadding: spacing.md,
  sectionGap: spacing.lg,
  itemGap: spacing.sm,
} as const;
