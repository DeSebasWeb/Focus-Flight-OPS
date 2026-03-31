/**
 * WatermelonDB Schema Definition
 * Focus Flight Ops - Complete database schema
 *
 * All 13 tables for RAC 91 Ap.13 / RAC 100 compliance
 */
// @ts-ignore - WatermelonDB types will be available after: npm install @nozbe/watermelondb
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'pilots',
      columns: [
        { name: 'document_type', type: 'string' },
        { name: 'document_number', type: 'string', isIndexed: true },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'phone', type: 'string' },
        { name: 'uaeac_pilot_number', type: 'string', isOptional: true },
        { name: 'license_type', type: 'string', isOptional: true },
        { name: 'emergency_contact_name', type: 'string', isOptional: true },
        { name: 'emergency_contact_phone', type: 'string', isOptional: true },
        { name: 'profile_photo_uri', type: 'string', isOptional: true },
        { name: 'regulatory_version', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'certificates',
      columns: [
        { name: 'pilot_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'issuing_authority', type: 'string' },
        { name: 'certificate_number', type: 'string' },
        { name: 'issue_date', type: 'string' },
        { name: 'expiry_date', type: 'string' },
        { name: 'document_uri', type: 'string', isOptional: true },
        { name: 'is_valid', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'insurance_policies',
      columns: [
        { name: 'pilot_id', type: 'string', isIndexed: true },
        { name: 'insurer_name', type: 'string' },
        { name: 'policy_number', type: 'string' },
        { name: 'coverage_type', type: 'string' },
        { name: 'coverage_amount_cop', type: 'number' },
        { name: 'start_date', type: 'string' },
        { name: 'end_date', type: 'string' },
        { name: 'document_uri', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'drones',
      columns: [
        { name: 'pilot_id', type: 'string', isIndexed: true },
        { name: 'registration_number', type: 'string', isOptional: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string', isIndexed: true },
        { name: 'mtow_grams', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'num_rotors', type: 'number', isOptional: true },
        { name: 'firmware_version', type: 'string', isOptional: true },
        { name: 'purchase_date', type: 'string', isOptional: true },
        { name: 'photo_uri', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'total_flight_hours', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'missions',
      columns: [
        { name: 'pilot_id', type: 'string', isIndexed: true },
        { name: 'drone_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'purpose', type: 'string' },
        { name: 'purpose_detail', type: 'string', isOptional: true },
        { name: 'planned_date', type: 'string' },
        { name: 'planned_location_lat', type: 'number' },
        { name: 'planned_location_lng', type: 'number' },
        { name: 'planned_location_name', type: 'string', isOptional: true },
        { name: 'planned_altitude_m', type: 'number', isOptional: true },
        { name: 'operation_type', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'regulatory_version', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'flight_logs',
      columns: [
        { name: 'mission_id', type: 'string', isIndexed: true },
        { name: 'pilot_id', type: 'string', isIndexed: true },
        { name: 'drone_id', type: 'string', isIndexed: true },
        { name: 'takeoff_time', type: 'string' },
        { name: 'landing_time', type: 'string', isOptional: true },
        { name: 'total_flight_minutes', type: 'number', isOptional: true },
        { name: 'takeoff_lat', type: 'number' },
        { name: 'takeoff_lng', type: 'number' },
        { name: 'takeoff_altitude_m', type: 'number', isOptional: true },
        { name: 'landing_lat', type: 'number', isOptional: true },
        { name: 'landing_lng', type: 'number', isOptional: true },
        { name: 'max_altitude_agl_m', type: 'number', isOptional: true },
        { name: 'max_distance_m', type: 'number', isOptional: true },
        { name: 'weather_conditions', type: 'string', isOptional: true },
        { name: 'wind_speed_kmh', type: 'number', isOptional: true },
        { name: 'temperature_c', type: 'number', isOptional: true },
        { name: 'visibility', type: 'string', isOptional: true },
        { name: 'operation_type', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'regulatory_version', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'telemetry_points',
      columns: [
        { name: 'flight_log_id', type: 'string', isIndexed: true },
        { name: 'timestamp', type: 'number' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'altitude_agl_m', type: 'number', isOptional: true },
        { name: 'speed_ms', type: 'number', isOptional: true },
        { name: 'heading_deg', type: 'number', isOptional: true },
        { name: 'battery_percent', type: 'number', isOptional: true },
        { name: 'signal_strength', type: 'number', isOptional: true },
        { name: 'distance_from_pilot_m', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'checklist_templates',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'version', type: 'number' },
        { name: 'name_es', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
    }),

    tableSchema({
      name: 'checklist_template_items',
      columns: [
        { name: 'template_id', type: 'string', isIndexed: true },
        { name: 'order_index', type: 'number' },
        { name: 'text_es', type: 'string' },
        { name: 'is_critical', type: 'boolean' },
        { name: 'requires_photo', type: 'boolean' },
        { name: 'category', type: 'string', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'checklist_executions',
      columns: [
        { name: 'mission_id', type: 'string', isIndexed: true },
        { name: 'template_id', type: 'string', isIndexed: true },
        { name: 'pilot_id', type: 'string', isIndexed: true },
        { name: 'started_at', type: 'number' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'is_passed', type: 'boolean', isOptional: true },
        { name: 'status', type: 'string' },
      ],
    }),

    tableSchema({
      name: 'checklist_execution_items',
      columns: [
        { name: 'execution_id', type: 'string', isIndexed: true },
        { name: 'template_item_id', type: 'string' },
        { name: 'is_checked', type: 'boolean' },
        { name: 'checked_at', type: 'number', isOptional: true },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'photo_uri', type: 'string', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'emergency_events',
      columns: [
        { name: 'flight_log_id', type: 'string', isOptional: true },
        { name: 'pilot_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'triggered_at', type: 'number' },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'altitude_m', type: 'number', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'actions_taken', type: 'string', isOptional: true },
        { name: 'resolved_at', type: 'number', isOptional: true },
        { name: 'atc_contacted', type: 'boolean' },
        { name: 'atc_contact_name', type: 'string', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'emergency_contacts',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'frequency_mhz', type: 'number', isOptional: true },
        { name: 'airport_code', type: 'string', isOptional: true },
        { name: 'region', type: 'string', isOptional: true },
        { name: 'is_default', type: 'boolean' },
      ],
    }),
  ],
});
