import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Alert, TextInput, Dimensions, Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { useHaptic } from '../../hooks/useHaptic';
import { useTelemetryStream } from '../../hooks/useTelemetryStream';
import { TelemetrySource } from '../../../core/enums';
import { useFlightStore, TelemetryData } from '../../store/slices/flightSlice';
import { useFleetStore } from '../../store/slices/fleetSlice';
import { buildLiveFlightMapHtml } from '../../utils/liveFlightMapHtml';
import { geofenceApi } from '../../../services/api/geofenceApi';
import { syncManager } from '../../../infrastructure/sync/SyncManager';
import { container, DI_TOKENS } from '../../../infrastructure/di/Container';
import type { ITelemetryProvider } from '../../../core/ports/outbound';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.38;

interface ProximityAlert {
  zoneName: string;
  zoneType: string;
  distanceM: number;
  level: 'warning' | 'danger';
}

export function ActiveFlightScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const haptic = useHaptic();
  const { activeFlight, startFlight, endFlight, currentTelemetry, updateTelemetry, sendTelemetry } = useFlightStore();
  const { selectedDroneId, drones, pilot } = useFleetStore();
  const selectedDrone = drones.find((d) => d.id === selectedDroneId);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webViewRef = useRef<WebView>(null);
  const lastBackendSendRef = useRef<number>(0);

  // Telemetry stream via DI — auto-switches DJI (100ms) / GPS (3s)
  const { reading, source, productName } = useTelemetryStream(
    activeFlight?.id ?? null,
    activeFlight ? { latitude: activeFlight.takeoffLat, longitude: activeFlight.takeoffLng } : null,
  );

  // Map & zones
  const [mapHtml, setMapHtml] = useState<string | null>(null);
  const [zonesFromCache, setZonesFromCache] = useState(false);

  // Proximity alert
  const [proximityAlert, setProximityAlert] = useState<ProximityAlert | null>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Editable gauges
  const [editingGauge, setEditingGauge] = useState<string | null>(null);
  const [manualAlt, setManualAlt] = useState<string | null>(null);
  const [manualDist, setManualDist] = useState<string | null>(null);

  // Load zones and build map when flight starts
  useEffect(() => {
    if (activeFlight) {
      loadMapWithZones();
    }
  }, [activeFlight?.id]);

  const loadMapWithZones = async () => {
    const lat = currentTelemetry?.latitude ?? 4.6782;
    const lng = currentTelemetry?.longitude ?? -74.0582;
    const cacheKey = `flight_zones_${lat.toFixed(1)}_${lng.toFixed(1)}`;

    let zones: any[] = [];
    let fromCache = false;

    try {
      const result = await syncManager.fetchWithFallback<any[]>(cacheKey, () =>
        geofenceApi.getZones(lat, lng, 10),
      );
      if (result) {
        zones = result.data;
        fromCache = result.fromCache;
      }
    } catch {
      // No zones available - render map without zones
    }

    setZonesFromCache(fromCache);
    const html = buildLiveFlightMapHtml(lat, lng, zones, colors.mapTileUrl, { fromCache });
    setMapHtml(html);
  };

  // Timer interval
  useEffect(() => {
    if (activeFlight) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - new Date(activeFlight.takeoffTime).getTime()) / 1000,
        );
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeFlight?.id]);

  // Sync telemetry reading → store + map + backend (throttled)
  useEffect(() => {
    if (!reading || !activeFlight) return;

    const telemetryData: TelemetryData = {
      timestamp: reading.timestamp,
      latitude: reading.position.latitude,
      longitude: reading.position.longitude,
      altitudeM: reading.altitudeAglM,
      speedMs: reading.speedMs,
      headingDeg: reading.headingDeg,
      batteryPercent: reading.batteryPercent,
      signalStrength: reading.signalStrength,
      distanceFromPilotM: reading.distanceFromPilotM,
      satelliteCount: reading.satelliteCount,
    };

    updateTelemetry(telemetryData);

    // Update map position
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'updatePosition',
      lat: reading.position.latitude,
      lng: reading.position.longitude,
      heading: reading.headingDeg,
    }));

    // Backend throttled to every 3s (DJI emits at 100ms, GPS at 3s)
    const now = Date.now();
    if (now - lastBackendSendRef.current >= 3000) {
      lastBackendSendRef.current = now;
      sendTelemetry(activeFlight.id, {
        timestamp: new Date(reading.timestamp).toISOString(),
        latitude: reading.position.latitude,
        longitude: reading.position.longitude,
        altitudeAglM: reading.altitudeAglM,
        speedMs: reading.speedMs,
        headingDeg: reading.headingDeg,
      }).catch(() => {});
    }
  }, [reading]);

  // Handle WebView messages (proximity alerts)
  const onWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'proximityAlert') {
        const level: 'warning' | 'danger' = msg.distanceM < 200 ? 'danger' : 'warning';

        if (level === 'danger') {
          haptic.error();
        } else {
          haptic.warning();
        }

        setProximityAlert({
          zoneName: msg.zoneName,
          zoneType: msg.zoneType,
          distanceM: msg.distanceM,
          level,
        });

        // Auto-hide after 5s
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setProximityAlert(null), 5000);
      }
    } catch {}
  }, []);

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
      try {
        const gpsProvider = container.resolve<ITelemetryProvider>(DI_TOKENS.GpsTelemetryProvider);
        const initialReading = await gpsProvider.getCurrentReading();
        lat = initialReading.position.latitude;
        lng = initialReading.position.longitude;
      } catch {
        // Fallback to default Bogota coordinates if GPS unavailable
      }
      haptic.heavy();
      await startFlight({
        missionId: pilot.id,
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
                  const gpsProvider = container.resolve<ITelemetryProvider>(DI_TOKENS.GpsTelemetryProvider);
                  const landingReading = await gpsProvider.getCurrentReading();
                  lat = landingReading.position.latitude;
                  lng = landingReading.position.longitude;
                } catch {}
                await endFlight(activeFlight.id, { landingLat: lat, landingLng: lng });
                setElapsedSeconds(0);
                setMapHtml(null);
              } catch (err: any) {
                Alert.alert('Error', err.message || 'No se pudo finalizar');
              }
            }
          },
        },
      ],
    );
  };

  const handleGaugeSave = (gauge: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) { setEditingGauge(null); return; }

    if (gauge === 'alt') setManualAlt(value);
    if (gauge === 'dist') setManualDist(value);
    setEditingGauge(null);
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

  const displayAlt = manualAlt ?? tel?.altitudeM?.toFixed(0) ?? '--';
  const displayDist = manualDist ?? tel?.distanceFromPilotM?.toFixed(0) ?? '--';
  const isAltManual = manualAlt !== null;
  const isDistManual = manualDist !== null;

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.topItem}>
          <Text style={s.topLabel}>SRC</Text>
          <Text style={[s.topValue, {
            color: source === TelemetrySource.DJI_DRONE ? colors.success : colors.warning,
          }]}>
            {source === TelemetrySource.DJI_DRONE ? 'DJI' : 'GPS'}
          </Text>
        </View>
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

      {/* Live Map */}
      <View style={s.mapContainer}>
        {mapHtml ? (
          <WebView
            ref={webViewRef}
            style={s.map}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            onMessage={onWebViewMessage}
          />
        ) : (
          <View style={[s.map, s.mapLoading]}>
            <Ionicons name="map-outline" size={32} color={colors.textSecondary} />
            <Text style={s.mapLoadingText}>Cargando mapa...</Text>
          </View>
        )}

        {/* Proximity alert banner */}
        {proximityAlert && (
          <View style={[s.alertBanner, proximityAlert.level === 'danger' ? s.alertBannerDanger : s.alertBannerWarning]}>
            <Ionicons
              name={proximityAlert.level === 'danger' ? 'close-circle' : 'warning'}
              size={18}
              color="#FFF"
            />
            <Text style={s.alertText}>
              {proximityAlert.level === 'danger' ? 'ZONA RESTRINGIDA' : 'ACERCANDOSE'} - {proximityAlert.zoneName} ({proximityAlert.distanceM}m)
            </Text>
          </View>
        )}
      </View>

      {/* Timer row */}
      <View style={s.timerRow}>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={s.timer}>{formatTime(elapsedSeconds)}</Text>
        <Text style={s.droneNameActive}>
          {productName ?? `${selectedDrone?.manufacturer} ${selectedDrone?.modelName}`}
        </Text>
      </View>

      {/* Compact gauges - 3 in a row, ALT and DIST editable */}
      <View style={s.gaugesRow}>
        <EditableGauge
          label="ALT"
          value={displayAlt}
          unit="m"
          isManual={isAltManual}
          isEditing={editingGauge === 'alt'}
          warn={parseFloat(displayAlt) > 120}
          onTap={() => setEditingGauge('alt')}
          onSave={(v: string) => handleGaugeSave('alt', v)}
          onCancel={() => setEditingGauge(null)}
          s={s}
          colors={colors}
        />
        <EditableGauge
          label="DIST"
          value={displayDist}
          unit="m"
          isManual={isDistManual}
          isEditing={editingGauge === 'dist'}
          warn={parseFloat(displayDist) > 450}
          onTap={() => setEditingGauge('dist')}
          onSave={(v: string) => handleGaugeSave('dist', v)}
          onCancel={() => setEditingGauge(null)}
          s={s}
          colors={colors}
        />
        <View style={s.gaugeCompact}>
          <Text style={s.gaugeLabel}>VEL</Text>
          <Text style={s.gaugeValue}>{tel?.speedMs?.toFixed(1) ?? '--'}</Text>
          <Text style={s.gaugeUnit}>m/s</Text>
        </View>
      </View>

      {/* End flight button */}
      <TouchableOpacity style={s.endBtn} onPress={handleEndFlight}>
        <Text style={s.endBtnText}>FINALIZAR VUELO</Text>
      </TouchableOpacity>
    </View>
  );
}

// Editable gauge component
function EditableGauge({ label, value, unit, isManual, isEditing, warn, onTap, onSave, onCancel, s, colors }: any) {
  const [inputValue, setInputValue] = useState(value === '--' ? '' : value);

  if (isEditing) {
    return (
      <View style={[s.gaugeCompact, s.gaugeEditing]}>
        <Text style={s.gaugeLabel}>{label}</Text>
        <TextInput
          style={s.gaugeInput}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
          autoFocus
          selectTextOnFocus
          onSubmitEditing={() => onSave(inputValue)}
          onBlur={() => onCancel()}
        />
        <Text style={s.gaugeUnit}>{unit}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[s.gaugeCompact, isManual && s.gaugeManual, warn && s.gaugeWarn]}
      onPress={onTap}
      activeOpacity={0.7}
    >
      <View style={s.gaugeLabelRow}>
        <Text style={s.gaugeLabel}>{label}</Text>
        <Ionicons name="pencil" size={8} color={colors.textDisabled} />
      </View>
      <Text style={[s.gaugeValue, warn && { color: colors.danger }]}>{value}</Text>
      <Text style={s.gaugeUnit}>{unit}{isManual ? ' (manual)' : ''}</Text>
    </TouchableOpacity>
  );
}

const createStyles = ({ colors, spacing, borderRadius }: StyleTheme) => ({
  container: { flex: 1, backgroundColor: colors.surface0 },

  // Pre-flight
  preFlightContainer: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, padding: 16 },
  preFlightTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const, marginBottom: 24 },
  droneInfo: { alignItems: 'center' as const, marginBottom: 32 },
  droneLabel: { color: colors.textSecondary, fontSize: 14 },
  droneName: { color: colors.textPrimary, fontSize: 20, fontWeight: '600' as const, marginTop: 4 },
  droneSerial: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  noDrone: { color: colors.warning, fontSize: 16, marginBottom: 32 },
  startBtn: { backgroundColor: colors.success, borderRadius: 16, paddingVertical: 20, paddingHorizontal: 48, marginBottom: 16 },
  startBtnDisabled: { backgroundColor: colors.surface3 },
  startBtnText: { color: colors.textOnPrimary, fontSize: 20, fontWeight: '800' as const, letterSpacing: 1 },
  disclaimer: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' as const, paddingHorizontal: 32, marginTop: 8 },

  // Top bar
  topBar: {
    flexDirection: 'row' as const, justifyContent: 'space-around' as const,
    backgroundColor: colors.surface1, paddingVertical: 8, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  topItem: { alignItems: 'center' as const },
  topLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '600' as const, letterSpacing: 1 },
  topValue: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' as const, fontVariant: ['tabular-nums'], marginTop: 1 },

  // Map
  mapContainer: { height: MAP_HEIGHT, position: 'relative' as const },
  map: { flex: 1 },
  mapLoading: { justifyContent: 'center' as const, alignItems: 'center' as const, backgroundColor: colors.surface1 },
  mapLoadingText: { color: colors.textSecondary, fontSize: 13, marginTop: 8 },

  // Proximity alert
  alertBanner: {
    position: 'absolute' as const, bottom: 0, left: 0, right: 0,
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  alertBannerDanger: { backgroundColor: 'rgba(255,23,68,0.95)' },
  alertBannerWarning: { backgroundColor: 'rgba(255,234,0,0.9)' },
  alertText: { color: '#FFF', fontSize: 13, fontWeight: '700' as const, flex: 1 },

  // Timer row
  timerRow: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'center' as const, gap: 8,
    paddingVertical: 8, backgroundColor: colors.surface1,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  timer: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' as const, fontVariant: ['tabular-nums'] },
  droneNameActive: { color: colors.textSecondary, fontSize: 12 },

  // Gauges
  gaugesRow: { flexDirection: 'row' as const, gap: 8, padding: 8, flex: 1 },
  gaugeCompact: {
    flex: 1, backgroundColor: colors.surface1, borderRadius: borderRadius.lg,
    padding: 10, alignItems: 'center' as const, justifyContent: 'center' as const,
    borderWidth: 1, borderColor: colors.border,
  },
  gaugeManual: { borderColor: colors.primary, borderWidth: 1.5 },
  gaugeEditing: { borderColor: colors.primary, borderWidth: 2 },
  gaugeWarn: { borderColor: colors.danger, borderWidth: 2 },
  gaugeLabelRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
  gaugeLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '600' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
  gaugeValue: { color: colors.textPrimary, fontSize: 28, fontWeight: '700' as const, fontVariant: ['tabular-nums'], marginTop: 2 },
  gaugeUnit: { color: colors.textSecondary, fontSize: 10, marginTop: 1 },
  gaugeInput: {
    color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const,
    textAlign: 'center' as const, borderBottomWidth: 2, borderBottomColor: colors.primary,
    paddingVertical: 2, minWidth: 60,
  },

  // End button
  endBtn: {
    backgroundColor: colors.danger, paddingVertical: 14,
    alignItems: 'center' as const, margin: 8, borderRadius: borderRadius.lg,
  },
  endBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' as const, letterSpacing: 1 },
});
