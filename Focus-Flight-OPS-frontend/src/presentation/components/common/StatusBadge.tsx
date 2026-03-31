import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type BadgeVariant = 'safe' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  small?: boolean;
}

export function StatusBadge({ label, variant, small }: StatusBadgeProps) {
  const { colors } = useTheme();

  const variants: Record<BadgeVariant, { bg: string; text: string }> = {
    safe: { bg: colors.success, text: colors.textOnPrimary },
    warning: { bg: colors.warning, text: colors.textOnPrimary },
    danger: { bg: colors.danger, text: '#FFFFFF' },
    info: { bg: colors.info, text: colors.textOnPrimary },
    neutral: { bg: colors.surface3, text: colors.textPrimary },
  };

  const c = variants[variant];
  return (
    <View style={[s.badge, { backgroundColor: c.bg }, small && s.small]}>
      <Text style={[s.text, { color: c.text }, small && s.smallText]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  small: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  text: { fontSize: 13, fontWeight: '600' },
  smallText: { fontSize: 11 },
});
