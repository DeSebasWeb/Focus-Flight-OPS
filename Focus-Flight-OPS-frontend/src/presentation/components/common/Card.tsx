import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: ReactNode;
  title?: string;
  onPress?: () => void;
  style?: any;
  danger?: boolean;
}

export function Card({ children, title, onPress, style, danger }: CardProps) {
  const { colors } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[
        s.card,
        { backgroundColor: colors.surface1, borderColor: danger ? colors.danger : colors.border },
        danger && { borderWidth: 1.5 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {title && <Text style={[s.title, { color: colors.textPrimary }]}>{title}</Text>}
      {children}
    </Wrapper>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
});
