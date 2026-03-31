import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { weatherApi } from '../../../services/api/weatherApi';
import * as Location from 'expo-location';
import type { ThemeColors } from '../../theme/colors';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  humidity: number;
  visibility: string;
  visibilityKm: number;
  precipitation: boolean;
  thunderstorm: boolean;
  cloudCover: number;
  kIndex: number | null;
  pressure: number;
}

interface MetricRowProps {
  label: string;
  value: string;
  safe: boolean;
  s: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}

function MetricRow({ label, value, safe, s, colors }: MetricRowProps) {
  return (
    <View style={s.metricRow}>
      <Text style={s.metricLabel}>{label}</Text>
      <View style={s.metricRight}>
        <Text style={[s.metricValue, !safe && s.dangerValue]}>{value}</Text>
        <View style={[s.indicator, { backgroundColor: safe ? colors.success : colors.danger }]} />
      </View>
    </View>
  );
}

export function WeatherBriefingScreen() {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    try {
      let lat = 4.678, lng = -74.058; // Default: Bogota
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      const data = await weatherApi.getCurrent(lat, lng);
      setWeather({
        temperature: data.temperatureC,
        windSpeed: data.windSpeedKmh,
        windGust: data.windGustKmh,
        windDirection: data.windDirectionDeg,
        humidity: data.humidityPercent,
        visibility: data.visibility,
        visibilityKm: data.visibilityKm,
        precipitation: data.precipitation,
        thunderstorm: data.thunderstorm,
        cloudCover: data.cloudCoverPercent,
        kIndex: data.kIndex,
        pressure: data.pressureHpa,
      });
    } catch {
      // Fallback if API fails
      setWeather({
        temperature: 0, windSpeed: 0, windGust: 0, windDirection: 0,
        humidity: 0, visibility: 'UNKNOWN', visibilityKm: 0,
        precipitation: false, thunderstorm: false, cloudCover: 0, kIndex: null, pressure: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !weather) {
    return (
      <View style={[s.container, { justifyContent: 'center' as const, alignItems: 'center' as const }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Cargando datos meteorologicos...</Text>
      </View>
    );
  }

  const windSafe = weather.windSpeed <= 40;
  const visibilitySafe = weather.visibility !== 'POBRE';
  const noThunderstorm = !weather.thunderstorm;
  const overallSafe = windSafe && visibilitySafe && noThunderstorm;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Briefing Meteorologico</Text>
      <Text style={s.subtitle}>Condiciones actuales en la zona de operacion</Text>

      <View style={s.statusBanner}>
        <StatusBadge
          label={overallSafe ? 'CONDICIONES APTAS PARA VUELO' : 'CONDICIONES ADVERSAS'}
          variant={overallSafe ? 'safe' : 'danger'}
        />
      </View>

      <Card title="Temperatura y Presion">
        <View style={s.bigValueRow}>
          <View style={s.bigValueItem}>
            <Text style={s.bigValue}>{weather.temperature}</Text>
            <Text style={s.bigUnit}>°C</Text>
          </View>
          <View style={s.bigValueItem}>
            <Text style={s.bigValue}>{weather.pressure}</Text>
            <Text style={s.bigUnit}>hPa</Text>
          </View>
        </View>
      </Card>

      <Card title="Viento" danger={!windSafe}>
        <View style={s.windRow}>
          <View style={s.windItem}>
            <Text style={s.windLabel}>Velocidad</Text>
            <Text style={[s.windValue, !windSafe && s.dangerValue]}>
              {weather.windSpeed} km/h
            </Text>
          </View>
          <View style={s.windItem}>
            <Text style={s.windLabel}>Rafagas</Text>
            <Text style={s.windValue}>{weather.windGust} km/h</Text>
          </View>
          <View style={s.windItem}>
            <Text style={s.windLabel}>Direccion</Text>
            <Text style={s.windValue}>{weather.windDirection}</Text>
          </View>
        </View>
        <View style={s.limitRow}>
          <Text style={s.limitText}>Limite: 40 km/h</Text>
          <StatusBadge
            label={windSafe ? 'OK' : 'EXCEDE LIMITE'}
            variant={windSafe ? 'safe' : 'danger'}
            small
          />
        </View>
      </Card>

      <Card title="Visibilidad y Nubes">
        <MetricRow label="Visibilidad" value={`${weather.visibilityKm} km - ${weather.visibility}`} safe={visibilitySafe} s={s} colors={colors} />
        <MetricRow label="Cobertura de nubes" value={`${weather.cloudCover}%`} safe={weather.cloudCover < 80} s={s} colors={colors} />
        <MetricRow label="Precipitacion" value={weather.precipitation ? 'Si' : 'No'} safe={!weather.precipitation} s={s} colors={colors} />
        <MetricRow label="Tormentas" value={weather.thunderstorm ? 'ACTIVA' : 'No detectadas'} safe={noThunderstorm} s={s} colors={colors} />
      </Card>

      <Card title="Indice K (Estabilidad Atmosferica)">
        <View style={s.kIndexRow}>
          <Text style={s.kIndexValue}>{weather.kIndex ?? '--'}</Text>
          <View style={s.kIndexInfo}>
            <StatusBadge
              label={(weather.kIndex ?? 0) < 20 ? 'Estable' : (weather.kIndex ?? 0) < 30 ? 'Moderado' : 'Inestable'}
              variant={(weather.kIndex ?? 0) < 20 ? 'safe' : (weather.kIndex ?? 0) < 30 ? 'warning' : 'danger'}
            />
            <Text style={s.kIndexDesc}>
              {(weather.kIndex ?? 0) < 20
                ? 'Baja probabilidad de tormentas'
                : (weather.kIndex ?? 0) < 30
                  ? 'Probabilidad moderada de tormentas'
                  : 'Alta probabilidad de tormentas - NO volar'}
            </Text>
          </View>
        </View>
      </Card>

      <Card title="Humedad">
        <MetricRow label="Humedad relativa" value={`${weather.humidity}%`} safe={weather.humidity < 90} s={s} colors={colors} />
      </Card>
    </ScrollView>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: 16, paddingBottom: 100 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 4, marginBottom: 16 },
  statusBanner: { alignItems: 'center' as const, marginBottom: 16 },
  bigValueRow: { flexDirection: 'row' as const, justifyContent: 'space-around' as const, paddingVertical: 8 },
  bigValueItem: { flexDirection: 'row' as const, alignItems: 'flex-end' as const },
  bigValue: { color: colors.textPrimary, fontSize: 42, fontWeight: '700' as const, fontVariant: ['tabular-nums'] },
  bigUnit: { color: colors.textSecondary, fontSize: 18, marginBottom: 6, marginLeft: 4 },
  windRow: { flexDirection: 'row' as const, marginBottom: 12 },
  windItem: { flex: 1, alignItems: 'center' as const },
  windLabel: { color: colors.textSecondary, fontSize: 12 },
  windValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' as const, marginTop: 4, fontVariant: ['tabular-nums'] },
  dangerValue: { color: colors.danger },
  limitRow: {
    flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.divider,
  },
  limitText: { color: colors.textSecondary, fontSize: 13 },
  kIndexRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 16 },
  kIndexValue: { color: colors.textPrimary, fontSize: 48, fontWeight: '700' as const, fontVariant: ['tabular-nums'] },
  kIndexInfo: { flex: 1 },
  kIndexDesc: { color: colors.textSecondary, fontSize: 13, marginTop: 6 },
  metricRow: {
    flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  metricLabel: { color: colors.textSecondary, fontSize: 14 },
  metricRight: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  metricValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' as const },
  indicator: { width: 8, height: 8, borderRadius: 4 },
});
