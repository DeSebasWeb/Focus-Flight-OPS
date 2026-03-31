import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useHaptic } from '../../hooks/useHaptic';
import type { ThemeColors } from '../../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'emergency' | 'ghost';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  haptic = 'medium',
  style,
  fullWidth = true,
}: ThemedButtonProps) {
  const s = useStyles(createStyles);
  const haptics = useHaptic();

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic !== 'none') haptics[haptic]();
    onPress();
  };

  const buttonStyle = [
    s.base,
    s[variant],
    fullWidth && s.fullWidth,
    (disabled || loading) && s.disabled,
    style,
  ];

  const textStyle = [
    s.text,
    variant === 'ghost' && s.ghostText,
    variant === 'secondary' && s.secondaryText,
    (disabled || loading) && s.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? s.ghostText.color : '#FFFFFF'} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

function getVariantBg(colors: ThemeColors, variant: ButtonVariant): string {
  switch (variant) {
    case 'primary': return colors.primary;
    case 'secondary': return colors.surface3;
    case 'danger': return colors.danger;
    case 'emergency': return colors.emergencyBg;
    case 'ghost': return colors.transparent;
  }
}

const createStyles = ({ colors, typography, spacing, borderRadius, touchTarget }: StyleTheme) => ({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: touchTarget.minimum,
  },
  fullWidth: {
    width: '100%' as const,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  emergency: {
    backgroundColor: colors.emergencyBg,
    borderWidth: 2,
    borderColor: colors.emergencyBorder,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  ghostText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
