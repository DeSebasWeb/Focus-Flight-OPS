import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { useFleetStore } from '../../store/slices/fleetSlice';
import apiClient from '../../../services/api/apiClient';

interface Manufacturer {
  id: string;
  name: string;
}

interface DroneModel {
  id: string;
  name: string;
  manufacturerId: string;
  defaultMtowGrams: number | null;
  defaultNumRotors: number | null;
  category: string | null;
}

export function RegisterDroneScreen({ navigation }: any) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const { addDrone } = useFleetStore();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<DroneModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<DroneModel | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [mtowGrams, setMtowGrams] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');

  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    try {
      // Fetch manufacturers and models from a custom endpoint or seed data
      const allModels = await apiClient.get('/drones/models') as any;
      // Group by manufacturer
      const mfrs = new Map<string, Manufacturer>();
      const mdls: DroneModel[] = [];

      if (Array.isArray(allModels)) {
        allModels.forEach((m: any) => {
          if (m.manufacturer && !mfrs.has(m.manufacturer.id)) {
            mfrs.set(m.manufacturer.id, m.manufacturer);
          }
          mdls.push(m);
        });
        setManufacturers(Array.from(mfrs.values()));
        setModels(mdls);
      }
    } catch {
      // Fallback: use hardcoded common manufacturers
      setManufacturers([
        { id: 'dji', name: 'DJI' },
        { id: 'autel', name: 'Autel Robotics' },
        { id: 'skydio', name: 'Skydio' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter((m) => m.manufacturerId === selectedManufacturer);

  const handleSelectModel = (model: DroneModel) => {
    setSelectedModel(model);
    if (model.defaultMtowGrams) {
      setMtowGrams(model.defaultMtowGrams.toString());
    }
  };

  const isValid = selectedModel && serialNumber.trim().length > 0 && mtowGrams.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !selectedModel) return;
    setSubmitting(true);
    try {
      await addDrone({
        modelId: selectedModel.id,
        serialNumber: serialNumber.trim(),
        registrationNumber: registrationNumber.trim() || undefined,
        mtowGrams: parseInt(mtowGrams, 10),
        firmwareVersion: firmwareVersion.trim() || undefined,
      });
      Alert.alert('Drone Registrado', 'El drone se ha registrado exitosamente en tu flota.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo registrar el drone');
    } finally {
      setSubmitting(false);
    }
  };

  const requiresRegistration = parseInt(mtowGrams || '0', 10) >= 200;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Ionicons name="airplane" size={32} color={colors.danger} />
        <Text style={s.title}>Registrar Drone</Text>
        <Text style={s.subtitle}>Agrega una aeronave a tu flota</Text>
      </View>

      {/* Manufacturer Selection */}
      <Text style={s.sectionTitle}>Fabricante</Text>
      <View style={s.chipRow}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          manufacturers.map((mfr) => (
            <TouchableOpacity
              key={mfr.id}
              style={[s.chip, selectedManufacturer === mfr.id && s.chipActive]}
              onPress={() => {
                setSelectedManufacturer(mfr.id);
                setSelectedModel(null);
              }}
            >
              <Text style={[s.chipText, selectedManufacturer === mfr.id && s.chipTextActive]}>
                {mfr.name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Model Selection */}
      {selectedManufacturer && filteredModels.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Modelo</Text>
          <View style={s.chipRow}>
            {filteredModels.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[s.chip, selectedModel?.id === model.id && s.chipActive]}
                onPress={() => handleSelectModel(model)}
              >
                <Text style={[s.chipText, selectedModel?.id === model.id && s.chipTextActive]}>
                  {model.name}
                </Text>
                {model.category && (
                  <Text style={s.chipSub}>{model.category}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Serial Number */}
      <Text style={s.sectionTitle}>Numero de Serie *</Text>
      <TextInput
        style={s.input}
        value={serialNumber}
        onChangeText={setSerialNumber}
        placeholder="Ej: 1ZNBJ1D00C002F"
        placeholderTextColor={colors.textDisabled}
        autoCapitalize="characters"
      />

      {/* MTOW */}
      <Text style={s.sectionTitle}>Peso Maximo de Despegue (MTOW) *</Text>
      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={mtowGrams}
          onChangeText={setMtowGrams}
          placeholder="Ej: 1050"
          placeholderTextColor={colors.textDisabled}
          keyboardType="numeric"
        />
        <Text style={s.inputUnit}>gramos</Text>
      </View>
      {requiresRegistration && (
        <View style={s.warningBanner}>
          <Ionicons name="warning" size={16} color={colors.warning} />
          <Text style={s.warningText}>
            Drone de {mtowGrams}g ({'>'}=200g) requiere matricula Aerocivil
          </Text>
        </View>
      )}

      {/* Registration Number */}
      <Text style={s.sectionTitle}>
        Matricula Aerocivil {requiresRegistration ? '*' : '(opcional)'}
      </Text>
      <TextInput
        style={s.input}
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
        placeholder="Ej: HK-4521"
        placeholderTextColor={colors.textDisabled}
        autoCapitalize="characters"
      />

      {/* Firmware */}
      <Text style={s.sectionTitle}>Version de Firmware (opcional)</Text>
      <TextInput
        style={s.input}
        value={firmwareVersion}
        onChangeText={setFirmwareVersion}
        placeholder="Ej: v01.00.06.09"
        placeholderTextColor={colors.textDisabled}
      />

      {/* Summary Card */}
      {selectedModel && (
        <Card style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumen</Text>
          <Text style={s.summaryItem}>Modelo: {selectedModel.name}</Text>
          <Text style={s.summaryItem}>Serial: {serialNumber || '--'}</Text>
          <Text style={s.summaryItem}>MTOW: {mtowGrams || '--'}g</Text>
          {registrationNumber ? (
            <Text style={s.summaryItem}>Matricula: {registrationNumber}</Text>
          ) : null}
        </Card>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[s.submitBtn, !isValid && s.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !isValid}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={s.submitText}>Registrar Drone</Text>
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
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
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
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 20,
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
    fontWeight: '500' as const,
  },
  chipTextActive: {
    color: '#FFF',
  },
  chipSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 2,
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
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  inputUnit: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  warningBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,215,64,0.1)',
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    color: colors.warning,
    fontSize: 12,
    flex: 1,
  },
  summaryCard: {
    marginTop: 20,
    backgroundColor: colors.surface2,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: spacing.sm,
  },
  summaryItem: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  submitBtn: {
    backgroundColor: colors.danger,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  submitBtnDisabled: {
    backgroundColor: colors.surface3,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
