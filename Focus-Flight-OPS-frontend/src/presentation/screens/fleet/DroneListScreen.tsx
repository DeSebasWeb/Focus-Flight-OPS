import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { AnimatedListItem } from '../../components/common/AnimatedListItem';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonList } from '../../components/common/Skeleton';
import { useFleetStore } from '../../store/slices/fleetSlice';

export function DroneListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const { drones, selectedDroneId, selectDrone, fetchAll, isLoading } = useFleetStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={s.headerRow}>
        <View>
          <Text style={s.title}>Mi Flota</Text>
          <Text style={s.subtitle}>{drones.length} aeronave(s) registrada(s)</Text>
        </View>
        <View style={s.headerBtns}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('PilotProfile')}>
            <Ionicons name="person-circle-outline" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('RegisterDrone')}>
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && drones.length === 0 ? (
        <SkeletonList count={3} />
      ) : (
        <>
          {drones.map((drone, index) => {
            const isSelected = drone.id === selectedDroneId;
            const requiresReg = drone.mtowGrams >= 200;

            return (
              <AnimatedListItem key={drone.id} index={index}>
              <Card
                onPress={() => {
                  selectDrone(drone.id);
                  navigation.navigate('DroneDetail', { droneId: drone.id });
                }}
                style={isSelected && s.selectedCard}
              >
                <View style={s.droneHeader}>
                  <View style={s.droneInfo}>
                    <Text style={s.droneName}>
                      {drone.manufacturer} {drone.modelName}
                    </Text>
                    <Text style={s.droneSerial}>S/N: {drone.serialNumber}</Text>
                  </View>
                  {isSelected && <StatusBadge label="Seleccionado" variant="info" small />}
                </View>

                <View style={s.statsRow}>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{(drone.totalFlightMinutes / 60).toFixed(1)}h</Text>
                    <Text style={s.statLabel}>Horas de vuelo</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{(drone.mtowGrams / 1000).toFixed(1)}kg</Text>
                    <Text style={s.statLabel}>MTOW</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{drone.serialNumber.slice(-6)}</Text>
                    <Text style={s.statLabel}>Serial</Text>
                  </View>
                </View>

                <View style={s.tagsRow}>
                  {drone.registrationNumber && (
                    <StatusBadge label={drone.registrationNumber} variant="safe" small />
                  )}
                  {requiresReg && !drone.registrationNumber && (
                    <StatusBadge label="Sin matricula" variant="danger" small />
                  )}
                  <StatusBadge
                    label={drone.isActive ? 'Activo' : 'Inactivo'}
                    variant={drone.isActive ? 'safe' : 'danger'}
                    small
                  />
                </View>
              </Card>
              </AnimatedListItem>
            );
          })}

          {drones.length === 0 && !isLoading && (
            <TouchableOpacity style={s.emptyState} onPress={() => navigation.navigate('RegisterDrone')}>
              <Ionicons name="airplane-outline" size={48} color={colors.textSecondary} />
              <Text style={s.emptyText}>No hay drones registrados</Text>
              <Text style={s.emptySubtext}>Toca para registrar tu primer drone</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
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
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  headerBtns: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  droneHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  droneInfo: {
    flex: 1,
  },
  droneName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  droneSerial: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row' as const,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stat: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row' as const,
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center' as const,
  },
});
