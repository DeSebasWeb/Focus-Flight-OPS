import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ progress, label, showPercent = true }: ProgressBarProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, progress));
  const barColor = clamped === 100 ? colors.success : clamped >= 50 ? colors.warning : colors.danger;

  return (
    <View style={s.container}>
      {(label || showPercent) && (
        <View style={s.header}>
          {label && <Text style={s.label}>{label}</Text>}
          {showPercent && <Text style={s.percent}>{Math.round(clamped)}%</Text>}
        </View>
      )}
      <View style={s.track}>
        <View style={[s.fill, { width: `${clamped}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: { marginBottom: 8 },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 4,
  },
  label: { color: colors.textSecondary, fontSize: 13 },
  percent: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' as const },
  track: {
    height: 6,
    backgroundColor: colors.surface3,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  fill: {
    height: '100%' as const,
    borderRadius: 3,
  },
});
