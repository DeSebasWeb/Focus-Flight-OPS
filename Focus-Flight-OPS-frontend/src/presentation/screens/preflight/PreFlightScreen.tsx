import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { buildAirspaceMapHtml } from '../../utils/airspaceMapHtml';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFleetStore } from '../../store/slices/fleetSlice';
import { weatherApi } from '../../../services/api/weatherApi';
import { geofenceApi } from '../../../services/api/geofenceApi';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.45;

interface WeatherInfo {
  temperatureC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirectionDeg: number;
  humidityPercent: number;
  visibility: string;
  visibilityKm: number;
  precipitation: boolean;
  thunderstorm: boolean;
  cloudCoverPercent: number;
  kIndex: number | null;
  pressureHpa: number;
}

interface AirspaceZone {
  id: string; name: string; type: string; icaoCode: string | null;
  centerLat: number; centerLng: number; radiusM: number;
  geometry?: number[][][] | null; description?: string | null; source?: string;
}

interface AirspaceCheck {
  isRestricted: boolean;
  restrictedZones: AirspaceZone[];
  nearestAirportDistanceM?: number;
}


const createStyles = (t: StyleTheme) => ({
  // Main layout
  container: {
    flex: 1 as const,
    backgroundColor: t.colors.surface0,
  },
  content: {
    paddingBottom: 100,
  },
  // Map
  mapContainer: {
    height: MAP_HEIGHT,
    position: 'relative' as const,
  },
  map: {
    flex: 1 as const,
  },
  mapLoading: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: t.colors.surface1,
  },
  mapOverlay: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    gap: 6,
  },
  mapBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeSafe: {
    backgroundColor: 'rgba(105,240,174,0.9)' as const,
  },
  badgeDanger: {
    backgroundColor: 'rgba(255,82,82,0.9)' as const,
  },
  mapBadgeText: {
    color: '#FFF' as const,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  mapBadge2: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(10,10,15,0.8)' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mapBadge2Text: {
    color: t.colors.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  coordsOverlay: {
    position: 'absolute' as const,
    bottom: 8,
    left: 12,
    backgroundColor: 'rgba(10,10,15,0.8)' as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coordsText: {
    color: t.colors.textSecondary,
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  expandBtn: {
    position: 'absolute' as const,
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(10,10,15,0.8)' as const,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  // Sections
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: t.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1 as const,
  },
  // Weather grid
  weatherGrid: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 12,
  },
  weatherDetailRow: {
    flexDirection: 'row' as const,
    gap: 4,
    marginBottom: 8,
  },
  weatherDetail: {
    flex: 1 as const,
    alignItems: 'center' as const,
    backgroundColor: t.colors.surface1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  detailLabel: {
    color: t.colors.textDisabled,
    fontSize: 9,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  detailValue: {
    color: t.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  warningBox: {
    backgroundColor: 'rgba(255,215,64,0.08)' as const,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,64,0.3)' as const,
    marginTop: 4,
  },
  // Weather card
  wCard: {
    flex: 1 as const,
    backgroundColor: t.colors.surface2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center' as const,
    minWidth: '22%' as const,
  },
  wCardDanger: {
    borderWidth: 1,
    borderColor: t.colors.danger,
  },
  wValue: {
    color: t.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700' as const,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  wValueDanger: {
    color: t.colors.danger,
  },
  wUnit: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: t.colors.textSecondary,
  },
  wLabel: {
    color: t.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  warningItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 6,
  },
  warningText: {
    color: t.colors.warning,
    fontSize: 12,
    flex: 1 as const,
  },
  // Check items
  checkItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.divider,
  },
  checkItemFail: {},
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconPass: {
    backgroundColor: t.colors.success,
  },
  iconFail: {
    backgroundColor: t.colors.danger,
  },
  checkItemContent: {
    flex: 1 as const,
  },
  checkItemTitle: {
    color: t.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  checkItemSub: {
    color: t.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  checkItemSubFail: {
    color: t.colors.danger,
  },
  // Actions
  actionsSection: {
    padding: 16,
    gap: 10,
  },
  missionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: t.colors.surface1,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: t.colors.primary,
  },
  missionBtnText: {
    color: t.colors.primary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  proceedBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: t.colors.success,
    borderRadius: 12,
    paddingVertical: 16,
  },
  proceedBtnText: {
    color: t.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
  },

  // Kp Index
  kpRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  kpValueBox: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
  },
  kpValue: {
    color: t.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  kpScale: {
    color: t.colors.textDisabled,
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 2,
  },
  kpMessage: {
    color: t.colors.textSecondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  kpDanger: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.colors.danger,
  },
  kpDangerText: {
    color: t.colors.danger,
    fontSize: 12,
    fontWeight: '600' as const,
    flex: 1,
  },
});

export function PreFlightScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const { pilot, drones, selectedDroneId, certificates, insurance, fetchAll } = useFleetStore();
  const selectedDrone = drones.find((d) => d.id === selectedDroneId);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [zones, setZones] = useState<AirspaceZone[]>([]);
  const [airspaceCheck, setAirspaceCheck] = useState<AirspaceCheck | null>(null);
  const [kpIndex, setKpIndex] = useState<{ current: number; level: string; flyable: boolean; message: string; noaaScale: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    fetchAll();

    let lat = 4.678, lng = -74.058;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
          new Promise<null>((_, rej) => setTimeout(() => rej('timeout'), 5000)),
        ]) as Location.LocationObject | null;
        if (loc) { lat = loc.coords.latitude; lng = loc.coords.longitude; }
      }
    } catch {}
    setLocation({ lat, lng });

    try {
      const [w, z, c, kp] = await Promise.all([
        weatherApi.getCurrent(lat, lng),
        geofenceApi.getZones(lat, lng, 50),
        geofenceApi.check(lat, lng),
        weatherApi.getKpIndex().catch(() => null),
      ]);
      setWeather(w);
      setZones(z);
      setAirspaceCheck(c);
      if (kp) setKpIndex(kp);
    } catch {}
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, []);

  // Verification checks
  const droneOk = selectedDrone ? (selectedDrone.mtowGrams < 200 || !!selectedDrone.registrationNumber) : false;
  const certOk = certificates.some((c) => c.isValid && new Date(c.expiryDate).getTime() > Date.now());
  const insOk = insurance ? insurance.isActive && new Date(insurance.endDate).getTime() > Date.now() : false;
  const airspaceOk = airspaceCheck ? !airspaceCheck.isRestricted : true;
  const windOk = weather ? weather.windSpeedKmh <= 40 : true;
  const visOk = weather ? weather.visibility !== 'POOR' : true;
  const noStorm = weather ? !weather.thunderstorm : true;
  const weatherOk = windOk && visOk && noStorm;
  const allPassed = droneOk && certOk && insOk && airspaceOk && weatherOk;

  const windDir = (deg: number) => {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const [mapExpanded, setMapExpanded] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const mapHeight = mapExpanded ? SCREEN_HEIGHT * 0.85 : MAP_HEIGHT;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface1}
        />
      }
    >
      {/* ===== MAP SECTION ===== */}
      <View
        style={[s.mapContainer, { height: mapHeight }]}
        onTouchStart={() => setScrollEnabled(false)}
        onTouchEnd={() => setScrollEnabled(true)}
        onTouchCancel={() => setScrollEnabled(true)}
      >
        {location ? (
          <WebView
            style={s.map}
            originWhitelist={['*']}
            source={{ html: buildAirspaceMapHtml(location.lat, location.lng, zones, colors.mapTileUrl) }}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled
            nestedScrollEnabled
          />
        ) : (
          <View style={[s.map, s.mapLoading]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        {/* Overlay status */}
        <View style={s.mapOverlay}>
          <View style={[s.mapBadge, airspaceOk ? s.badgeSafe : s.badgeDanger]}>
            <Ionicons name={airspaceOk ? 'checkmark-circle' : 'close-circle'} size={16} color="#FFF" />
            <Text style={s.mapBadgeText}>
              {airspaceOk ? 'ZONA LIBRE' : 'RESTRINGIDA'}
            </Text>
          </View>
          {airspaceCheck?.nearestAirportDistanceM && (
            <View style={s.mapBadge2}>
              <Ionicons name="airplane" size={12} color={colors.textSecondary} />
              <Text style={s.mapBadge2Text}>
                ARP {(airspaceCheck.nearestAirportDistanceM / 1000).toFixed(1)}km
              </Text>
            </View>
          )}
        </View>
        {location && (
          <View style={s.coordsOverlay}>
            <Text style={s.coordsText}>
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </Text>
          </View>
        )}
        {/* Expand/Collapse button */}
        <TouchableOpacity
          style={s.expandBtn}
          onPress={() => setMapExpanded(!mapExpanded)}
        >
          <Ionicons name={mapExpanded ? 'contract' : 'expand'} size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ===== WEATHER SECTION ===== */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Ionicons name="cloud" size={20} color={colors.primary} />
          <Text style={s.sectionTitle}>Condiciones Meteorologicas</Text>
          <StatusBadge
            label={weatherOk ? 'APTO' : 'RIESGO'}
            variant={weatherOk ? 'safe' : 'danger'}
            small
          />
        </View>

        {loading || !weather ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <>
            <View style={s.weatherGrid}>
              <WeatherCard
                icon="thermometer-outline"
                value={`${weather.temperatureC.toFixed(0)}°`}
                label="Temperatura"
                unit="C"
                s={s}
                colors={colors}
              />
              <WeatherCard
                icon="speedometer-outline"
                value={`${weather.windSpeedKmh.toFixed(0)}`}
                label="Viento"
                unit="km/h"
                danger={!windOk}
                s={s}
                colors={colors}
              />
              <WeatherCard
                icon="eye-outline"
                value={`${weather.visibilityKm.toFixed(0)}`}
                label="Visibilidad"
                unit="km"
                danger={!visOk}
                s={s}
                colors={colors}
              />
              <WeatherCard
                icon="water-outline"
                value={`${weather.humidityPercent}`}
                label="Humedad"
                unit="%"
                s={s}
                colors={colors}
              />
            </View>

            <View style={s.weatherDetailRow}>
              <View style={s.weatherDetail}>
                <Text style={s.detailLabel}>Rafagas</Text>
                <Text style={s.detailValue}>{weather.windGustKmh.toFixed(0)} km/h</Text>
              </View>
              <View style={s.weatherDetail}>
                <Text style={s.detailLabel}>Direccion</Text>
                <Text style={s.detailValue}>{windDir(weather.windDirectionDeg)}</Text>
              </View>
              <View style={s.weatherDetail}>
                <Text style={s.detailLabel}>Presion</Text>
                <Text style={s.detailValue}>{weather.pressureHpa.toFixed(0)} hPa</Text>
              </View>
              <View style={s.weatherDetail}>
                <Text style={s.detailLabel}>Nubes</Text>
                <Text style={s.detailValue}>{weather.cloudCoverPercent}%</Text>
              </View>
            </View>

            {/* Weather warnings */}
            {(!windOk || !visOk || !noStorm || weather.precipitation) && (
              <View style={s.warningBox}>
                {!windOk && (
                  <WarningItem text={`Viento ${weather.windSpeedKmh.toFixed(0)} km/h excede limite de 40 km/h`} s={s} colors={colors} />
                )}
                {!noStorm && <WarningItem text="Actividad de tormentas detectada" s={s} colors={colors} />}
                {!visOk && <WarningItem text="Visibilidad pobre - vuelo no recomendado" s={s} colors={colors} />}
                {weather.precipitation && <WarningItem text="Precipitacion activa en la zona" s={s} colors={colors} />}
              </View>
            )}
          </>
        )}
      </View>

      {/* ===== KP INDEX SECTION ===== */}
      {kpIndex && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="magnet" size={20} color={kpIndex.flyable ? colors.primary : colors.danger} />
            <Text style={s.sectionTitle}>Indice Kp Geomagnetico</Text>
            <StatusBadge
              label={kpIndex.level === 'quiet' ? 'ESTABLE' : kpIndex.level === 'unsettled' ? 'INESTABLE' : 'TORMENTA'}
              variant={kpIndex.level === 'quiet' ? 'safe' : kpIndex.level === 'unsettled' ? 'warning' : 'danger'}
              small
            />
          </View>
          <View style={s.kpRow}>
            <View style={s.kpValueBox}>
              <Text style={[s.kpValue, !kpIndex.flyable && { color: colors.danger }]}>{kpIndex.current.toFixed(1)}</Text>
              <Text style={s.kpScale}>/9</Text>
            </View>
            <Text style={s.kpMessage}>{kpIndex.message}</Text>
          </View>
          {!kpIndex.flyable && (
            <View style={s.kpDanger}>
              <Ionicons name="warning" size={14} color={colors.danger} />
              <Text style={s.kpDangerText}>GPS y compas pueden fallar. NO VOLAR.</Text>
            </View>
          )}
        </View>
      )}

      {/* ===== LEGAL VERIFICATION SECTION ===== */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={s.sectionTitle}>Verificacion Legal RAC 100</Text>
          <StatusBadge
            label={allPassed ? 'APROBADO' : 'PENDIENTE'}
            variant={allPassed ? 'safe' : 'warning'}
            small
          />
        </View>

        <CheckItem
          title="Aeronave Registrada"
          subtitle={selectedDrone
            ? `${selectedDrone.manufacturer || ''} ${selectedDrone.modelName || ''} (${selectedDrone.mtowGrams}g)`
            : 'Sin drone seleccionado'}
          passed={droneOk}
          icon="airplane"
          s={s}
          colors={colors}
        />
        <CheckItem
          title="Certificado Piloto UAEAC"
          subtitle={certOk ? 'Certificado vigente' : 'Sin certificado vigente'}
          passed={certOk}
          icon="ribbon"
          s={s}
          colors={colors}
        />
        <CheckItem
          title="Poliza RC Extracontractual"
          subtitle={insOk && insurance ? `${insurance.insurerName}` : 'Sin poliza vigente'}
          passed={insOk}
          icon="document-text"
          s={s}
          colors={colors}
        />
        <CheckItem
          title="Espacio Aereo"
          subtitle={airspaceOk ? 'Fuera de zonas restringidas' : 'Zona restringida detectada'}
          passed={airspaceOk}
          icon="globe"
          s={s}
          colors={colors}
        />
        <CheckItem
          title="Condiciones Meteorologicas"
          subtitle={weatherOk ? 'Condiciones aptas para vuelo' : 'Condiciones adversas'}
          passed={weatherOk}
          icon="partly-sunny"
          s={s}
          colors={colors}
        />
      </View>

      {/* Action buttons */}
      <View style={s.actionsSection}>
        <TouchableOpacity
          style={s.missionBtn}
          onPress={() => navigation.navigate('CreateMission')}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={s.missionBtnText}>Crear Nueva Mision</Text>
        </TouchableOpacity>

        {allPassed && (
          <TouchableOpacity
            style={s.proceedBtn}
            onPress={() => navigation.getParent()?.navigate('ChecklistTab')}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={s.proceedBtnText}>Proceder al Checklist</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function WeatherCard({ icon, value, label, unit, danger, s, colors }: any) {
  return (
    <View style={[s.wCard, danger && s.wCardDanger]}>
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.textSecondary} />
      <Text style={[s.wValue, danger && s.wValueDanger]}>
        {value}<Text style={s.wUnit}>{unit}</Text>
      </Text>
      <Text style={s.wLabel}>{label}</Text>
    </View>
  );
}

function WarningItem({ text, s, colors }: { text: string; s: any; colors: any }) {
  return (
    <View style={s.warningItem}>
      <Ionicons name="warning" size={14} color={colors.warning} />
      <Text style={s.warningText}>{text}</Text>
    </View>
  );
}

function CheckItem({ title, subtitle, passed, icon, s, colors }: any) {
  return (
    <View style={[s.checkItem, !passed && s.checkItemFail]}>
      <View style={[s.iconCircle, passed ? s.iconPass : s.iconFail]}>
        <Ionicons name={passed ? 'checkmark' : 'close'} size={14} color="#FFF" />
      </View>
      <View style={s.checkItemContent}>
        <Text style={s.checkItemTitle}>{title}</Text>
        <Text style={[s.checkItemSub, !passed && s.checkItemSubFail]}>{subtitle}</Text>
      </View>
      <Ionicons name={icon} size={18} color={passed ? colors.success : colors.danger} />
    </View>
  );
}
