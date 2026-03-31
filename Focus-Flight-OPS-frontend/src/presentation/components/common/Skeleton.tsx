import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surface3,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: any }) {
  const { colors } = useTheme();

  return (
    <View style={[cardStyles.container, { backgroundColor: colors.surface1, borderColor: colors.border }, style]}>
      <Skeleton width="60%" height={20} borderRadius={4} />
      <View style={cardStyles.gap} />
      <Skeleton width="100%" height={14} borderRadius={4} />
      <View style={cardStyles.gapSm} />
      <Skeleton width="80%" height={14} borderRadius={4} />
      <View style={cardStyles.gap} />
      <View style={cardStyles.row}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={60} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  gap: { height: 12 },
  gapSm: { height: 6 },
  row: { flexDirection: 'row' },
});
