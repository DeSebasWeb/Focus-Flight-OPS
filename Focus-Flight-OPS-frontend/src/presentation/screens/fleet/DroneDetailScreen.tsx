import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg from 'react-native-svg';
import * as Sharing from 'expo-sharing';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ThemedButton } from '../../components/common/ThemedButton';
import { useFleetStore } from '../../store/slices/fleetSlice';

export function DroneDetailScreen({ route, navigation }: any) {
  const s = useStyles(createStyles);
  const { droneId } = route.params;
  const drone = useFleetStore((st) => st.drones.find((d) => d.id === droneId));
  const qrRef = useRef<any>(null);

  if (!drone) {
    return (
      <View style={s.container}>
        <Text style={s.error}>Drone no encontrado</Text>
      </View>
    );
  }

  const requiresReg = drone.mtowGrams >= 200;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.manufacturer}>{drone.manufacturer || 'N/A'}</Text>
        <Text style={s.model}>{drone.modelName || 'N/A'}</Text>
        <View style={s.badges}>
          <StatusBadge
            label={drone.isActive ? 'Activo' : 'Inactivo'}
            variant={drone.isActive ? 'safe' : 'danger'}
          />
        </View>
      </View>

      <Card title="Identificacion">
        <InfoRow label="Serial" value={drone.serialNumber} s={s} />
        <InfoRow
          label="Matricula Aerocivil"
          value={drone.registrationNumber || (requiresReg ? 'REQUERIDA - Sin registrar' : 'No requerida (<200g)')}
          danger={requiresReg && !drone.registrationNumber}
          s={s}
        />
      </Card>

      <Card title="Especificaciones">
        <InfoRow label="MTOW" value={`${(drone.mtowGrams / 1000).toFixed(2)} kg (${drone.mtowGrams}g)`} s={s} />
        <InfoRow label="Firmware" value={drone.firmwareVersion || 'N/A'} s={s} />
        <InfoRow label="Req. Registro" value={requiresReg ? 'Si (>=200g)' : 'No (<200g)'} s={s} />
      </Card>

      <Card title="Estadisticas de Vuelo">
        <View style={s.statsGrid}>
          <StatBox label="Horas Totales" value={(drone.totalFlightMinutes / 60).toFixed(1)} unit="h" s={s} />
        </View>
      </Card>

      <Card title="Codigo QR">
        <View style={s.qrContainer}>
          <QRCode
            value={`focusflightops://drone/${drone.id}`}
            size={180}
            backgroundColor="white"
            getRef={(ref: any) => (qrRef.current = ref)}
          />
          <Text style={s.qrText}>{`focusflightops://drone/${drone.id}`}</Text>
          <ThemedButton
            title="Compartir QR"
            variant="secondary"
            onPress={async () => {
              try {
                if (!qrRef.current) return;
                qrRef.current.toDataURL(async (dataURL: string) => {
                  const FileSystem = require('expo-file-system');
                  const path = `${FileSystem.cacheDirectory}drone-qr-${drone.id}.png`;
                  await FileSystem.writeAsStringAsync(path, dataURL, {
                    encoding: FileSystem.EncodingType.Base64,
                  });
                  const available = await Sharing.isAvailableAsync();
                  if (available) {
                    await Sharing.shareAsync(path, { mimeType: 'image/png' });
                  } else {
                    Alert.alert('Error', 'Compartir no disponible en este dispositivo');
                  }
                });
              } catch {
                Alert.alert('Error', 'No se pudo compartir el codigo QR');
              }
            }}
            style={s.qrShareBtn}
          />
        </View>
      </Card>

      <ThemedButton
        title="Historial de Mantenimiento"
        variant="secondary"
        onPress={() => navigation.navigate('MaintenanceHistory', {
          droneId: drone.id,
          droneName: `${drone.manufacturer || ''} ${drone.modelName || ''}`.trim(),
        })}
        style={{ marginBottom: 16 }}
      />
    </ScrollView>
  );
}

function InfoRow({ label, value, danger, s }: { label: string; value: string; danger?: boolean; s: any }) {
  return (
    <View style={s.info_row}>
      <Text style={s.info_label}>{label}</Text>
      <Text style={[s.info_value, danger && s.info_valueDanger]}>{value}</Text>
    </View>
  );
}

function StatBox({ label, value, unit, s }: { label: string; value: string; unit: string; s: any }) {
  return (
    <View style={s.stat_box}>
      <Text style={s.stat_value}>
        {value}
        <Text style={s.stat_unit}>{unit}</Text>
      </Text>
      <Text style={s.stat_label}>{label}</Text>
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
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  manufacturer: {
    color: colors.textSecondary,
    fontSize: 14,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  model: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  // InfoRow styles
  info_row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  info_label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  info_value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  info_valueDanger: {
    color: colors.danger,
  },
  // StatBox styles
  stat_box: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 12,
    backgroundColor: colors.surface2,
    borderRadius: 8,
  },
  stat_value: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  stat_unit: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  stat_label: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  // QR section styles
  qrSection: {
    marginBottom: 12,
  },
  qrContainer: {
    alignItems: 'center' as const,
    paddingVertical: 16,
  },
  qrText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center' as const,
    fontFamily: 'monospace',
  },
  qrShareBtn: {
    marginTop: 16,
    width: '80%' as const,
  },
});
