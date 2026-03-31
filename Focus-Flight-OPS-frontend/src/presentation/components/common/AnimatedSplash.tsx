import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles, StyleTheme } from '../../hooks/useStyles';

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const s = useStyles(createStyles);
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Icon bounces in
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      // Icon subtle rotation
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Title fades in + slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      // Progress bar fills
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(onFinish, 200);
    });
  }, []);

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <View style={s.container}>
      <Animated.View style={{ transform: [{ scale: iconScale }, { rotate: spin }] }}>
        <Ionicons name="airplane" size={64} color="#FF5252" />
      </Animated.View>

      <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }}>
        <Text style={s.title}>FOCUS</Text>
        <Text style={s.subtitle}>FLIGHT OPS</Text>
      </Animated.View>

      <Animated.View style={{ opacity: subtitleOpacity }}>
        <Text style={s.tagline}>Operaciones de drones seguras y legales</Text>
      </Animated.View>

      <View style={s.progressTrack}>
        <Animated.View
          style={[
            s.progressFill,
            {
              width: progressWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={s.version}>v1.0.0</Text>
    </View>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
  },
  title: {
    color: colors.danger,
    fontSize: 42,
    fontWeight: '900' as const,
    letterSpacing: 6,
    textAlign: 'center' as const,
    marginTop: 20,
  },
  subtitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 8,
    textAlign: 'center' as const,
    marginTop: 4,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center' as const,
    marginTop: 16,
  },
  progressTrack: {
    width: 120,
    height: 3,
    backgroundColor: colors.surface3,
    borderRadius: 2,
    marginTop: 32,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: colors.danger,
    borderRadius: 2,
  },
  version: {
    color: colors.textDisabled,
    fontSize: 11,
    position: 'absolute' as const,
    bottom: 40,
  },
});
