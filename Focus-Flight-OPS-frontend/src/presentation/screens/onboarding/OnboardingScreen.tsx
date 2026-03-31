import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Animated, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useHaptic } from '../../hooks/useHaptic';
import { ThemedButton } from '../../components/common/ThemedButton';
import { ThemedInput } from '../../components/common/ThemedInput';
import { pilotApi } from '../../../services/api/pilotApi';
import { useAuthStore } from '../../store/slices/authSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 4;

export function OnboardingScreen() {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const haptic = useHaptic();
  const { user, checkAuth, completeOnboarding } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Step 2: Pilot profile form
  const [licenseType, setLicenseType] = useState('OPEN');
  const [uaeacNumber, setUaeacNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [submittingPilot, setSubmittingPilot] = useState(false);
  const [pilotCreated, setPilotCreated] = useState(false);

  const goToStep = (step: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, step));
    scrollRef.current?.scrollTo({ x: clamped * SCREEN_WIDTH, animated: true });
    setCurrentStep(clamped);
    haptic.selection();
  };

  const handleCreatePilot = async () => {
    setSubmittingPilot(true);
    try {
      await pilotApi.createProfile({
        licenseType,
        uaeacPilotNumber: uaeacNumber.trim() || undefined,
        emergencyContactName: emergencyName.trim() || undefined,
        emergencyContactPhone: emergencyPhone.trim() || undefined,
      });
      await checkAuth();
      setPilotCreated(true);
      haptic.success();
      goToStep(2);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear el perfil');
    } finally {
      setSubmittingPilot(false);
    }
  };

  const handleFinish = async () => {
    haptic.success();
    await completeOnboarding();
  };

  return (
    <View style={s.container}>
      {/* Progress indicator */}
      <View style={s.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              s.progressDot,
              i === currentStep && s.progressDotActive,
              i < currentStep && s.progressDotDone,
            ]}
          />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* ===== STEP 0: Welcome ===== */}
        <View style={s.step}>
          <View style={s.stepCenter}>
            <Ionicons name="airplane" size={80} color={colors.danger} />
            <Text style={s.welcomeTitle}>Bienvenido a</Text>
            <Text style={s.welcomeBrand}>FOCUS FLIGHT OPS</Text>
            <Text style={s.welcomeSubtitle}>
              Plataforma profesional para pilotos de drones en Colombia
            </Text>
            <View style={s.featureList}>
              <FeatureItem icon="shield-checkmark" text="Verificacion legal RAC 100" colors={colors} s={s} />
              <FeatureItem icon="checkbox" text="Checklists de seguridad" colors={colors} s={s} />
              <FeatureItem icon="navigate-circle" text="Telemetria GPS en tiempo real" colors={colors} s={s} />
              <FeatureItem icon="warning" text="Protocolos de emergencia" colors={colors} s={s} />
            </View>
          </View>
          <ThemedButton title="Comenzar" onPress={() => goToStep(1)} variant="danger" />
        </View>

        {/* ===== STEP 1: Create Pilot Profile ===== */}
        <ScrollView style={s.stepScroll} contentContainerStyle={s.stepScrollContent}>
          <View style={s.stepHeader}>
            <Ionicons name="person-add" size={40} color={colors.danger} />
            <Text style={s.stepTitle}>Perfil de Piloto</Text>
            <Text style={s.stepSubtitle}>Configure su perfil para operar bajo regulacion colombiana</Text>
          </View>

          <Text style={s.label}>TIPO DE LICENCIA</Text>
          <View style={s.chipRow}>
            {(['OPEN', 'SPECIFIC', 'CERTIFIED'] as const).map((type) => (
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

          <ThemedInput
            label="NUMERO PILOTO UAEAC (opcional)"
            value={uaeacNumber}
            onChangeText={setUaeacNumber}
            placeholder="Ej: UAS-2024-00156"
            autoCapitalize="characters"
          />

          <ThemedInput
            label="CONTACTO DE EMERGENCIA"
            value={emergencyName}
            onChangeText={setEmergencyName}
            placeholder="Nombre completo"
          />
          <ThemedInput
            label="TELEFONO DE EMERGENCIA"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            placeholder="+57 300 123 4567"
            keyboardType="phone-pad"
          />

          <View style={s.stepActions}>
            <ThemedButton
              title={pilotCreated ? 'Perfil Creado' : 'Crear Perfil'}
              onPress={handleCreatePilot}
              variant="danger"
              disabled={pilotCreated}
              loading={submittingPilot}
            />
            <TouchableOpacity style={s.skipBtn} onPress={() => goToStep(2)}>
              <Text style={s.skipText}>Omitir por ahora</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ===== STEP 2: What's next ===== */}
        <View style={s.step}>
          <View style={s.stepCenter}>
            <Ionicons name="rocket" size={64} color={colors.primary} />
            <Text style={s.stepTitle}>Proximos Pasos</Text>
            <Text style={s.stepSubtitle}>Para estar 100% listo para volar</Text>

            <View style={s.todoList}>
              <TodoItem
                icon="airplane"
                text="Registrar tu primer drone"
                done={false}
                colors={colors}
                s={s}
              />
              <TodoItem
                icon="ribbon"
                text="Subir certificado UAEAC"
                done={false}
                colors={colors}
                s={s}
              />
              <TodoItem
                icon="shield-checkmark"
                text="Agregar poliza RC"
                done={false}
                colors={colors}
                s={s}
              />
              <TodoItem
                icon="person"
                text="Configurar perfil de piloto"
                done={pilotCreated}
                colors={colors}
                s={s}
              />
            </View>
          </View>
          <ThemedButton title="Continuar" onPress={() => goToStep(3)} variant="primary" />
        </View>

        {/* ===== STEP 3: Ready ===== */}
        <View style={s.step}>
          <View style={s.stepCenter}>
            <View style={s.readyCircle}>
              <Ionicons name="checkmark" size={48} color="#FFF" />
            </View>
            <Text style={s.readyTitle}>Listo para Despegar!</Text>
            <Text style={s.readySubtitle}>
              Ya puedes comenzar a usar Focus Flight Ops. Registra tu drone, completa los checklists de seguridad y vuela con confianza.
            </Text>
          </View>
          <ThemedButton title="Ir a la App" onPress={handleFinish} variant="danger" />
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ icon, text, colors, s }: any) {
  return (
    <View style={s.featureItem}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={s.featureText}>{text}</Text>
    </View>
  );
}

function TodoItem({ icon, text, done, colors, s }: any) {
  return (
    <View style={s.todoItem}>
      <View style={[s.todoCircle, done && s.todoCircleDone]}>
        {done ? (
          <Ionicons name="checkmark" size={14} color="#FFF" />
        ) : (
          <Ionicons name={icon} size={14} color={colors.textSecondary} />
        )}
      </View>
      <Text style={[s.todoText, done && s.todoTextDone]}>{text}</Text>
    </View>
  );
}

const createStyles = ({ colors, spacing, borderRadius }: StyleTheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface0,
  },
  progressRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingTop: 60,
    paddingBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface3,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.danger,
  },
  progressDotDone: {
    backgroundColor: colors.success,
  },
  step: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    justifyContent: 'space-between' as const,
    flex: 1,
  },
  stepScroll: {
    width: SCREEN_WIDTH,
  },
  stepScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  stepCenter: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stepHeader: {
    alignItems: 'center' as const,
    marginBottom: 24,
    marginTop: 8,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 12,
    textAlign: 'center' as const,
  },
  stepSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  stepActions: {
    marginTop: 20,
  },

  // Welcome
  welcomeTitle: {
    color: colors.textSecondary,
    fontSize: 18,
    marginTop: 24,
  },
  welcomeBrand: {
    color: colors.danger,
    fontSize: 32,
    fontWeight: '900' as const,
    letterSpacing: 3,
    marginTop: 4,
  },
  welcomeSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 12,
    marginBottom: 32,
  },
  featureList: {
    alignSelf: 'stretch' as const,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: colors.surface1,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500' as const,
  },

  // Pilot form
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
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
    fontSize: 13,
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
  skipBtn: {
    alignItems: 'center' as const,
    marginTop: 16,
    padding: 12,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Todos
  todoList: {
    alignSelf: 'stretch' as const,
    gap: 10,
    marginTop: 24,
  },
  todoItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: colors.surface1,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  todoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface3,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  todoCircleDone: {
    backgroundColor: colors.success,
  },
  todoText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
  },
  todoTextDone: {
    textDecorationLine: 'line-through' as const,
    color: colors.textSecondary,
  },

  // Ready
  readyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  readyTitle: {
    color: colors.success,
    fontSize: 26,
    fontWeight: '700' as const,
  },
  readySubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center' as const,
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
