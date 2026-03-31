import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useHaptic } from '../../hooks/useHaptic';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Skeleton } from '../../components/common/Skeleton';
import { SignaturePad } from '../../components/common/SignaturePad';
import { useChecklistStore, ChecklistPhaseState, ChecklistItemState } from '../../store/slices/checklistSlice';
// Types come as strings from backend: PRE_ASSEMBLY, CONFIGURATION, PRE_TAKEOFF, POST_FLIGHT

export function ChecklistScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const haptic = useHaptic();
  const { phases, currentPhaseIndex, fetchTemplates, toggleItem, finalizePhase, resetAll, isLoading } =
    useChecklistStore();
  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  const handleTakePhoto = useCallback(async (itemId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la camara para tomar fotos de evidencia.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => ({ ...prev, [itemId]: result.assets[0].uri }));
    }
  }, []);

  useEffect(() => {
    if (phases.length === 0) {
      fetchTemplates();
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      resetAll();
      await fetchTemplates();
    } finally {
      setRefreshing(false);
    }
  }, [resetAll, fetchTemplates]);

  if (isLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Skeleton width={220} height={24} borderRadius={8} />
        <View style={{ height: 12 }} />
        <Skeleton width={180} height={14} borderRadius={6} />
        <View style={{ height: 24 }} />
        <Skeleton width="80%" height={48} borderRadius={12} />
        <View style={{ height: 12 }} />
        <Skeleton width="90%" height={56} borderRadius={8} />
        <View style={{ height: 6 }} />
        <Skeleton width="90%" height={56} borderRadius={8} />
        <View style={{ height: 6 }} />
        <Skeleton width="90%" height={56} borderRadius={8} />
      </View>
    );
  }

  const currentPhase = phases[currentPhaseIndex];
  const preFlightPhases = phases.filter((p) => p.type !== 'POST_FLIGHT');
  const allPreFlightPassed = preFlightPhases.length > 0 && preFlightPhases.every((p) => p.status === 'PASSED');

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={s.title}>Protocolo de Seguridad</Text>
      <Text style={s.subtitle}>Checklist paso a paso obligatorio</Text>

      {/* Phase indicators */}
      <View style={s.phaseIndicators}>
        {preFlightPhases.map((phase, idx) => {
          const isCurrent = idx === currentPhaseIndex;
          const isPassed = phase.status === 'PASSED';
          const isFailed = phase.status === 'FAILED';

          return (
            <View key={phase.type} style={s.phaseIndicator}>
              <View
                style={[
                  s.phaseCircle,
                  isPassed && s.phaseCirclePassed,
                  isFailed && s.phaseCircleFailed,
                  isCurrent && s.phaseCircleCurrent,
                ]}
              >
                <Text style={s.phaseCircleText}>
                  {isPassed ? '\u2713' : idx + 1}
                </Text>
              </View>
              <Text
                style={[s.phaseLabel, isCurrent && s.phaseLabelCurrent]}
                numberOfLines={2}
              >
                {phase.type === 'PRE_ASSEMBLY'
                  ? 'Pre-\nArmado'
                  : phase.type === 'CONFIGURATION'
                    ? 'Config.'
                    : 'Pre-\nDespegue'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Current phase content */}
      {currentPhase && currentPhase.type !== 'POST_FLIGHT' && (
        <>
          <Card title={currentPhase.nameEs}>
            <ProgressBar
              progress={getPhaseProgress(currentPhase)}
              label={`${countChecked(currentPhase)} de ${currentPhase.items.length} items`}
            />
          </Card>

          {currentPhase.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onToggle={() => {
                haptic.light();
                toggleItem(currentPhase.type, item.id);
              }}
              disabled={currentPhase.status === 'PASSED'}
              styles={s}
              hasPhoto={!!photos[item.id]}
              onTakePhoto={() => handleTakePhoto(item.id)}
            />
          ))}

          {currentPhase.status !== 'PASSED' && (
            <TouchableOpacity
              style={[
                s.finalizeBtn,
                !allCriticalChecked(currentPhase) && s.finalizeBtnDisabled,
              ]}
              onPress={() => {
                const passed = finalizePhase(currentPhase.type);
                if (passed) {
                  haptic.success();
                } else {
                  Alert.alert(
                    'Checklist Incompleto',
                    'Todos los items criticos (marcados con borde rojo) deben completarse para continuar.',
                    [{ text: 'Entendido' }],
                  );
                }
              }}
            >
              <Text style={s.finalizeBtnText}>
                {allCriticalChecked(currentPhase) ? 'Finalizar Fase' : 'Items criticos pendientes'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {allPreFlightPassed && (
        <View style={s.readyBanner}>
          <Text style={s.readyIcon}>{'\u2713'}</Text>
          <Text style={s.readyTitle}>LISTO PARA DESPEGUE</Text>
          <Text style={s.readySubtitle}>
            Todos los checklists pre-vuelo han sido aprobados
          </Text>

          {/* Signature section */}
          {!signature ? (
            <TouchableOpacity
              style={s.signBtn}
              onPress={() => setShowSignature(true)}
            >
              <Ionicons name="pencil" size={18} color={colors.textOnPrimary} />
              <Text style={s.signBtnText}>Firmar Checklist</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.signedContainer}>
              <Image source={{ uri: signature }} style={s.signaturePreview} resizeMode="contain" />
              <StatusBadge label="Firmado" variant="safe" small />
            </View>
          )}

          <TouchableOpacity
            style={[s.startFlightBtn, !signature && s.startFlightBtnDisabled]}
            onPress={() => {
              if (signature) navigation.getParent()?.navigate('FlightTab');
            }}
            activeOpacity={signature ? 0.7 : 1}
          >
            <Text style={s.startFlightText}>
              {signature ? 'Iniciar Vuelo' : 'Firma requerida para continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showSignature && (
        <SignaturePad
          onSave={(base64) => {
            setSignature(base64);
            setShowSignature(false);
          }}
          onCancel={() => setShowSignature(false)}
        />
      )}
    </ScrollView>
  );
}

function ChecklistItemRow({
  item,
  onToggle,
  disabled,
  styles: s,
  hasPhoto,
  onTakePhoto,
}: {
  item: ChecklistItemState;
  onToggle: () => void;
  disabled: boolean;
  styles: ReturnType<typeof createStyles>;
  hasPhoto: boolean;
  onTakePhoto: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        s.itemRow,
        item.isCritical && s.itemCritical,
        item.isChecked && s.itemChecked,
      ]}
      onPress={disabled ? undefined : onToggle}
      activeOpacity={disabled ? 1 : 0.6}
    >
      <View style={[s.checkbox, item.isChecked && s.checkboxChecked]}>
        {item.isChecked && <Text style={s.checkmark}>{'\u2713'}</Text>}
      </View>
      <View style={s.itemContent}>
        <Text style={[s.itemText, item.isChecked && s.itemTextChecked]}>
          {item.textEs}
        </Text>
        <View style={s.itemTags}>
          {item.isCritical && <StatusBadge label="CRITICO" variant="danger" small />}
          {item.requiresPhoto && <StatusBadge label="Foto req." variant="info" small />}
          {item.category && <StatusBadge label={item.category} variant="neutral" small />}
        </View>
      </View>
      {item.requiresPhoto && (
        <TouchableOpacity style={s.cameraBtn} onPress={onTakePhoto}>
          <Ionicons name="camera" size={22} color={hasPhoto ? '#22c55e' : '#9ca3af'} />
          {hasPhoto && (
            <View style={s.photoBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
            </View>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function getPhaseProgress(phase: ChecklistPhaseState): number {
  if (phase.items.length === 0) return 100;
  return (countChecked(phase) / phase.items.length) * 100;
}

function countChecked(phase: ChecklistPhaseState): number {
  return phase.items.filter((i) => i.isChecked).length;
}

function allCriticalChecked(phase: ChecklistPhaseState): boolean {
  return phase.items.filter((i) => i.isCritical).every((i) => i.isChecked);
}

const createStyles = (t: StyleTheme) => ({
  container: { flex: 1, backgroundColor: t.colors.surface0 } as const,
  content: { padding: t.spacing.md, paddingBottom: 100 } as const,
  title: { color: t.colors.textPrimary, fontSize: 24, fontWeight: '700' as const },
  subtitle: { color: t.colors.textSecondary, fontSize: 14, marginTop: t.spacing.xs, marginBottom: t.spacing.md },
  phaseIndicators: {
    flexDirection: 'row' as const, justifyContent: 'center' as const, gap: t.spacing.lg,
    marginBottom: 20, paddingVertical: t.spacing.lg / 2,
    backgroundColor: t.colors.surface1, borderRadius: t.borderRadius.lg,
    borderWidth: 1, borderColor: t.colors.border,
  },
  phaseIndicator: { alignItems: 'center' as const, width: 70 },
  phaseCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: t.colors.surface3, alignItems: 'center' as const, justifyContent: 'center' as const,
    borderWidth: 2, borderColor: t.colors.border,
  },
  phaseCirclePassed: { backgroundColor: t.colors.success, borderColor: t.colors.success },
  phaseCircleFailed: { backgroundColor: t.colors.danger, borderColor: t.colors.danger },
  phaseCircleCurrent: { borderColor: t.colors.primary, borderWidth: 2.5 },
  phaseCircleText: { color: t.colors.textPrimary, fontSize: 14, fontWeight: '700' as const },
  phaseLabel: { color: t.colors.textSecondary, fontSize: 10, marginTop: t.spacing.xs, textAlign: 'center' as const },
  phaseLabelCurrent: { color: t.colors.primary, fontWeight: '600' as const },
  itemRow: {
    flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: t.spacing.lg / 2,
    paddingVertical: t.spacing.lg / 2, paddingHorizontal: t.spacing.lg / 2,
    backgroundColor: t.colors.surface1, borderRadius: t.borderRadius.md,
    marginBottom: 6, borderWidth: 1, borderColor: t.colors.border,
    minHeight: t.touchTarget.checklistItem,
  },
  itemCritical: { borderLeftWidth: 3, borderLeftColor: t.colors.danger },
  itemChecked: { backgroundColor: t.colors.surface2, opacity: 0.8 },
  checkbox: {
    width: 28, height: 28, borderRadius: 6,
    borderWidth: 2, borderColor: t.colors.textSecondary,
    alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: 2,
  },
  checkboxChecked: { backgroundColor: t.colors.success, borderColor: t.colors.success },
  checkmark: { color: t.colors.textOnPrimary, fontSize: 16, fontWeight: '800' as const },
  itemContent: { flex: 1 },
  itemText: { color: t.colors.textPrimary, fontSize: 14, lineHeight: 20 },
  itemTextChecked: { textDecorationLine: 'line-through' as const, color: t.colors.textSecondary },
  itemTags: { flexDirection: 'row' as const, gap: t.spacing.xs, marginTop: 6, flexWrap: 'wrap' as const },
  finalizeBtn: {
    backgroundColor: t.colors.primary, borderRadius: t.borderRadius.lg,
    paddingVertical: t.spacing.md, alignItems: 'center' as const, marginTop: t.spacing.lg / 2,
  },
  finalizeBtnDisabled: { backgroundColor: t.colors.surface3 },
  finalizeBtnText: { color: t.colors.textOnPrimary, fontSize: 16, fontWeight: '700' as const },
  readyBanner: {
    alignItems: 'center' as const, paddingVertical: t.spacing.xl,
    backgroundColor: t.colors.surface1, borderRadius: t.borderRadius.xl,
    borderWidth: 2, borderColor: t.colors.success, marginTop: t.spacing.md,
  },
  readyIcon: { color: t.colors.success, fontSize: 48, fontWeight: '700' as const },
  readyTitle: { color: t.colors.success, fontSize: 20, fontWeight: '700' as const, marginTop: t.spacing.sm },
  readySubtitle: { color: t.colors.textSecondary, fontSize: 14, marginTop: t.spacing.xs, textAlign: 'center' as const },
  startFlightBtn: {
    backgroundColor: t.colors.success, borderRadius: t.borderRadius.lg,
    paddingVertical: 14, paddingHorizontal: t.spacing.xl, marginTop: t.spacing.md,
  },
  startFlightBtnDisabled: { backgroundColor: t.colors.surface3 },
  startFlightText: { color: t.colors.textOnPrimary, fontSize: 16, fontWeight: '700' as const },
  // Camera / photo styles
  cameraBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: t.colors.surface2, alignItems: 'center' as const,
    justifyContent: 'center' as const, marginTop: 2,
  },
  photoBadge: {
    position: 'absolute' as const, top: -2, right: -2,
    backgroundColor: t.colors.surface1, borderRadius: 8,
  },
  // Signature styles
  signBtn: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8,
    backgroundColor: t.colors.primary, borderRadius: t.borderRadius.lg,
    paddingVertical: 12, paddingHorizontal: t.spacing.lg, marginTop: t.spacing.md,
  },
  signBtnText: { color: t.colors.textOnPrimary, fontSize: 14, fontWeight: '600' as const },
  signedContainer: {
    alignItems: 'center' as const, marginTop: t.spacing.md, gap: t.spacing.xs,
  },
  signaturePreview: {
    width: 200, height: 60, borderRadius: t.borderRadius.md,
    borderWidth: 1, borderColor: t.colors.border, backgroundColor: '#fff',
  },
});
