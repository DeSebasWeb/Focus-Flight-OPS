import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import { AnimatedListItem } from '../../components/common/AnimatedListItem';
import { useAuthStore } from '../../store/slices/authSlice';
import { useFleetStore } from '../../store/slices/fleetSlice';
import { useFlightStore } from '../../store/slices/flightSlice';
import { useDashboardStore } from '../../store/slices/dashboardSlice';

export function DashboardScreen({ navigation }: any) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const { user, pilotId } = useAuthStore();
  const { drones, certificates, insurance, fetchAll: fetchFleet, isLoading: fleetLoading } = useFleetStore();
  const { flightLogs, fetchFlightLogs } = useFlightStore();
  const { weather, kpIndex, expiringItems, isLoadingWeather, fetchWeather, fetchKpIndex, fetchExpiring } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    fetchFleet();
    fetchFlightLogs();
    fetchExpiring();
    fetchKpIndex();

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        fetchWeather(loc.coords.latitude, loc.coords.longitude);
      }
    } catch {}
  }, []);

  useEffect(() => { loadAll(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const totalHours = drones.reduce((sum, d) => sum + (d.totalFlightMinutes || 0) / 60, 0);
  const activeDrones = drones.filter((d) => d.isActive).length;
  const totalFlights = flightLogs.length;

  // Expiry alerts: certs + insurance
  const alerts: Array<{ id: string; label: string; days: number; variant: 'warning' | 'danger' }> = [];
  certificates.forEach((c) => {
    const days = Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 30 && days > 0) {
      alerts.push({ id: c.id, label: `Certificado ${c.type}`, days, variant: days <= 7 ? 'danger' : 'warning' });
    }
  });
  if (insurance) {
    const days = Math.ceil((new Date(insurance.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 30 && days > 0) {
      alerts.push({ id: insurance.id, label: 'Poliza RC', days, variant: days <= 7 ? 'danger' : 'warning' });
    }
  }

  // Weather fly/no-fly
  const canFly = weather
    ? weather.windSpeedKmh <= 40 && weather.visibility !== 'POOR' && !weather.thunderstorm
    : null;

  const greeting = getGreeting();
  const firstName = user?.firstName || 'Piloto';

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{greeting},</Text>
          <Text style={s.name}>{firstName}</Text>
        </View>
        <TouchableOpacity
          style={s.profileBtn}
          onPress={() => navigation.navigate('FleetTab', { screen: 'PilotProfile' })}
        >
          <View style={s.avatar}>
            <Text style={s.avatarText}>{firstName[0]}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <AnimatedListItem index={0}>
        <View style={s.statsRow}>
          <StatCard icon="time-outline" value={totalHours.toFixed(1)} label="Horas" unit="h" colors={colors} s={s} />
          <StatCard icon="airplane-outline" value={String(activeDrones)} label="Drones" unit="" colors={colors} s={s} />
          <StatCard icon="navigate-outline" value={String(totalFlights)} label="Vuelos" unit="" colors={colors} s={s} />
        </View>
      </AnimatedListItem>

      {/* Expiry Alerts */}
      {alerts.length > 0 && (
        <AnimatedListItem index={1}>
          <View style={s.alertsSection}>
            <View style={s.sectionHeader}>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={s.sectionTitle}>Alertas de Vencimiento</Text>
            </View>
            {alerts.map((alert) => (
              <View key={alert.id} style={s.alertRow}>
                <View style={s.alertInfo}>
                  <Text style={s.alertLabel}>{alert.label}</Text>
                  <Text style={[s.alertDays, alert.variant === 'danger' && s.alertDaysDanger]}>
                    {alert.days} dias restantes
                  </Text>
                </View>
                <StatusBadge
                  label={alert.days <= 7 ? 'URGENTE' : 'PROXIMO'}
                  variant={alert.variant}
                  small
                />
              </View>
            ))}
          </View>
        </AnimatedListItem>
      )}

      {/* Weather Widget */}
      <AnimatedListItem index={2}>
        <Card>
          <View style={s.sectionHeader}>
            <Ionicons name="cloud" size={18} color={colors.primary} />
            <Text style={s.sectionTitle}>Clima Actual</Text>
            {canFly !== null && (
              <StatusBadge
                label={canFly ? 'APTO' : 'NO APTO'}
                variant={canFly ? 'safe' : 'danger'}
                small
              />
            )}
          </View>
          {isLoadingWeather || !weather ? (
            <View style={s.weatherLoading}>
              <Skeleton width="100%" height={60} borderRadius={8} />
            </View>
          ) : (
            <View style={s.weatherGrid}>
              <WeatherItem icon="thermometer-outline" value={`${weather.temperatureC.toFixed(0)}°C`} label="Temp." colors={colors} s={s} />
              <WeatherItem icon="speedometer-outline" value={`${weather.windSpeedKmh.toFixed(0)} km/h`} label="Viento" danger={weather.windSpeedKmh > 40} colors={colors} s={s} />
              <WeatherItem icon="water-outline" value={`${weather.humidityPercent}%`} label="Humedad" colors={colors} s={s} />
              <WeatherItem icon="eye-outline" value={weather.visibility} label="Visib." danger={weather.visibility === 'POOR'} colors={colors} s={s} />
            </View>
          )}
          {weather?.thunderstorm && (
            <View style={s.stormWarning}>
              <Ionicons name="thunderstorm" size={16} color={colors.danger} />
              <Text style={s.stormText}>Tormentas detectadas - NO volar</Text>
            </View>
          )}
        </Card>
      </AnimatedListItem>

      {/* Kp Index - Geomagnetic Activity */}
      <AnimatedListItem index={3}>
        <Card>
          <View style={s.sectionHeader}>
            <Ionicons name="magnet" size={18} color={kpIndex && !kpIndex.flyable ? colors.danger : colors.primary} />
            <Text style={s.sectionTitle}>Indice Kp Geomagnetico</Text>
            {kpIndex && (
              <StatusBadge
                label={kpIndex.level === 'quiet' ? 'ESTABLE' : kpIndex.level === 'unsettled' ? 'INESTABLE' : kpIndex.level === 'storm' ? 'TORMENTA' : 'SEVERO'}
                variant={kpIndex.level === 'quiet' ? 'safe' : kpIndex.level === 'unsettled' ? 'warning' : 'danger'}
                small
              />
            )}
          </View>
          {kpIndex ? (
            <>
              <View style={s.kpRow}>
                <View style={s.kpValueContainer}>
                  <Text style={[s.kpValue, !kpIndex.flyable && s.kpValueDanger]}>{kpIndex.current.toFixed(1)}</Text>
                  <Text style={s.kpScale}>/9</Text>
                </View>
                <View style={s.kpInfo}>
                  <Text style={s.kpMessage}>{kpIndex.message}</Text>
                  {kpIndex.noaaScale && (
                    <StatusBadge label={kpIndex.noaaScale} variant="danger" small />
                  )}
                </View>
              </View>
              {kpIndex.forecast.length > 0 && (
                <View style={s.kpForecast}>
                  <Text style={s.kpForecastTitle}>Pronostico 24h</Text>
                  <View style={s.kpBars}>
                    {kpIndex.forecast.map((f, i) => {
                      const height = Math.max(4, (f.kp / 9) * 40);
                      const barColor = f.kp < 4 ? colors.success : f.kp < 5 ? colors.warning : colors.danger;
                      const hour = new Date(f.timestamp.replace(' ', 'T') + 'Z').getHours();
                      return (
                        <View key={i} style={s.kpBarCol}>
                          <View style={[s.kpBar, { height, backgroundColor: barColor }]} />
                          <Text style={s.kpBarLabel}>{hour}h</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
              {!kpIndex.flyable && (
                <View style={s.kpDangerBanner}>
                  <Ionicons name="warning" size={16} color={colors.danger} />
                  <Text style={s.kpDangerText}>Condiciones geomagneticas adversas. GPS y compas pueden fallar. NO VOLAR.</Text>
                </View>
              )}
            </>
          ) : (
            <Skeleton width="100%" height={50} borderRadius={8} />
          )}
        </Card>
      </AnimatedListItem>

      {/* Fleet Summary */}
      <AnimatedListItem index={4}>
        <Card>
          <View style={s.sectionHeader}>
            <Ionicons name="airplane" size={18} color={colors.primary} />
            <Text style={s.sectionTitle}>Mi Flota</Text>
            <Text style={s.sectionCount}>{drones.length}</Text>
          </View>
          {fleetLoading && drones.length === 0 ? (
            <Skeleton width="100%" height={50} borderRadius={8} />
          ) : drones.length === 0 ? (
            <Text style={s.emptyText}>Sin drones registrados</Text>
          ) : (
            drones.slice(0, 3).map((drone) => (
              <TouchableOpacity
                key={drone.id}
                style={s.droneRow}
                onPress={() => navigation.navigate('FleetTab', { screen: 'DroneDetail', params: { droneId: drone.id } })}
              >
                <View style={s.droneInfo}>
                  <Text style={s.droneName}>{drone.manufacturer} {drone.modelName}</Text>
                  <Text style={s.droneSerial}>S/N: {drone.serialNumber}</Text>
                </View>
                <StatusBadge label={drone.isActive ? 'Activo' : 'Inactivo'} variant={drone.isActive ? 'safe' : 'danger'} small />
              </TouchableOpacity>
            ))
          )}
          {drones.length > 3 && (
            <TouchableOpacity style={s.seeAllBtn} onPress={() => navigation.navigate('FleetTab')}>
              <Text style={s.seeAllText}>Ver todos ({drones.length})</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </Card>
      </AnimatedListItem>

      {/* Quick Actions */}
      <AnimatedListItem index={5}>
        <Text style={s.quickActionsTitle}>Acciones Rapidas</Text>
        <View style={s.actionsRow}>
          <QuickAction
            icon="navigate-circle"
            label="Nuevo Vuelo"
            color={colors.success}
            onPress={() => navigation.navigate('FlightTab')}
            s={s}
          />
          <QuickAction
            icon="checkbox"
            label="Checklist"
            color={colors.primary}
            onPress={() => navigation.navigate('ChecklistTab')}
            s={s}
          />
          <QuickAction
            icon="add-circle"
            label="Drone"
            color={colors.danger}
            onPress={() => navigation.navigate('FleetTab', { screen: 'RegisterDrone' })}
            s={s}
          />
          <QuickAction
            icon="shield-checkmark"
            label="Pre-Vuelo"
            color={colors.warning}
            onPress={() => navigation.navigate('PreFlightTab')}
            s={s}
          />
        </View>
      </AnimatedListItem>

      {/* Pilot Status */}
      {!pilotId && (
        <AnimatedListItem index={6}>
          <TouchableOpacity
            style={s.setupBanner}
            onPress={() => navigation.navigate('FleetTab', { screen: 'CreatePilotProfile' })}
          >
            <Ionicons name="person-add" size={24} color={colors.danger} />
            <View style={s.setupInfo}>
              <Text style={s.setupTitle}>Completa tu perfil de piloto</Text>
              <Text style={s.setupSubtitle}>Requerido para crear misiones y volar</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </AnimatedListItem>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos dias';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function StatCard({ icon, value, label, unit, colors, s }: any) {
  return (
    <View style={s.statCard}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={s.statValue}>{value}<Text style={s.statUnit}>{unit}</Text></Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function WeatherItem({ icon, value, label, danger, colors, s }: any) {
  return (
    <View style={s.weatherItem}>
      <Ionicons name={icon} size={16} color={danger ? colors.danger : colors.textSecondary} />
      <Text style={[s.weatherValue, danger && s.weatherValueDanger]}>{value}</Text>
      <Text style={s.weatherLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress, s }: any) {
  return (
    <TouchableOpacity style={s.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#FFF" />
      </View>
      <Text style={s.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = ({ colors, spacing, borderRadius }: StyleTheme) => ({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: spacing.md, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: { color: colors.textSecondary, fontSize: 15 },
  name: { color: colors.textPrimary, fontSize: 26, fontWeight: '700' as const, marginTop: 2 },
  profileBtn: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.danger,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' as const },

  // Stats
  statsRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface1,
    borderRadius: borderRadius.lg,
    padding: 14,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
    marginTop: 6,
  },
  statUnit: { fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary },
  statLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' as const, flex: 1 },
  sectionCount: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
    backgroundColor: colors.surface3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden' as const,
  },

  // Alerts
  alertsSection: {
    backgroundColor: colors.surface1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  alertRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  alertInfo: { flex: 1 },
  alertLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' as const },
  alertDays: { color: colors.warning, fontSize: 12, marginTop: 2 },
  alertDaysDanger: { color: colors.danger },

  // Weather
  weatherLoading: { paddingVertical: 12 },
  weatherGrid: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  weatherItem: {
    flex: 1,
    alignItems: 'center' as const,
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  weatherValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  weatherValueDanger: { color: colors.danger },
  weatherLabel: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  stormWarning: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  stormText: { color: colors.danger, fontSize: 13, fontWeight: '600' as const, flex: 1 },

  // Fleet
  droneRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  droneInfo: { flex: 1 },
  droneName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' as const },
  droneSerial: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' as const, paddingVertical: 16 },
  seeAllBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    marginTop: 10,
    paddingVertical: 8,
  },
  seeAllText: { color: colors.primary, fontSize: 14, fontWeight: '500' as const },

  // Quick Actions
  quickActionsTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginTop: 8,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },

  // Setup banner
  setupBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: colors.surface1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  setupInfo: { flex: 1 },
  setupTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' as const },
  setupSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

  // Kp Index
  kpRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  kpValueContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
  },
  kpValue: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  kpValueDanger: {
    color: colors.danger,
  },
  kpScale: {
    color: colors.textDisabled,
    fontSize: 16,
    fontWeight: '400' as const,
    marginBottom: 6,
    marginLeft: 2,
  },
  kpInfo: {
    flex: 1,
  },
  kpMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  kpForecast: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  kpForecastTitle: {
    color: colors.textDisabled,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  kpBars: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'space-between' as const,
    height: 50,
  },
  kpBarCol: {
    flex: 1,
    alignItems: 'center' as const,
  },
  kpBar: {
    width: 12,
    borderRadius: 3,
    minHeight: 4,
  },
  kpBarLabel: {
    color: colors.textDisabled,
    fontSize: 9,
    marginTop: 4,
  },
  kpDangerBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  kpDangerText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600' as const,
    flex: 1,
  },
});
