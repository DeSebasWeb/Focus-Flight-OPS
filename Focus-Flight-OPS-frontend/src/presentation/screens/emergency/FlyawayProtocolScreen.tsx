import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useEmergencyStore } from '../../store/slices/emergencySlice';

export function FlyawayProtocolScreen() {
  const s = useStyles(createStyles);
  const { flyawayProtocol, fetchFlyawayProtocol } = useEmergencyStore();

  useEffect(() => {
    if (flyawayProtocol.length === 0) {
      fetchFlyawayProtocol();
    }
  }, []);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (order: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.warningIcon}>!</Text>
        <Text style={s.title}>PROTOCOLO FLYAWAY</Text>
        <Text style={s.subtitle}>
          Siga cada paso en orden. Marque los pasos completados.
        </Text>
      </View>

      {flyawayProtocol.map((step) => {
        const isCompleted = completedSteps.has(step.order);
        return (
          <TouchableOpacity
            key={step.order}
            style={[
              s.stepRow,
              step.isCritical && s.stepCritical,
              isCompleted && s.stepCompleted,
            ]}
            onPress={() => toggleStep(step.order)}
            activeOpacity={0.6}
          >
            <View style={s.stepNumber}>
              <Text style={s.stepNumberText}>
                {isCompleted ? '\u2713' : step.order}
              </Text>
            </View>
            <View style={s.stepContent}>
              <Text style={[s.stepText, isCompleted && s.stepTextCompleted]}>
                {step.instruction}
              </Text>
              {step.isCritical && !isCompleted && (
                <StatusBadge label="CRITICO" variant="danger" small />
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={s.footer}>
        <Text style={s.footerText}>
          Despues de resolver la emergencia, documente todo el incidente y reporte a la UAEAC dentro de 72 horas.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: 16, paddingBottom: 100 },
  header: {
    alignItems: 'center' as const, paddingVertical: 20, marginBottom: 16,
    backgroundColor: colors.emergencyBg, borderRadius: 16,
    borderWidth: 2, borderColor: colors.emergencyBorder,
  },
  warningIcon: { color: '#FFFFFF', fontSize: 40, fontWeight: '900' as const },
  title: {
    color: '#FFFFFF', fontSize: 22, fontWeight: '800' as const,
    letterSpacing: 2, marginTop: 4,
  },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 8, textAlign: 'center' as const, paddingHorizontal: 20 },
  stepRow: {
    flexDirection: 'row' as const, gap: 12, alignItems: 'flex-start' as const,
    backgroundColor: colors.surface1, borderRadius: 10,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
    minHeight: 56,
  },
  stepCritical: { borderLeftWidth: 3, borderLeftColor: colors.danger },
  stepCompleted: { backgroundColor: colors.surface2, opacity: 0.7 },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface3,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  stepNumberText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' as const },
  stepContent: { flex: 1, gap: 6 },
  stepText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
  stepTextCompleted: { textDecorationLine: 'line-through' as const, color: colors.textSecondary },
  footer: {
    marginTop: 16, padding: 16, backgroundColor: colors.surface1,
    borderRadius: 12, borderWidth: 1, borderColor: colors.warning,
  },
  footerText: { color: colors.warning, fontSize: 13, lineHeight: 20, textAlign: 'center' as const },
});
