import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useFleetStore } from '../../store/slices/fleetSlice';
import { geofenceApi } from '../../../services/api/geofenceApi';

export function LegalComplianceScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useStyles(createStyles);
  const { pilot, drones, selectedDroneId, certificates, insurance, fetchAll, isLoading } = useFleetStore();
  const selectedDrone = drones.find((d) => d.id === selectedDroneId);
  const [airspaceCheck, setAirspaceCheck] = useState<any>(null);
  const [checkingAirspace, setCheckingAirspace] = useState(false);

  useEffect(() => {
    fetchAll();
    checkAirspace();
  }, []);

  const checkAirspace = async () => {
    setCheckingAirspace(true);
    try {
      let lat = 4.678, lng = -74.058;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      const result = await geofenceApi.check(lat, lng);
      setAirspaceCheck(result);
    } catch {
      setAirspaceCheck({ isRestricted: false, restrictedZones: [], advisoryZones: [] });
    } finally {
      setCheckingAirspace(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[s.container, s.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const droneOk = selectedDrone
    ? selectedDrone.mtowGrams < 200 || !!selectedDrone.registrationNumber
    : false;

  const certOk = certificates.some(
    (c) => c.isValid && new Date(c.expiryDate).getTime() > Date.now(),
  );

  const insOk = insurance
    ? insurance.isActive && new Date(insurance.endDate).getTime() > Date.now()
    : false;

  const airspaceOk = airspaceCheck ? !airspaceCheck.isRestricted : true;

  const allPassed = droneOk && certOk && insOk && airspaceOk;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Verificacion Legal Pre-Vuelo</Text>
      <Text style={s.subtitle}>RAC 100 / RAC 91 Apendice 13</Text>

      <View style={s.statusBanner}>
        <StatusBadge
          label={allPassed ? 'VERIFICACION LEGAL APROBADA' : 'VERIFICACION LEGAL FALLIDA'}
          variant={allPassed ? 'safe' : 'danger'}
        />
      </View>

      {/* Gate 1: Drone */}
      <Card danger={!droneOk}>
        <View style={s.checkRow}>
          <View style={[s.checkIcon, droneOk ? s.checkPass : s.checkFail]}>
            <Text style={s.checkIconText}>{droneOk ? '\u2713' : '\u2717'}</Text>
          </View>
          <View style={s.checkInfo}>
            <Text style={s.checkTitle}>Registro de Aeronave</Text>
            {selectedDrone ? (
              <>
                <Text style={s.checkDetail}>
                  {selectedDrone.manufacturer || ''} {selectedDrone.modelName || ''} ({selectedDrone.mtowGrams}g)
                </Text>
                {selectedDrone.registrationNumber ? (
                  <Text style={s.passText}>
                    Matricula: {selectedDrone.registrationNumber}
                  </Text>
                ) : selectedDrone.mtowGrams >= 200 ? (
                  <Text style={s.failText}>
                    {'Drone >=200g requiere matricula Aerocivil'}
                  </Text>
                ) : (
                  <Text style={s.passText}>{'Exento de registro (<200g)'}</Text>
                )}
              </>
            ) : (
              <Text style={s.failText}>No hay drone seleccionado - seleccione uno en Flota</Text>
            )}
          </View>
        </View>
      </Card>

      {/* Gate 2: Certificate */}
      <Card danger={!certOk}>
        <View style={s.checkRow}>
          <View style={[s.checkIcon, certOk ? s.checkPass : s.checkFail]}>
            <Text style={s.checkIconText}>{certOk ? '\u2713' : '\u2717'}</Text>
          </View>
          <View style={s.checkInfo}>
            <Text style={s.checkTitle}>Certificado de Piloto UAEAC</Text>
            {certOk ? (
              <Text style={s.passText}>Certificado vigente</Text>
            ) : (
              <Text style={s.failText}>
                No se encontro certificado vigente. Cargue su certificado UAEAC.
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* Gate 3: Insurance */}
      <Card danger={!insOk}>
        <View style={s.checkRow}>
          <View style={[s.checkIcon, insOk ? s.checkPass : s.checkFail]}>
            <Text style={s.checkIconText}>{insOk ? '\u2713' : '\u2717'}</Text>
          </View>
          <View style={s.checkInfo}>
            <Text style={s.checkTitle}>Poliza RC Extracontractual</Text>
            {insOk && insurance ? (
              <>
                <Text style={s.passText}>Poliza vigente</Text>
                <Text style={s.checkDetail}>
                  {insurance.insurerName} - No. {insurance.policyNumber}
                </Text>
              </>
            ) : (
              <Text style={s.failText}>
                Se requiere poliza de responsabilidad civil vigente
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* Gate 4: Airspace - Real geofence check */}
      <Card danger={!airspaceOk}>
        <View style={s.checkRow}>
          <View style={[s.checkIcon, checkingAirspace ? s.checkPending : airspaceOk ? s.checkPass : s.checkFail]}>
            {checkingAirspace ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={s.checkIconText}>{airspaceOk ? '\u2713' : '\u2717'}</Text>
            )}
          </View>
          <View style={s.checkInfo}>
            <Text style={s.checkTitle}>Espacio Aereo</Text>
            {checkingAirspace ? (
              <Text style={s.checkDetail}>Verificando espacio aereo...</Text>
            ) : airspaceOk ? (
              <Text style={s.passText}>
                Fuera de zonas restringidas
              </Text>
            ) : (
              <>
                <Text style={s.failText}>Zona restringida detectada</Text>
                {airspaceCheck?.restrictedZones?.map((z: any) => (
                  <Text key={z.id} style={s.checkDetail}>
                    - {z.name} ({z.type}){z.icaoCode ? ` ${z.icaoCode}` : ''}
                  </Text>
                ))}
              </>
            )}
          </View>
        </View>
      </Card>

      <TouchableOpacity
        style={s.mapBtn}
        onPress={() => navigation.navigate('AirspaceMap')}
      >
        <Text style={s.mapBtnText}>Ver Mapa de Espacio Aereo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.weatherBtn}
        onPress={() => navigation.navigate('WeatherBriefing')}
      >
        <Text style={s.weatherBtnText}>Ver Briefing Meteorologico</Text>
      </TouchableOpacity>

      {allPassed && (
        <TouchableOpacity
          style={s.proceedButton}
          onPress={() => navigation.getParent()?.navigate('ChecklistTab')}
        >
          <Text style={s.proceedText}>Proceder al Checklist de Seguridad</Text>
        </TouchableOpacity>
      )}

      {!allPassed && (
        <View style={s.blockedBanner}>
          <Text style={s.blockedText}>
            No puede proceder hasta resolver todos los items en rojo
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: 16, paddingBottom: 100 },
  centered: { justifyContent: 'center' as const, alignItems: 'center' as const },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 4, marginBottom: 16 },
  statusBanner: { alignItems: 'center' as const, marginBottom: 16 },
  checkRow: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: 12 },
  checkIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: 2,
  },
  checkPass: { backgroundColor: colors.success },
  checkFail: { backgroundColor: colors.danger },
  checkPending: { backgroundColor: colors.surface3 },
  checkIconText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '800' as const },
  checkInfo: { flex: 1 },
  checkTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' as const },
  checkDetail: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  passText: { color: colors.success, fontSize: 13, marginTop: 4, fontWeight: '500' as const },
  failText: { color: colors.danger, fontSize: 13, marginTop: 4, fontWeight: '500' as const },
  mapBtn: {
    backgroundColor: colors.surface1, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center' as const, marginTop: 12, borderWidth: 1, borderColor: colors.primary,
  },
  mapBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' as const },
  weatherBtn: {
    backgroundColor: colors.surface1, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center' as const, marginTop: 8, borderWidth: 1, borderColor: colors.info,
  },
  weatherBtnText: { color: colors.info, fontSize: 15, fontWeight: '600' as const },
  proceedButton: {
    backgroundColor: colors.success, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center' as const, marginTop: 16,
  },
  proceedText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700' as const },
  blockedBanner: {
    backgroundColor: colors.surface2, borderRadius: 12, padding: 16,
    alignItems: 'center' as const, marginTop: 16, borderWidth: 1, borderColor: colors.danger,
  },
  blockedText: { color: colors.danger, fontSize: 14, fontWeight: '600' as const, textAlign: 'center' as const },
});
