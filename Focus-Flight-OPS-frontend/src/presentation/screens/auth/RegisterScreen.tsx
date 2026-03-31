import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useAuthStore } from '../../store/slices/authSlice';
import { ThemedInput } from '../../components/common/ThemedInput';
import { ThemedButton } from '../../components/common/ThemedButton';

export function RegisterScreen({ navigation }: any) {
  const s = useStyles(createStyles);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    documentType: 'CC',
    documentNumber: '',
  });
  const { register, isLoading, error, clearError } = useAuthStore();

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = form.email && form.password.length >= 6 && form.firstName && form.lastName && form.phone && form.documentNumber;

  const handleRegister = async () => {
    if (!isValid) return;
    try {
      await register(form);
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Crear Cuenta</Text>
        <Text style={s.subtitle}>Registro de piloto profesional UAS</Text>

        {error && (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={s.errorDismiss}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        <ThemedInput
          label="NOMBRE"
          value={form.firstName}
          onChangeText={(v) => updateField('firstName', v)}
          autoCapitalize="words"
        />
        <ThemedInput
          label="APELLIDO"
          value={form.lastName}
          onChangeText={(v) => updateField('lastName', v)}
          autoCapitalize="words"
        />
        <ThemedInput
          label="EMAIL"
          value={form.email}
          onChangeText={(v) => updateField('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ThemedInput
          label="TELEFONO"
          value={form.phone}
          onChangeText={(v) => updateField('phone', v)}
          keyboardType="phone-pad"
          placeholder="+57 300 123 4567"
        />

        <Text style={s.label}>TIPO DE DOCUMENTO</Text>
        <View style={s.docTypeRow}>
          {['CC', 'CE', 'PASSPORT'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[s.docTypeBtn, form.documentType === type && s.docTypeBtnActive]}
              onPress={() => updateField('documentType', type)}
            >
              <Text style={[s.docTypeBtnText, form.documentType === type && s.docTypeBtnTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ThemedInput
          label="NUMERO DE DOCUMENTO"
          value={form.documentNumber}
          onChangeText={(v) => updateField('documentNumber', v)}
          keyboardType="numeric"
        />
        <ThemedInput
          label="CONTRASENA"
          value={form.password}
          onChangeText={(v) => updateField('password', v)}
          secureTextEntry
          placeholder="Min. 6 caracteres"
        />

        <ThemedButton
          title="REGISTRARSE"
          onPress={handleRegister}
          variant="danger"
          disabled={!isValid}
          loading={isLoading}
          haptic="medium"
          style={{ marginTop: 12 }}
        />

        <TouchableOpacity style={s.loginLink} onPress={() => navigation.goBack()}>
          <Text style={s.loginText}>
            Ya tienes cuenta? <Text style={s.loginTextBold}>Inicia sesion</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = ({ colors, spacing, borderRadius }: StyleTheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface0,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: 60,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700' as const,
    marginTop: 20,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  errorBanner: {
    backgroundColor: 'rgba(255,82,82,0.15)',
    borderRadius: borderRadius.md,
    padding: 12,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.sm,
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
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
    marginTop: 14,
    letterSpacing: 1,
  },
  docTypeRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: spacing.sm,
  },
  docTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docTypeBtnActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  docTypeBtnText: {
    color: colors.textSecondary,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  docTypeBtnTextActive: {
    color: '#FFFFFF',
  },
  loginLink: {
    alignItems: 'center' as const,
    marginTop: 20,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginTextBold: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
});
