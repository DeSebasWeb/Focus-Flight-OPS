/**
 * Dark High-Contrast Theme
 *
 * Consolidated theme object for Focus Flight Ops.
 * WCAG AAA compliant for all critical text/background combinations.
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, touchTarget, layout } from './spacing';

export const darkHighContrastTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  touchTarget,
  layout,

  components: {
    screen: {
      backgroundColor: colors.surface0,
      paddingHorizontal: layout.screenPaddingH,
      paddingVertical: layout.screenPaddingV,
    },
    card: {
      backgroundColor: colors.surface1,
      borderRadius: borderRadius.lg,
      padding: layout.cardPadding,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checklistItem: {
      minHeight: touchTarget.checklistItem,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    checklistItemCritical: {
      borderLeftWidth: 3,
      borderLeftColor: colors.danger,
    },
    emergencyButton: {
      width: touchTarget.emergency,
      height: touchTarget.emergency,
      borderRadius: borderRadius.full,
      backgroundColor: colors.emergencyBg,
      borderWidth: 2,
      borderColor: colors.emergencyBorder,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      elevation: 8,
      shadowColor: colors.emergencyBg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    statusBadge: {
      safe: { backgroundColor: colors.success, color: colors.textOnPrimary },
      warning: { backgroundColor: colors.warning, color: colors.textOnPrimary },
      danger: { backgroundColor: colors.danger, color: colors.emergencyText },
      info: { backgroundColor: colors.info, color: colors.textOnPrimary },
    },
  },
} as const;

export type Theme = typeof darkHighContrastTheme;
