import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { StatusBadge } from '../../components/common/StatusBadge';
import { geofenceApi } from '../../../services/api/geofenceApi';
import { buildAirspaceMapHtml } from '../../utils/airspaceMapHtml';

interface AirspaceZone {
  id: string;
  name: string;
  type: string;
  icaoCode: string | null;
  centerLat: number;
  centerLng: number;
  radiusM: number;
  geometry?: number[][][] | null;
  description?: string | null;
  source?: string;
}

interface AirspaceCheck {
  isRestricted: boolean;
  restrictedZones: AirspaceZone[];
  advisoryZones: AirspaceZone[];
  nearestAirportDistanceM?: number;
}

// Zone colors now in shared airspaceMapHtml utility


export function AirspaceMapScreen() {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [zones, setZones] = useState<AirspaceZone[]>([]);
  const [check, setCheck] = useState<AirspaceCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    let lat = 4.678, lng = -74.058;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
          new Promise<null>((_, reject) => setTimeout(() => reject('timeout'), 5000)),
        ]) as Location.LocationObject | null;
        if (loc) {
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      }
    } catch {}

    setLocation({ lat, lng });

    try {
      const [zonesData, checkData] = await Promise.all([
        geofenceApi.getZones(lat, lng, 50),
        geofenceApi.check(lat, lng),
      ]);
      setZones(zonesData);
      setCheck(checkData);
    } catch {
      // API failed - still show map with location, no zones
      setCheck({ isRestricted: false, restrictedZones: [], advisoryZones: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !location) {
    return (
      <View style={[s.container, s.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Consultando espacio aereo...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Status bar */}
      <View style={[s.statusBar, check?.isRestricted ? s.statusDanger : s.statusSafe]}>
        <View style={s.statusLeft}>
          <Text style={s.statusIcon}>{check?.isRestricted ? '!' : '\u2713'}</Text>
          <Text style={s.statusText}>
            {check?.isRestricted ? 'ZONA RESTRINGIDA' : 'ZONA LIBRE'}
          </Text>
        </View>
        {check?.nearestAirportDistanceM && (
          <Text style={s.distText}>
            ARP: {(check.nearestAirportDistanceM / 1000).toFixed(1)}km
          </Text>
        )}
      </View>

      {/* Map via WebView + Leaflet */}
      <WebView
        style={s.map}
        originWhitelist={['*']}
        source={{ html: buildAirspaceMapHtml(location.lat, location.lng, zones, colors.mapTileUrl, { zoom: 12, showLegend: true }) }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
      />

      {/* Restricted zones overlay */}
      {check?.restrictedZones && check.restrictedZones.length > 0 && (
        <View style={s.alertOverlay}>
          {check.restrictedZones.map((zone) => (
            <View key={zone.id} style={s.alertItem}>
              <View style={[s.alertDot, { backgroundColor: '#FF1744' }]} />
              <Text style={s.alertText} numberOfLines={1}>
                {zone.name}
                {zone.icaoCode ? ` (${zone.icaoCode})` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Refresh */}
      <TouchableOpacity style={s.refreshBtn} onPress={loadData}>
        <Text style={s.refreshText}>Actualizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: { flex: 1, backgroundColor: colors.surface0 },
  centered: { justifyContent: 'center' as const, alignItems: 'center' as const },
  loadingText: { color: colors.textSecondary, marginTop: 12, fontSize: 14 },
  statusBar: {
    flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  statusSafe: { backgroundColor: 'rgba(105,240,174,0.15)' },
  statusDanger: { backgroundColor: 'rgba(255,82,82,0.15)' },
  statusLeft: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  statusIcon: { fontSize: 18, fontWeight: '900' as const, color: colors.textPrimary },
  statusText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' as const },
  distText: { color: colors.textSecondary, fontSize: 13, fontVariant: ['tabular-nums'] },
  map: { flex: 1 },
  alertOverlay: {
    position: 'absolute' as const, top: 50, left: 8, right: 8,
    backgroundColor: 'rgba(10,10,15,0.92)', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: colors.danger,
  },
  alertItem: { flexDirection: 'row' as const, alignItems: 'center' as const, marginVertical: 2 },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  alertText: { color: colors.textPrimary, fontSize: 12, flex: 1 },
  refreshBtn: {
    position: 'absolute' as const, bottom: 20, right: 16,
    backgroundColor: colors.primary, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  refreshText: { color: colors.textOnPrimary, fontSize: 13, fontWeight: '600' as const },
});
