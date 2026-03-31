import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useStyles, StyleTheme } from '../../hooks/useStyles';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ThemedButton } from '../../components/common/ThemedButton';
import { ThemedInput } from '../../components/common/ThemedInput';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

const MAINTENANCE_TYPES = [
  'HELICES',
  'BATERIA',
  'FIRMWARE',
  'MOTOR',
  'CALIBRACION',
  'OTRO',
] as const;

type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  description: string;
  date: string;
}

const TYPE_VARIANTS: Record<MaintenanceType, 'info' | 'warning' | 'safe' | 'danger' | 'neutral'> = {
  HELICES: 'warning',
  BATERIA: 'danger',
  FIRMWARE: 'info',
  MOTOR: 'warning',
  CALIBRACION: 'safe',
  OTRO: 'neutral',
};

export function MaintenanceHistoryScreen({ route }: any) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const { droneId, droneName } = route.params;

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<MaintenanceType>('HELICES');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!description.trim()) return;
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      type: selectedType,
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    setRecords((prev) => [newRecord, ...prev]);
    setDescription('');
    setSelectedType('HELICES');
    setShowForm(false);
  };

  const renderRecord = ({ item }: { item: MaintenanceRecord }) => (
    <Card>
      <View style={s.recordHeader}>
        <StatusBadge label={item.type} variant={TYPE_VARIANTS[item.type]} small />
        <Text style={s.recordDate}>{item.date}</Text>
      </View>
      <Text style={s.recordDescription}>{item.description}</Text>
    </Card>
  );

  return (
    <View style={s.container}>
      <View style={s.topSection}>
        <Text style={s.droneName}>{droneName || 'Drone'}</Text>
        <ThemedButton
          title="Agregar Registro"
          variant="primary"
          onPress={() => setShowForm(true)}
        />
      </View>

      {records.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="construct-outline" size={64} color={colors.textDisabled} />
          <Text style={s.emptyTitle}>Sin registros de mantenimiento</Text>
          <Text style={s.emptySubtitle}>
            Agrega el primer registro para llevar control del mantenimiento de tu drone.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Nuevo Registro de Mantenimiento</Text>

            <Text style={s.fieldLabel}>Tipo de Mantenimiento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeScroll}>
              {MAINTENANCE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    s.typeChip,
                    selectedType === type && s.typeChipSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      s.typeChipText,
                      selectedType === type && s.typeChipTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ThemedInput
              label="Descripcion"
              placeholder="Ej: Cambio de helices por desgaste..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <View style={s.modalActions}>
              <ThemedButton
                title="Cancelar"
                variant="ghost"
                onPress={() => {
                  setShowForm(false);
                  setDescription('');
                }}
                fullWidth={false}
                style={{ flex: 1, marginRight: 8 }}
              />
              <ThemedButton
                title="Guardar"
                variant="primary"
                onPress={handleAdd}
                disabled={!description.trim()}
                fullWidth={false}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = ({ colors, typography, spacing, borderRadius }: StyleTheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface0,
  },
  topSection: {
    padding: spacing.md,
    gap: 12,
  },
  droneName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  // Record styles
  recordHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  recordDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  recordDescription: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 8,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: colors.surface1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: spacing.md,
    flexGrow: 0,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface2,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  typeChipTextSelected: {
    color: colors.textOnPrimary,
  },
  modalActions: {
    flexDirection: 'row' as const,
    marginTop: spacing.md,
  },
});
