import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTheme } from '../../theme/ThemeContext';

export function OfflineBanner() {
  const { isOnline, isLoading } = useNetworkStatus();
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-80)).current;

  const shouldShow = !isOnline && !isLoading;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: shouldShow ? 0 : -80,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shouldShow, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingTop: insets.top + 4,
          backgroundColor: '#F59E0B',
        },
      ]}
      pointerEvents={shouldShow ? 'auto' : 'none'}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={18} color="#1F2937" />
        <Text
          style={[
            styles.text,
            {
              fontFamily: typography.body.fontFamily,
              fontSize: typography.caption.fontSize,
            },
          ]}
        >
          Sin conexion - Modo offline
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#1F2937',
    fontWeight: '600',
  },
});
