import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { AnimatedListItem } from '../../components/common/AnimatedListItem';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonList } from '../../components/common/Skeleton';
import { useFlightStore } from '../../store/slices/flightSlice';

export function FlightLogListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const { flightLogs, fetchFlightLogs, isLoading } = useFlightStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFlightLogs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFlightLogs();
    } finally {
      setRefreshing(false);
    }
  }, [fetchFlightLogs]);

  const totalHours = flightLogs.reduce((sum, l) => sum + (l.totalFlightMinutes ?? 0) / 60, 0);
  const totalFlights = flightLogs.length;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={s.title}>Bitacora de Vuelos</Text>

      <View style={s.summaryRow}>
        <View style={s.summaryItem}>
          <Text style={s.summaryValue}>{totalFlights}</Text>
          <Text style={s.summaryLabel}>Vuelos</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          <Text style={s.summaryValue}>{totalHours.toFixed(1)}h</Text>
          <Text style={s.summaryLabel}>Horas totales</Text>
        </View>
      </View>

      {isLoading && flightLogs.length === 0 ? (
        <SkeletonList count={3} />
      ) : (
        <>
          {flightLogs.map((log, index) => {
            const date = new Date(log.takeoffTime);
            const dateStr = date.toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = date.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <AnimatedListItem key={log.id} index={index}>
              <Card onPress={() => navigation.navigate('FlightLogDetail', { logId: log.id })}>
                <View style={s.logHeader}>
                  <View>
                    <Text style={s.logDate}>{dateStr}</Text>
                    <Text style={s.logTime}>{timeStr}</Text>
                  </View>
                  <StatusBadge
                    label={log.status === 'COMPLETED' ? 'Completado' : log.status === 'IN_FLIGHT' ? 'En vuelo' : 'Emergencia'}
                    variant={log.status === 'COMPLETED' ? 'safe' : log.status === 'IN_FLIGHT' ? 'info' : 'danger'}
                    small
                  />
                </View>

                <Text style={s.logDrone}>{log.operationType} - {log.source}</Text>
                <Text style={s.logPurpose}>Mision: {log.missionId.slice(0, 8)}...</Text>

                <View style={s.logStats}>
                  <Stat label="Duracion" value={`${log.totalFlightMinutes?.toFixed(0) ?? '--'} min`} s={s} />
                  <Stat label="Alt. max" value={`${log.maxAltitudeAglM ?? '--'}m`} s={s} />
                  <Stat label="Dist. max" value={`${log.maxDistanceM ?? '--'}m`} s={s} />
                  <Stat label="Tipo" value={log.operationType} s={s} />
                </View>
              </Card>
              </AnimatedListItem>
            );
          })}

          {flightLogs.length === 0 && !isLoading && (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No hay vuelos registrados</Text>
              <Text style={s.emptySubtext}>
                Los vuelos se registraran automaticamente cuando inicies una operacion
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Stat({ label, value, s }: { label: string; value: string; s: any }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
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
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    backgroundColor: colors.surface1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  logHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  logDate: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  logTime: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  logDrone: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 8,
  },
  logPurpose: {
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 2,
  },
  logStats: {
    flexDirection: 'row' as const,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});
