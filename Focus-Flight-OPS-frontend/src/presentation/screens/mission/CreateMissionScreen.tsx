import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { useFleetStore } from '../../store/slices/fleetSlice';
import { missionApi } from '../../../services/api/missionApi';
import apiClient from '../../../services/api/apiClient';

interface MissionPurpose {
  id: string;
  code: string;
  nameEs: string;
}

export function CreateMissionScreen({ navigation }: any) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const { drones, selectedDroneId } = useFleetStore();
  const selectedDrone = drones.find((d) => d.id === selectedDroneId);

  const [purposes, setPurposes] = useState<MissionPurpose[]>([]);
  const [name, setName] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [operationType, setOperationType] = useState('VLOS');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [plannedAltitude, setPlannedAltitude] = useState('100');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch {}

    try {
      const data = await apiClient.get('/missions/purposes') as any;
      if (Array.isArray(data)) setPurposes(data);
    } catch {
      setPurposes([
        { id: 'p1', code: 'PHOTOGRAPHY', nameEs: 'Fotografia Aerea' },
        { id: 'p2', code: 'VIDEOGRAPHY', nameEs: 'Produccion Audiovisual' },
        { id: 'p3', code: 'INSPECTION', nameEs: 'Inspeccion de Infraestructura' },
        { id: 'p4', code: 'MAPPING', nameEs: 'Mapeo y Topografia' },
        { id: 'p5', code: 'AGRICULTURE', nameEs: 'Agricultura de Precision' },
        { id: 'p6', code: 'TRAINING', nameEs: 'Entrenamiento' },
      ]);
    }
  };

  const isValid = name.trim() && selectedPurpose && selectedDroneId && location;

  const handleSubmit = async () => {
    if (!isValid || !location) return;
    setSubmitting(true);
    try {
      const mission = await missionApi.create({
        droneId: selectedDroneId,
        purposeId: selectedPurpose,
        name: name.trim(),
        plannedDate: new Date().toISOString().split('T')[0],
        plannedLocationLat: location.lat,
        plannedLocationLng: location.lng,
        plannedLocationName: locationName.trim() || undefined,
        plannedAltitudeM: parseInt(plannedAltitude, 10) || 100,
        operationType,
      });
      Alert.alert('Mision Creada', `La mision "${name}" ha sido creada.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la mision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Ionicons name="navigate-circle" size={36} color={colors.danger} />
        <Text style={s.title}>Nueva Mision</Text>
      </View>

      {/* Drone Info */}
      {selectedDrone ? (
        <Card>
          <View style={s.droneRow}>
            <Ionicons name="airplane" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.droneText}>
                {selectedDrone.manufacturer} {selectedDrone.modelName}
              </Text>
              <Text style={s.droneSerial}>S/N: {selectedDrone.serialNumber}</Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card danger>
          <Text style={s.noDrone}>Seleccione un drone en la pestana Flota</Text>
        </Card>
      )}

      {/* Mission Name */}
      <Text style={s.label}>NOMBRE DE LA MISION *</Text>
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Inspeccion Torre Norte"
        placeholderTextColor={colors.textDisabled}
      />

      {/* Purpose */}
      <Text style={s.label}>PROPOSITO *</Text>
      <View style={s.chipRow}>
        {purposes.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[s.chip, selectedPurpose === p.id && s.chipActive]}
            onPress={() => setSelectedPurpose(p.id)}
          >
            <Text style={[s.chipText, selectedPurpose === p.id && s.chipTextActive]}>
              {p.nameEs}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Operation Type */}
      <Text style={s.label}>TIPO DE OPERACION *</Text>
      <View style={s.chipRow}>
        {[
          { code: 'VLOS', label: 'VLOS', desc: 'Linea de vista' },
          { code: 'EVLOS', label: 'EVLOS', desc: 'Vista extendida' },
          { code: 'BVLOS', label: 'BVLOS', desc: 'Fuera de vista' },
        ].map((op) => (
          <TouchableOpacity
            key={op.code}
            style={[s.chip, operationType === op.code && s.chipActive]}
            onPress={() => setOperationType(op.code)}
          >
            <Text style={[s.chipText, operationType === op.code && s.chipTextActive]}>{op.label}</Text>
            <Text style={[s.chipDesc, operationType === op.code && { color: 'rgba(255,255,255,0.7)' }]}>{op.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location */}
      <Text style={s.label}>UBICACION</Text>
      <TextInput
        style={s.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="Nombre del lugar (opcional)"
        placeholderTextColor={colors.textDisabled}
      />
      {location && (
        <Text style={s.coords}>
          GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </Text>
      )}

      {/* Altitude */}
      <Text style={s.label}>ALTITUD PLANEADA (m AGL)</Text>
      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={plannedAltitude}
          onChangeText={setPlannedAltitude}
          keyboardType="numeric"
          placeholder="100"
          placeholderTextColor={colors.textDisabled}
        />
        <Text style={s.inputUnit}>m (max 123m)</Text>
      </View>

      <TouchableOpacity
        style={[s.submitBtn, !isValid && s.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !isValid}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="rocket" size={20} color="#FFF" />
            <Text style={s.submitText}>Crear Mision</Text>
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: borderRadius.lg,
    marginBottom: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  droneRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  droneText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  droneSerial: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  noDrone: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 6,
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
    fontSize: 13,
  },
  coords: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  chipRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
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
    fontSize: 13,
    fontWeight: '500' as const,
  },
  chipTextActive: {
    color: '#FFF',
  },
  chipDesc: {
    color: colors.textDisabled,
    fontSize: 10,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: colors.danger,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    marginTop: 28,
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
