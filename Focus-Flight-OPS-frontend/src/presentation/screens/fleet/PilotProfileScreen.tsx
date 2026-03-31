import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import { BottomSheetModal } from '../../components/common/BottomSheetModal';
import { useHaptic } from '../../hooks/useHaptic';
import { useFleetStore } from '../../store/slices/fleetSlice';
import { useAuthStore } from '../../store/slices/authSlice';

export function PilotProfileScreen({ navigation }: any) {
  const { colors, mode, setMode } = useTheme();
  const s = useStyles(createStyles);
  const haptic = useHaptic();
  const { pilot, certificates, insurance, drones, fetchAll, isLoading } = useFleetStore();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  if (isLoading && !refreshing) {
    return (
      <View style={[s.container, s.centered]}>
        <View style={s.content}>
          <View style={s.header}>
            <Skeleton width={72} height={72} borderRadius={36} />
            <Skeleton width={160} height={22} borderRadius={4} style={{ marginTop: 10 }} />
            <Skeleton width={200} height={14} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
          <Skeleton width="100%" height={80} borderRadius={14} style={{ marginBottom: 16 }} />
          <SkeletonCard style={{ marginBottom: 12 }} />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  const totalHours = drones.reduce((sum, d) => sum + (d.totalFlightMinutes || 0) / 60, 0);
  const firstName = user?.firstName || 'Piloto';
  const lastName = user?.lastName || '';
  const isInsuranceValid = insurance ? new Date(insurance.endDate).getTime() > Date.now() && insurance.isActive : false;

  const handleLogout = () => {
    haptic.warning();
    Alert.alert('Cerrar Sesion', 'Esta seguro que desea cerrar su sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesion', style: 'destructive', onPress: () => { haptic.error(); logout(); } },
    ]);
  };

  const modeLabel = mode === 'dark' ? 'Oscuro' : mode === 'light' ? 'Claro' : 'Sistema';
  const modeIcon: any = mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait-outline';

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{firstName[0]}{lastName[0] || ''}</Text>
        </View>
        <Text style={s.name}>{firstName} {lastName}</Text>
        {user?.email && <Text style={s.email}>{user.email}</Text>}
        <View style={s.badgeWrap}>
          <StatusBadge label={pilot?.licenseType ? `Licencia ${pilot.licenseType}` : 'Sin perfil de piloto'} variant={pilot ? 'info' : 'warning'} />
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={s.statValue}>{totalHours.toFixed(1)}</Text>
          <Text style={s.statUnit}>Horas</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Ionicons name="airplane-outline" size={16} color={colors.textSecondary} />
          <Text style={s.statValue}>{drones.length}</Text>
          <Text style={s.statUnit}>Drones</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Ionicons name="ribbon-outline" size={16} color={colors.textSecondary} />
          <Text style={s.statValue}>{certificates.length}</Text>
          <Text style={s.statUnit}>Certs</Text>
        </View>
      </View>

      {!pilot && (
        <TouchableOpacity style={s.createBtn} onPress={() => navigation.navigate('CreatePilotProfile')}>
          <Ionicons name="person-add" size={20} color="#FFF" />
          <Text style={s.createBtnText}>Crear Perfil de Piloto</Text>
        </TouchableOpacity>
      )}

      {pilot && (
        <Card>
          <View style={s.cardHeader}>
            <Ionicons name="id-card-outline" size={18} color={colors.primary} />
            <Text style={s.cardTitle}>Piloto UAS</Text>
          </View>
          <InfoRow label="UAEAC" value={pilot.uaeacPilotNumber || 'No registrado'} s={s} />
          <InfoRow label="Licencia" value={pilot.licenseType || '--'} s={s} />
          <InfoRow label="Emergencia" value={pilot.emergencyContactName || '--'} s={s} />
          <InfoRow label="Tel. Emerg." value={pilot.emergencyContactPhone || '--'} s={s} />
        </Card>
      )}

      {insurance && (
        <Card danger={!isInsuranceValid}>
          <View style={s.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color={isInsuranceValid ? colors.success : colors.danger} />
            <Text style={s.cardTitle}>Poliza RC</Text>
            <StatusBadge label={isInsuranceValid ? 'Vigente' : 'Vencida'} variant={isInsuranceValid ? 'safe' : 'danger'} small />
          </View>
          <InfoRow label="Aseguradora" value={insurance.insurerName} s={s} />
          <InfoRow label="No. Poliza" value={insurance.policyNumber} s={s} />
        </Card>
      )}

      <Text style={s.sectionLabel}>CONFIGURACION</Text>

      <TouchableOpacity style={s.settingsItem} onPress={() => setThemeSheetOpen(true)}>
        <Ionicons name={modeIcon} size={20} color={colors.primary} />
        <Text style={s.settingsLabel}>Tema</Text>
        <Text style={s.settingsValue}>{modeLabel}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
      </TouchableOpacity>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={s.logoutText}>Cerrar Sesion</Text>
      </TouchableOpacity>

      <Text style={s.version}>Focus Flight Ops v1.0.0</Text>

      <BottomSheetModal
        isOpen={themeSheetOpen}
        onClose={() => setThemeSheetOpen(false)}
        title="Seleccionar Tema"
      >
        {([
          { key: 'dark' as const, label: 'Oscuro', icon: 'moon' as const },
          { key: 'light' as const, label: 'Claro', icon: 'sunny' as const },
          { key: 'system' as const, label: 'Sistema', icon: 'phone-portrait-outline' as const },
        ]).map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[s.themeOption, mode === option.key && s.themeOptionActive]}
            onPress={() => {
              haptic.selection();
              setMode(option.key);
              setThemeSheetOpen(false);
            }}
          >
            <Ionicons name={option.icon} size={20} color={mode === option.key ? colors.primary : colors.textSecondary} />
            <Text style={[s.themeOptionLabel, mode === option.key && s.themeOptionLabelActive]}>{option.label}</Text>
            {mode === option.key && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </BottomSheetModal>
    </ScrollView>
  );
}

function InfoRow({ label, value, s }: { label: string; value: string; s: any }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface0,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 20,
    marginTop: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 10,
    backgroundColor: colors.danger,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700' as const,
  },
  name: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  email: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  badgeWrap: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row' as const,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  statUnit: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 6,
    backgroundColor: colors.border,
  },
  createBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: colors.danger,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  settingsItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
  },
  settingsLabel: {
    fontSize: 15,
    flex: 1,
    color: colors.textPrimary,
  },
  settingsValue: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  version: {
    color: colors.textDisabled,
    textAlign: 'center' as const,
    fontSize: 12,
    marginTop: 24,
  },
  themeOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
  },
  themeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface2,
  },
  themeOptionLabel: {
    fontSize: 15,
    flex: 1,
    color: colors.textPrimary,
  },
  themeOptionLabelActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
});
