import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useHaptic } from '../../hooks/useHaptic';
import { useFlightStore } from '../../store/slices/flightSlice';
import { useFleetStore } from '../../store/slices/fleetSlice';
import * as Location from 'expo-location';

export function ActiveFlightScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const haptic = useHaptic();
  const { activeFlight, startFlight, endFlight, currentTelemetry, updateTelemetry, sendTelemetry } = useFlightStore();
  const { selectedDroneId, drones, pilot } = useFleetStore();
  const selectedDrone = drones.find((d) => d.id === selectedDroneId);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const telemetryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeFlight) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - new Date(activeFlight.takeoffTime).getTime()) / 1000,
        );
        setElapsedSeconds(elapsed);
      }, 1000);

      // Real GPS telemetry - read device location and send to backend
      telemetryRef.current = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          const telemetryData = {
            timestamp: Date.now(),
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            altitudeM: loc.coords.altitude ?? 0,
            speedMs: loc.coords.speed ?? 0,
            headingDeg: loc.coords.heading ?? 0,
            batteryPercent: 0, // Device battery - would need expo-battery
            signalStrength: 0,
            distanceFromPilotM: 0,
            satelliteCount: 0,
          };

          updateTelemetry(telemetryData);

          // Send to backend
          if (activeFlight?.id) {
            sendTelemetry(activeFlight.id, {
              timestamp: new Date(telemetryData.timestamp).toISOString(),
              latitude: telemetryData.latitude,
              longitude: telemetryData.longitude,
              altitudeAglM: telemetryData.altitudeM,
              speedMs: telemetryData.speedMs,
              headingDeg: telemetryData.headingDeg,
            }).catch(() => {}); // Fire and forget - don't block UI
          }
        } catch {
          // GPS not available - skip this tick
        }
      }, 3000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (telemetryRef.current) clearInterval(telemetryRef.current);
    };
  }, [activeFlight?.id]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const ss = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  const handleStartFlight = async () => {
    if (!selectedDrone || !pilot) {
      Alert.alert('Error', 'Seleccione un drone y configure su perfil primero');
      return;
    }
    try {
      let lat = 4.6782, lng = -74.0582;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      haptic.heavy();
      // Note: In production, missionId should come from a previously created mission
      // For MVP, we create a placeholder
      await startFlight({
        missionId: pilot.id, // Placeholder - should be actual mission ID
        droneId: selectedDrone.id,
        takeoffLat: lat,
        takeoffLng: lng,
        operationType: 'VLOS',
      });
      setElapsedSeconds(0);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo iniciar el vuelo');
    }
  };

  const handleEndFlight = () => {
    Alert.alert(
      'Finalizar Vuelo',
      'Esta seguro que desea finalizar el vuelo y registrarlo en la bitacora?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            haptic.error();
            if (activeFlight) {
              try {
                let lat = 4.6782, lng = -74.0582;
                try {
                  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                  lat = loc.coords.latitude;
                  lng = loc.coords.longitude;
                } catch {}
                await endFlight(activeFlight.id, { landingLat: lat, landingLng: lng });
                setElapsedSeconds(0);
              } catch (err: any) {
                Alert.alert('Error', err.message || 'No se pudo finalizar');
              }
            }
          },
        },
      ],
    );
  };

  // Pre-flight state
  if (!activeFlight) {
    return (
      <View style={s.container}>
        <View style={s.preFlightContainer}>
          <Text style={s.preFlightTitle}>Panel de Vuelo</Text>
          {selectedDrone ? (
            <View style={s.droneInfo}>
              <Text style={s.droneLabel}>Drone seleccionado:</Text>
              <Text style={s.droneName}>
                {selectedDrone.manufacturer} {selectedDrone.modelName}
              </Text>
              <Text style={s.droneSerial}>S/N: {selectedDrone.serialNumber}</Text>
            </View>
          ) : (
            <Text style={s.noDrone}>Seleccione un drone en la pestana Flota</Text>
          )}

          <TouchableOpacity
            style={[s.startBtn, !selectedDrone && s.startBtnDisabled]}
            onPress={handleStartFlight}
            disabled={!selectedDrone}
          >
            <Text style={s.startBtnText}>INICIAR VUELO</Text>
          </TouchableOpacity>

          <Text style={s.disclaimer}>
            Asegurese de haber completado el checklist pre-vuelo y la verificacion legal antes de despegar
          </Text>
        </View>
      </View>
    );
  }

  // Active flight HUD
  const tel = currentTelemetry;
  const batteryColor =
    (tel?.batteryPercent ?? 100) > 50
      ? colors.batteryFull
      : (tel?.batteryPercent ?? 100) > 20
        ? colors.batteryMedium
        : colors.batteryLow;

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.topItem}>
          <Text style={s.topLabel}>SAT</Text>
          <Text style={s.topValue}>{tel?.satelliteCount ?? '--'}</Text>
        </View>
        <View style={s.topItem}>
          <Text style={s.topLabel}>SIGNAL</Text>
          <Text style={[s.topValue, { color: (tel?.signalStrength ?? 100) > 50 ? colors.signalStrong : colors.signalWeak }]}>
            {tel?.signalStrength?.toFixed(0) ?? '--'}%
          </Text>
        </View>
        <View style={s.topItem}>
          <Text style={s.topLabel}>BAT</Text>
          <Text style={[s.topValue, { color: batteryColor }]}>
            {tel?.batteryPercent?.toFixed(0) ?? '--'}%
          </Text>
        </View>
      </View>

      {/* Flight timer */}
      <View style={s.timerContainer}>
        <Text style={s.timerLabel}>TIEMPO DE VUELO</Text>
        <Text style={s.timer}>{formatTime(elapsedSeconds)}</Text>
        <Text style={s.droneNameActive}>{selectedDrone?.manufacturer} {selectedDrone?.modelName}</Text>
      </View>

      {/* Telemetry gauges */}
      <View style={s.gaugesRow}>
        <TelemetryGauge
          styles={s}
          label="ALTITUD"
          value={tel?.altitudeM?.toFixed(0) ?? '--'}
          unit="m AGL"
          warn={(tel?.altitudeM ?? 0) > 120}
          max="123m"
        />
        <TelemetryGauge
          styles={s}
          label="DISTANCIA"
          value={tel?.distanceFromPilotM?.toFixed(0) ?? '--'}
          unit="m"
          warn={(tel?.distanceFromPilotM ?? 0) > 450}
          max="500m"
        />
      </View>

      <View style={s.gaugesRow}>
        <TelemetryGauge
          styles={s}
          label="VELOCIDAD"
          value={tel?.speedMs?.toFixed(1) ?? '--'}
          unit="m/s"
        />
        <TelemetryGauge
          styles={s}
          label="COORD"
          value={tel ? `${tel.latitude.toFixed(4)}` : '--'}
          unit={tel ? `${tel.longitude.toFixed(4)}` : ''}
          small
        />
      </View>

      {/* End flight button */}
      <TouchableOpacity style={s.endBtn} onPress={handleEndFlight}>
        <Text style={s.endBtnText}>FINALIZAR VUELO</Text>
      </TouchableOpacity>
    </View>
  );
}

function TelemetryGauge({
  styles: s,
  label,
  value,
  unit,
  warn,
  max,
  small,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
  max?: string;
  small?: boolean;
}) {
  return (
    <View style={[s.gauge_container, warn && s.gauge_containerWarn]}>
      <Text style={s.gauge_label}>{label}</Text>
      <Text style={[s.gauge_value, warn && s.gauge_valueWarn, small && s.gauge_valueSmall]}>
        {value}
      </Text>
      <Text style={s.gauge_unit}>{unit}</Text>
      {max && <Text style={s.gauge_max}>Max: {max}</Text>}
    </View>
  );
}

const createStyles = (theme: StyleTheme) => {
  const { colors } = theme;

  return {
    // --- Gauge styles ---
    gauge_container: {
      flex: 1,
      backgroundColor: colors.surface1,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.border,
    },
    gauge_containerWarn: {
      borderColor: colors.danger,
      borderWidth: 2,
    },
    gauge_label: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '600' as const,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
    gauge_value: {
      color: colors.textPrimary,
      fontSize: 36,
      fontWeight: '700' as const,
      fontVariant: ['tabular-nums'],
      marginTop: 4,
    },
    gauge_valueWarn: {
      color: colors.danger,
    },
    gauge_valueSmall: {
      fontSize: 18,
    },
    gauge_unit: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    gauge_max: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 4,
      fontStyle: 'italic' as const,
    },

    // --- Screen styles ---
    container: {
      flex: 1,
      backgroundColor: colors.surface0,
      padding: 16,
    },
    preFlightContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    preFlightTitle: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '700' as const,
      marginBottom: 24,
    },
    droneInfo: {
      alignItems: 'center' as const,
      marginBottom: 32,
    },
    droneLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    droneName: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '600' as const,
      marginTop: 4,
    },
    droneSerial: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    noDrone: {
      color: colors.warning,
      fontSize: 16,
      marginBottom: 32,
    },
    startBtn: {
      backgroundColor: colors.success,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 48,
      marginBottom: 16,
    },
    startBtnDisabled: {
      backgroundColor: colors.surface3,
    },
    startBtnText: {
      color: colors.textOnPrimary,
      fontSize: 20,
      fontWeight: '800' as const,
      letterSpacing: 1,
    },
    disclaimer: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: 'center' as const,
      paddingHorizontal: 32,
      marginTop: 8,
    },
    topBar: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      backgroundColor: colors.surface1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topItem: {
      alignItems: 'center' as const,
    },
    topLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '600' as const,
      letterSpacing: 1,
    },
    topValue: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '700' as const,
      fontVariant: ['tabular-nums'],
      marginTop: 2,
    },
    timerContainer: {
      alignItems: 'center' as const,
      marginBottom: 20,
    },
    timerLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: '600' as const,
    },
    timer: {
      color: colors.textPrimary,
      fontSize: 52,
      fontWeight: '700' as const,
      fontVariant: ['tabular-nums'],
      marginTop: 4,
    },
    droneNameActive: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
    },
    gaugesRow: {
      flexDirection: 'row' as const,
      gap: 12,
      marginBottom: 12,
    },
    endBtn: {
      backgroundColor: colors.danger,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center' as const,
      marginTop: 8,
    },
    endBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800' as const,
      letterSpacing: 1,
    },
  };
};
