import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useAuthStore } from '../../store/slices/authSlice';
import { ThemedInput } from '../../components/common/ThemedInput';
import { ThemedButton } from '../../components/common/ThemedButton';

export function LoginScreen({ navigation }: any) {
  const s = useStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await login(email.trim(), password);
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.logo}>FOCUS</Text>
          <Text style={s.logoSub}>FLIGHT OPS</Text>
          <Text style={s.tagline}>Operaciones de drones seguras y legales</Text>
        </View>

        {error && (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={s.errorDismiss}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        <View>
          <ThemedInput
            label="EMAIL"
            value={email}
            onChangeText={setEmail}
            placeholder="piloto@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ThemedInput
            label="CONTRASENA"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 caracteres"
            secureTextEntry
          />

          <ThemedButton
            title="INICIAR SESION"
            onPress={handleLogin}
            variant="danger"
            disabled={!email || !password}
            loading={isLoading}
            haptic="medium"
          />

          <TouchableOpacity
            style={s.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={s.registerText}>
              No tienes cuenta? <Text style={s.registerTextBold}>Registrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = ({ colors, spacing }: StyleTheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface0,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  logo: {
    color: colors.danger,
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: 4,
  },
  logoSub: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 6,
    marginTop: 4,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
  errorBanner: {
    backgroundColor: 'rgba(255,82,82,0.15)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    flex: 1,
  },
  errorDismiss: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700' as const,
    marginLeft: 8,
  },
  registerLink: {
    alignItems: 'center' as const,
    marginTop: 20,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerTextBold: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
});
