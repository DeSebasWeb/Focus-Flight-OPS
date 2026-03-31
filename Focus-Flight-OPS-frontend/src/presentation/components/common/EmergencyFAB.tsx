import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, Animated } from 'react-native';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useHaptic } from '../../hooks/useHaptic';

interface EmergencyFABProps {
  onPress: () => void;
  isActive?: boolean;
}

export function EmergencyFAB({ onPress, isActive }: EmergencyFABProps) {
  const s = useStyles(createStyles);
  const haptic = useHaptic();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const handlePress = () => {
    haptic.heavy();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[s.fab, isActive && s.fabActive]}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityLabel="Boton de emergencia"
        accessibilityRole="button"
      >
        <Text style={s.icon}>!</Text>
        <Text style={s.label}>SOS</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  fab: {
    position: 'absolute' as const,
    bottom: 90,
    right: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
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
    zIndex: 1000,
  },
  fabActive: {
    backgroundColor: '#FF1744',
    borderColor: '#FFFFFF',
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900' as const,
    marginTop: -2,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
});
