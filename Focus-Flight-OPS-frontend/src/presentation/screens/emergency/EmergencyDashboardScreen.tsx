import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonList } from '../../components/common/Skeleton';
import { useHaptic } from '../../hooks/useHaptic';
import { AnimatedListItem } from '../../components/common/AnimatedListItem';
import { useEmergencyStore } from '../../store/slices/emergencySlice';

export function EmergencyDashboardScreen({ navigation }: any) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const haptic = useHaptic();
  const { contacts, isEmergencyActive, isLoading, activateEmergency, deactivateEmergency, fetchContacts } =
    useEmergencyStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, [fetchContacts]);

  const atcContacts = contacts.filter((c) => c.role === 'ATC');
  const emergencyServices = contacts.filter((c) => c.role !== 'ATC' && c.role !== 'AEROCIVIL');
  const aerocivil = contacts.filter((c) => c.role === 'AEROCIVIL');

  const handleCall = (phone: string, name: string) => {
    haptic.warning();
    Alert.alert(
      `Llamar a ${name}`,
      `Numero: ${phone}`,
      [
        { text: 'Cancelar', style: 'cancel' as const },
        { text: 'Llamar', onPress: () => Linking.openURL(`tel:${phone}`) },
      ],
    );
  };

  // Show skeleton on initial load
  if (contacts.length === 0 && isLoading) {
    return (
      <View style={s.container}>
        <View style={s.content}>
          <SkeletonList count={6} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />
      }
    >
      {/* Emergency activation */}
      <TouchableOpacity
        style={[s.emergencyBtn, isEmergencyActive && s.emergencyBtnActive]}
        onPress={() => {
          if (isEmergencyActive) {
            Alert.alert(
              'Desactivar Emergencia',
              'Esta seguro que la emergencia ha sido resuelta?',
              [
                { text: 'No', style: 'cancel' as const },
                { text: 'Si, resuelta', onPress: () => { haptic.success(); deactivateEmergency(); } },
              ],
            );
          } else {
            Alert.alert(
              'Activar Emergencia',
              'Se registrara un evento de emergencia. Continuar?',
              [
                { text: 'Cancelar', style: 'cancel' as const },
                { text: 'ACTIVAR', style: 'destructive' as const, onPress: () => { haptic.heavy(); activateEmergency(); } },
              ],
            );
          }
        }}
      >
        <Text style={s.emergencyBtnIcon}>!</Text>
        <Text style={s.emergencyBtnText}>
          {isEmergencyActive ? 'EMERGENCIA ACTIVA' : 'ACTIVAR EMERGENCIA'}
        </Text>
        {isEmergencyActive && (
          <Text style={s.emergencyBtnSub}>Toque para desactivar</Text>
        )}
      </TouchableOpacity>

      {/* Flyaway protocol button */}
      <TouchableOpacity
        style={s.flyawayBtn}
        onPress={() => navigation.navigate('FlyawayProtocol')}
      >
        <Text style={s.flyawayBtnText}>Protocolo FLYAWAY</Text>
        <Text style={s.flyawayBtnSub}>Ver pasos de emergencia por perdida de control</Text>
      </TouchableOpacity>

      {/* ATC Contacts */}
      <Text style={s.sectionTitle}>Torres de Control</Text>
      {atcContacts.map((contact, i) => (
        <AnimatedListItem key={contact.id} index={i}>
        <Card onPress={() => handleCall(contact.phone, contact.name)}>
          <View style={s.contactRow}>
            <View style={s.contactInfo}>
              <Text style={s.contactName}>{contact.name}</Text>
              <View style={s.contactMeta}>
                {contact.airportCode && (
                  <StatusBadge label={contact.airportCode} variant="info" small />
                )}
                {contact.region && (
                  <Text style={s.contactRegion}>{contact.region}</Text>
                )}
              </View>
              {contact.frequencyMhz && (
                <Text style={s.contactFreq}>
                  Frecuencia: {contact.frequencyMhz} MHz
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => handleCall(contact.phone, contact.name)}
            >
              <Text style={s.callBtnText}>LLAMAR</Text>
            </TouchableOpacity>
          </View>
        </Card>
        </AnimatedListItem>
      ))}

      {/* Aerocivil */}
      <Text style={s.sectionTitle}>Aeronautica Civil</Text>
      {aerocivil.map((contact, i) => (
        <AnimatedListItem key={contact.id} index={atcContacts.length + i}>
        <Card onPress={() => handleCall(contact.phone, contact.name)}>
          <View style={s.contactRow}>
            <View style={s.contactInfo}>
              <Text style={s.contactName}>{contact.name}</Text>
              <Text style={s.contactPhone}>{contact.phone}</Text>
            </View>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => handleCall(contact.phone, contact.name)}
            >
              <Text style={s.callBtnText}>LLAMAR</Text>
            </TouchableOpacity>
          </View>
        </Card>
        </AnimatedListItem>
      ))}

      {/* Emergency Services */}
      <Text style={s.sectionTitle}>Servicios de Emergencia</Text>
      {emergencyServices.map((contact, i) => (
        <AnimatedListItem key={contact.id} index={atcContacts.length + aerocivil.length + i}>
        <Card onPress={() => handleCall(contact.phone, contact.name)}>
          <View style={s.contactRow}>
            <View style={s.contactInfo}>
              <Text style={s.contactName}>{contact.name}</Text>
              <Text style={s.contactPhone}>{contact.phone}</Text>
              <StatusBadge label={contact.role} variant="neutral" small />
            </View>
            <TouchableOpacity
              style={[s.callBtn, s.callBtnEmergency]}
              onPress={() => handleCall(contact.phone, contact.name)}
            >
              <Text style={s.callBtnText}>{contact.phone}</Text>
            </TouchableOpacity>
          </View>
        </Card>
        </AnimatedListItem>
      ))}
    </ScrollView>
  );
}

const createStyles = ({ colors }: StyleTheme) => ({
  container: { flex: 1, backgroundColor: colors.surface0 },
  content: { padding: 16, paddingBottom: 100 },
  emergencyBtn: {
    backgroundColor: colors.emergencyBg, borderRadius: 16,
    padding: 24, alignItems: 'center' as const, marginBottom: 16,
    borderWidth: 2, borderColor: colors.emergencyBorder,
  },
  emergencyBtnActive: {
    backgroundColor: '#B71C1C',
    borderColor: '#FFFFFF',
  },
  emergencyBtnIcon: {
    color: '#FFFFFF', fontSize: 36, fontWeight: '900' as const,
  },
  emergencyBtnText: {
    color: '#FFFFFF', fontSize: 20, fontWeight: '800' as const,
    letterSpacing: 1, marginTop: 4,
  },
  emergencyBtnSub: {
    color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4,
  },
  flyawayBtn: {
    backgroundColor: colors.warning, borderRadius: 12,
    padding: 16, alignItems: 'center' as const, marginBottom: 24,
  },
  flyawayBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700' as const },
  flyawayBtnSub: { color: 'rgba(0,0,0,0.6)', fontSize: 12, marginTop: 4 },
  sectionTitle: {
    color: colors.textPrimary, fontSize: 18, fontWeight: '600' as const,
    marginBottom: 8, marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const,
  },
  contactInfo: { flex: 1 },
  contactName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' as const },
  contactMeta: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginTop: 4 },
  contactRegion: { color: colors.textSecondary, fontSize: 12 },
  contactFreq: { color: colors.info, fontSize: 12, marginTop: 4 },
  contactPhone: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  callBtn: {
    backgroundColor: colors.success, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  callBtnEmergency: { backgroundColor: colors.danger },
  callBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' as const },
});
