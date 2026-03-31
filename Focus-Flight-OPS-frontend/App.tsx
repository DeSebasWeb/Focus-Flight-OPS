import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { OfflineBanner } from './src/presentation/components/common/OfflineBanner';
import { useAuthStore } from './src/presentation/store/slices/authSlice';
import { ThemeProvider, useTheme } from './src/presentation/theme/ThemeContext';
import { setupNotifications } from './src/infrastructure/device/NotificationService';
import { offlineStorage } from './src/infrastructure/persistence/OfflineStorage';

function AppContent() {
  const { colors, isDark } = useTheme();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    offlineStorage.init().catch(() => {});
    checkAuth();
    setupNotifications().catch(() => {});
  }, []);

  const navTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.surface0,
      card: colors.surface1,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <OfflineBanner />
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
