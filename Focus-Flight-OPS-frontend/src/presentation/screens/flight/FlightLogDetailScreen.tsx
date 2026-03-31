import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFlightStore } from '../../store/slices/flightSlice';
import { useFleetStore } from '../../store/slices/fleetSlice';
import { useAuthStore } from '../../store/slices/authSlice';
import { generateFlightLogHtml, FlightLogPdfData } from '../../../services/pdf/flightLogPdfTemplate';

export function FlightLogDetailScreen({ route }: any) {
  const s = useStyles(createStyles);
  const { logId } = route.params;
  const log = useFlightStore((st) => st.flightLogs.find((l) => l.id === logId));
  const user = useAuthStore((st) => st.user);
  const pilot = useFleetStore((st) => st.pilot);
  const drones = useFleetStore((st) => st.drones);
  const [exporting, setExporting] = useState(false);

  if (!log) {
    return (
      <View style={s.container}>
        <Text style={s.error}>Registro de vuelo no encontrado</Text>
      </View>
    );
  }

  const date = new Date(log.takeoffTime);
  const drone = drones.find((d) => d.id === log.droneId);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const pilotName = user
        ? `${user.firstName} ${user.lastName}`
        : 'Piloto no identificado';

      const pdfData: FlightLogPdfData = {
        pilotName,
        pilotLicense: pilot?.licenseType ?? undefined,
        pilotUaeac: pilot?.uaeacPilotNumber ?? undefined,

        droneManufacturer: drone?.manufacturer ?? 'Desconocido',
        droneModel: drone?.modelName ?? 'Desconocido',
        droneSerial: drone?.serialNumber ?? 'N/A',
        droneRegistration: drone?.registrationNumber ?? undefined,
        droneMtow: drone?.mtowGrams ?? 0,

        missionId: log.missionId,
        operationType: log.operationType,
        takeoffTime: log.takeoffTime,
        landingTime: log.landingTime,
        totalMinutes: log.totalFlightMinutes,
        takeoffLat: log.takeoffLat,
        takeoffLng: log.takeoffLng,
        landingLat: log.landingLat,
        landingLng: log.landingLng,
        maxAltitudeM: log.maxAltitudeAglM,
        maxDistanceM: log.maxDistanceM,
        status: log.status,
        notes: log.notes,

        exportDate: new Date().toLocaleString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const html = generateFlightLogHtml(pdfData);
      const { uri } = await Print.printToFileAsync({ html });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Bitacora de Vuelo',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Generado', `Archivo guardado en: ${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo generar el PDF. Intente de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.date}>
          {date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <StatusBadge
          label={log.status === 'COMPLETED' ? 'Completado' : 'Emergencia'}
          variant={log.status === 'COMPLETED' ? 'safe' : 'danger'}
        />
      </View>

      <Card title="Informacion del Vuelo">
        <InfoRow label="Drone ID" value={log.droneId.slice(0, 8) + '...'} s={s} />
        <InfoRow label="Fuente" value={log.source || 'MANUAL'} s={s} />
        <InfoRow label="Tipo de operacion" value={log.operationType} s={s} />
        <InfoRow
          label="Hora despegue"
          value={new Date(log.takeoffTime).toLocaleTimeString('es-CO')}
          s={s}
        />
        <InfoRow
          label="Hora aterrizaje"
          value={log.landingTime ? new Date(log.landingTime).toLocaleTimeString('es-CO') : '--'}
          s={s}
        />
        <InfoRow label="Duracion" value={`${log.totalFlightMinutes?.toFixed(1) ?? '--'} minutos`} s={s} />
      </Card>

      <Card title="Telemetria">
        <View style={s.telemetryGrid}>
          <TelemetryBox label="Alt. Maxima" value={`${log.maxAltitudeAglM ?? '--'}`} unit="m AGL" s={s} />
          <TelemetryBox label="Dist. Maxima" value={`${log.maxDistanceM ?? '--'}`} unit="m" s={s} />
          <TelemetryBox label="Tipo Op." value={log.operationType} unit="" s={s} />
          <TelemetryBox label="Fuente" value={log.source || 'MANUAL'} unit="" s={s} />
        </View>
      </Card>

      <Card title="Coordenadas GPS">
        <InfoRow label="Despegue" value={`${log.takeoffLat.toFixed(6)}, ${log.takeoffLng.toFixed(6)}`} s={s} />
        <InfoRow
          label="Aterrizaje"
          value={
            log.landingLat && log.landingLng
              ? `${log.landingLat.toFixed(6)}, ${log.landingLng.toFixed(6)}`
              : '--'
          }
          s={s}
        />
      </Card>

      {log.notes && (
        <Card title="Notas del Piloto">
          <Text style={s.notes}>{log.notes}</Text>
        </Card>
      )}

      <TouchableOpacity
        style={[s.exportButton, exporting && s.exportButtonDisabled]}
        onPress={handleExportPdf}
        disabled={exporting}
        activeOpacity={0.7}
      >
        {exporting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="airplane-outline" size={20} color="#fff" style={s.exportIcon} />
        )}
        <Text style={s.exportButtonText}>
          {exporting ? 'Generando PDF...' : 'Exportar PDF'}
        </Text>
      </TouchableOpacity>
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

function TelemetryBox({ label, value, unit, s }: { label: string; value: string; unit: string; s: any }) {
  return (
    <View style={s.telBox}>
      <Text style={s.telValue}>{value}</Text>
      <Text style={s.telUnit}>{unit}</Text>
      <Text style={s.telLabel}>{label}</Text>
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  date: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: 12,
  },
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
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
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: 16,
  },
  telemetryGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  telBox: {
    width: '48%' as const,
    backgroundColor: colors.surface2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center' as const,
  },
  telValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  telUnit: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  telLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  notes: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  exportButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportIcon: {
    marginRight: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
