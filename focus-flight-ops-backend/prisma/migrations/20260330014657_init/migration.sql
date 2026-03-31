-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "document_type" VARCHAR(10) NOT NULL,
    "document_number" VARCHAR(30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "uaeac_pilot_number" VARCHAR(50),
    "license_type" VARCHAR(20) NOT NULL,
    "emergency_contact_name" VARCHAR(100),
    "emergency_contact_phone" VARCHAR(20),
    "regulatory_version" VARCHAR(20) NOT NULL DEFAULT 'RAC100',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pilots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "pilot_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "certificate_number" VARCHAR(50) NOT NULL,
    "issuing_authority" VARCHAR(100) NOT NULL,
    "issue_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "document_url" VARCHAR(500),
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" UUID NOT NULL,
    "pilot_id" UUID NOT NULL,
    "insurer_name" VARCHAR(100) NOT NULL,
    "policy_number" VARCHAR(50) NOT NULL,
    "coverage_type" VARCHAR(30) NOT NULL DEFAULT 'RC_EXTRACONTRACTUAL',
    "coverage_amount_cop" DECIMAL(15,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "document_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drone_manufacturers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "drone_manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drone_models" (
    "id" UUID NOT NULL,
    "manufacturer_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "default_mtow_grams" INTEGER,
    "default_num_rotors" INTEGER,
    "category" VARCHAR(20),

    CONSTRAINT "drone_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drones" (
    "id" UUID NOT NULL,
    "pilot_id" UUID NOT NULL,
    "model_id" UUID NOT NULL,
    "serial_number" VARCHAR(50) NOT NULL,
    "registration_number" VARCHAR(20),
    "mtow_grams" INTEGER NOT NULL,
    "firmware_version" VARCHAR(50),
    "purchase_date" DATE,
    "photo_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_flight_minutes" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "drones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_purposes" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name_es" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,

    CONSTRAINT "mission_purposes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" UUID NOT NULL,
    "pilot_id" UUID NOT NULL,
    "drone_id" UUID NOT NULL,
    "purpose_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "purpose_detail" TEXT,
    "planned_date" DATE NOT NULL,
    "planned_location_lat" DECIMAL(10,7) NOT NULL,
    "planned_location_lng" DECIMAL(10,7) NOT NULL,
    "planned_location_name" VARCHAR(200),
    "planned_altitude_m" DECIMAL(6,2),
    "operation_type" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    "regulatory_version" VARCHAR(20) NOT NULL DEFAULT 'RAC100',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_logs" (
    "id" UUID NOT NULL,
    "mission_id" UUID NOT NULL,
    "pilot_id" UUID NOT NULL,
    "drone_id" UUID NOT NULL,
    "takeoff_time" TIMESTAMPTZ NOT NULL,
    "landing_time" TIMESTAMPTZ,
    "total_flight_minutes" DECIMAL(10,2),
    "takeoff_lat" DECIMAL(10,7) NOT NULL,
    "takeoff_lng" DECIMAL(10,7) NOT NULL,
    "takeoff_altitude_m" DECIMAL(6,2),
    "landing_lat" DECIMAL(10,7),
    "landing_lng" DECIMAL(10,7),
    "max_altitude_agl_m" DECIMAL(6,2),
    "max_distance_m" DECIMAL(8,2),
    "operation_type" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'IN_FLIGHT',
    "notes" TEXT,
    "regulatory_version" VARCHAR(20) NOT NULL DEFAULT 'RAC100',
    "dji_sync_id" VARCHAR(100),
    "source" VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "flight_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_weather_snapshots" (
    "id" UUID NOT NULL,
    "flight_log_id" UUID NOT NULL,
    "temperature_c" DECIMAL(5,2),
    "wind_speed_kmh" DECIMAL(5,2),
    "wind_gust_kmh" DECIMAL(5,2),
    "wind_direction_deg" INTEGER,
    "humidity_percent" INTEGER,
    "visibility" VARCHAR(10),
    "visibility_km" DECIMAL(5,2),
    "k_index" DECIMAL(5,2),
    "precipitation" BOOLEAN NOT NULL DEFAULT false,
    "thunderstorm" BOOLEAN NOT NULL DEFAULT false,
    "cloud_cover_percent" INTEGER,
    "pressure_hpa" DECIMAL(6,2),
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flight_weather_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry_points" (
    "id" UUID NOT NULL,
    "flight_log_id" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "altitude_agl_m" DECIMAL(6,2),
    "speed_ms" DECIMAL(6,2),
    "heading_deg" DECIMAL(5,2),
    "battery_percent" INTEGER,
    "signal_strength" INTEGER,
    "distance_from_pilot_m" DECIMAL(8,2),
    "satellite_count" INTEGER,

    CONSTRAINT "telemetry_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name_es" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_item_categories" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name_es" VARCHAR(50) NOT NULL,

    CONSTRAINT "checklist_item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_template_items" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "category_id" UUID,
    "order_index" INTEGER NOT NULL,
    "text_es" TEXT NOT NULL,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "requires_photo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "checklist_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_executions" (
    "id" UUID NOT NULL,
    "mission_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "pilot_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL,
    "completed_at" TIMESTAMPTZ,
    "status" VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    "is_passed" BOOLEAN,

    CONSTRAINT "checklist_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_execution_items" (
    "id" UUID NOT NULL,
    "execution_id" UUID NOT NULL,
    "template_item_id" UUID NOT NULL,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_at" TIMESTAMPTZ,
    "note" TEXT,
    "photo_url" VARCHAR(500),

    CONSTRAINT "checklist_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "frequency_mhz" DECIMAL(6,3),
    "airport_code" VARCHAR(4),
    "region" VARCHAR(50),
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_events" (
    "id" UUID NOT NULL,
    "flight_log_id" UUID,
    "pilot_id" UUID NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "triggered_at" TIMESTAMPTZ NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "altitude_m" DECIMAL(6,2),
    "description" TEXT,
    "resolved_at" TIMESTAMPTZ,
    "atc_contacted" BOOLEAN NOT NULL DEFAULT false,
    "atc_contact_id" UUID,

    CONSTRAINT "emergency_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_event_actions" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "action_text" TEXT NOT NULL,
    "performed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_event_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airspace_zone_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name_es" VARCHAR(50) NOT NULL,
    "default_radius_m" INTEGER,

    CONSTRAINT "airspace_zone_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airspace_zones" (
    "id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "icao_code" VARCHAR(4),
    "center_lat" DECIMAL(10,7) NOT NULL,
    "center_lng" DECIMAL(10,7) NOT NULL,
    "radius_m" INTEGER NOT NULL,
    "geometry_geojson" TEXT,
    "max_altitude_m" DECIMAL(6,2),
    "is_permanent" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMPTZ,
    "valid_until" TIMESTAMPTZ,
    "source" VARCHAR(20) NOT NULL DEFAULT 'BUNDLED',
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "airspace_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_document_number_key" ON "users"("document_number");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pilots_user_id_key" ON "pilots"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pilots_uaeac_pilot_number_key" ON "pilots"("uaeac_pilot_number");

-- CreateIndex
CREATE INDEX "certificates_pilot_id_idx" ON "certificates"("pilot_id");

-- CreateIndex
CREATE INDEX "insurance_policies_pilot_id_idx" ON "insurance_policies"("pilot_id");

-- CreateIndex
CREATE UNIQUE INDEX "drone_manufacturers_name_key" ON "drone_manufacturers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "drone_models_manufacturer_id_name_key" ON "drone_models"("manufacturer_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "drones_serial_number_key" ON "drones"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "drones_registration_number_key" ON "drones"("registration_number");

-- CreateIndex
CREATE INDEX "drones_pilot_id_idx" ON "drones"("pilot_id");

-- CreateIndex
CREATE INDEX "drones_model_id_idx" ON "drones"("model_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_purposes_code_key" ON "mission_purposes"("code");

-- CreateIndex
CREATE INDEX "missions_pilot_id_idx" ON "missions"("pilot_id");

-- CreateIndex
CREATE INDEX "missions_drone_id_idx" ON "missions"("drone_id");

-- CreateIndex
CREATE INDEX "flight_logs_mission_id_idx" ON "flight_logs"("mission_id");

-- CreateIndex
CREATE INDEX "flight_logs_pilot_id_idx" ON "flight_logs"("pilot_id");

-- CreateIndex
CREATE INDEX "flight_logs_drone_id_idx" ON "flight_logs"("drone_id");

-- CreateIndex
CREATE UNIQUE INDEX "flight_weather_snapshots_flight_log_id_key" ON "flight_weather_snapshots"("flight_log_id");

-- CreateIndex
CREATE INDEX "telemetry_points_flight_log_id_timestamp_idx" ON "telemetry_points"("flight_log_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_templates_type_version_key" ON "checklist_templates"("type", "version");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_item_categories_code_key" ON "checklist_item_categories"("code");

-- CreateIndex
CREATE INDEX "checklist_template_items_template_id_idx" ON "checklist_template_items"("template_id");

-- CreateIndex
CREATE INDEX "checklist_executions_mission_id_idx" ON "checklist_executions"("mission_id");

-- CreateIndex
CREATE INDEX "checklist_executions_pilot_id_idx" ON "checklist_executions"("pilot_id");

-- CreateIndex
CREATE INDEX "checklist_execution_items_execution_id_idx" ON "checklist_execution_items"("execution_id");

-- CreateIndex
CREATE INDEX "emergency_events_pilot_id_idx" ON "emergency_events"("pilot_id");

-- CreateIndex
CREATE INDEX "emergency_event_actions_event_id_idx" ON "emergency_event_actions"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "airspace_zone_types_code_key" ON "airspace_zone_types"("code");

-- CreateIndex
CREATE INDEX "airspace_zones_type_id_idx" ON "airspace_zones"("type_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilots" ADD CONSTRAINT "pilots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_pilot_id_fkey" FOREIGN KEY ("pilot_id") REFERENCES "pilots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_pilot_id_fkey" FOREIGN KEY ("pilot_id") REFERENCES "pilots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drone_models" ADD CONSTRAINT "drone_models_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "drone_manufacturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drones" ADD CONSTRAINT "drones_pilot_id_fkey" FOREIGN KEY ("pilot_id") REFERENCES "pilots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drones" ADD CONSTRAINT "drones_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "drone_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_pilot_id_fkey" FOREIGN KEY ("pilot_id") REFERENCES "pilots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_drone_id_fkey" FOREIGN KEY ("drone_id") REFERENCES "drones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_purpose_id_fkey" FOREIGN KEY ("purpose_id") REFERENCES "mission_purposes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_logs" ADD CONSTRAINT "flight_logs_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_logs" ADD CONSTRAINT "flight_logs_pilot_id_fkey" FOREIGN KEY ("pilot_id") REFERENCES "pilots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_logs" ADD CONSTRAINT "flight_logs_drone_id_fkey" FOREIGN KEY ("drone_id") REFERENCES "drones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_weather_snapshots" ADD CONSTRAINT "flight_weather_snapshots_flight_log_id_fkey" FOREIGN KEY ("flight_log_id") REFERENCES "flight_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry_points" ADD CONSTRAINT "telemetry_points_flight_log_id_fkey" FOREIGN KEY ("flight_log_id") REFERENCES "flight_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_template_items" ADD CONSTRAINT "checklist_template_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_template_items" ADD CONSTRAINT "checklist_template_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "checklist_item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_executions" ADD CONSTRAINT "checklist_executions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_executions" ADD CONSTRAINT "checklist_executions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "checklist_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_executions" ADD CONSTRAINT "checklist_executions_pilot_id_fkey" FOREIGN KEY ("pilot_id") REFERENCES "pilots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_execution_items" ADD CONSTRAINT "checklist_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "checklist_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_execution_items" ADD CONSTRAINT "checklist_execution_items_template_item_id_fkey" FOREIGN KEY ("template_item_id") REFERENCES "checklist_template_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_flight_log_id_fkey" FOREIGN KEY ("flight_log_id") REFERENCES "flight_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_pilot_id_fkey" FOREIGN KEY ("pilot_id") REFERENCES "pilots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_atc_contact_id_fkey" FOREIGN KEY ("atc_contact_id") REFERENCES "emergency_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_event_actions" ADD CONSTRAINT "emergency_event_actions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airspace_zones" ADD CONSTRAINT "airspace_zones_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "airspace_zone_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
