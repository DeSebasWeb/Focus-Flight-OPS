import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { pilotApi } from '../../../services/api/pilotApi';
import { useAuthStore } from '../../store/slices/authSlice';

export function CreatePilotProfileScreen({ navigation }: any) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const { checkAuth } = useAuthStore();
  const [licenseType, setLicenseType] = useState('OPEN');
  const [uaeacNumber, setUaeacNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await pilotApi.createProfile({
        licenseType,
        uaeacPilotNumber: uaeacNumber.trim() || undefined,
        emergencyContactName: emergencyName.trim() || undefined,
        emergencyContactPhone: emergencyPhone.trim() || undefined,
      });
      await checkAuth(); // Refresh auth state to get pilotId
      Alert.alert('Perfil Creado', 'Tu perfil de piloto ha sido creado exitosamente.', [
        { text: 'Continuar', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear el perfil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View style={s.iconCircle}>
          <Ionicons name="person-add" size={32} color="#FFF" />
        </View>
        <Text style={s.title}>Perfil de Piloto UAS</Text>
        <Text style={s.subtitle}>Configure su perfil para operar drones en Colombia</Text>
      </View>

      <Text style={s.sectionTitle}>Tipo de Licencia *</Text>
      <View style={s.chipRow}>
        {['OPEN', 'SPECIFIC', 'CERTIFIED'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[s.chip, licenseType === type && s.chipActive]}
            onPress={() => setLicenseType(type)}
          >
            <Text style={[s.chipText, licenseType === type && s.chipTextActive]}>{type}</Text>
            <Text style={[s.chipDesc, licenseType === type && s.chipDescActive]}>
              {type === 'OPEN' ? '<25kg, VLOS' : type === 'SPECIFIC' ? 'Riesgo medio' : 'Riesgo alto'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionTitle}>Numero de Piloto UAEAC</Text>
      <TextInput
        style={s.input}
        value={uaeacNumber}
        onChangeText={setUaeacNumber}
        placeholder="Ej: UAS-2024-00156"
        placeholderTextColor={colors.textDisabled}
        autoCapitalize="characters"
      />

      <Text style={s.sectionTitle}>Contacto de Emergencia</Text>
      <TextInput
        style={s.input}
        value={emergencyName}
        onChangeText={setEmergencyName}
        placeholder="Nombre completo"
        placeholderTextColor={colors.textDisabled}
      />
      <TextInput
        style={[s.input, { marginTop: 8 }]}
        value={emergencyPhone}
        onChangeText={setEmergencyPhone}
        placeholder="+57 300 123 4567"
        placeholderTextColor={colors.textDisabled}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={s.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={s.submitText}>Crear Perfil de Piloto</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = ({ colors, spacing, borderRadius }: StyleTheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface0,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.danger,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700' as const,
    marginTop: borderRadius.lg,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginTop: 20,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center' as const,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  chipTextActive: {
    color: '#FFF',
  },
  chipDesc: {
    color: colors.textDisabled,
    fontSize: 10,
    marginTop: 2,
  },
  chipDescActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  input: {
    backgroundColor: colors.surface1,
    borderRadius: 10,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtn: {
    backgroundColor: colors.danger,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
