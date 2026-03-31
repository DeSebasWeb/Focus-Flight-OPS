// ============================================================
// DATA INTERFACES (plain TypeScript - no Prisma)
// ============================================================

export interface UserData {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface PilotData {
  id: string;
  userId: string;
  uaeacPilotNumber: string | null;
  licenseType: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  regulatoryVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePilotData {
  userId: string;
  uaeacPilotNumber?: string;
  licenseType: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  regulatoryVersion?: string;
}

export interface DroneData {
  id: string;
  pilotId: string;
  modelId: string;
  serialNumber: string;
  registrationNumber: string | null;
  mtowGrams: number;
  firmwareVersion: string | null;
  purchaseDate: Date | null;
  photoUrl: string | null;
  isActive: boolean;
  totalFlightMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  manufacturer?: string;
  modelName?: string;
}

export interface CreateDroneData {
  pilotId: string;
  modelId: string;
  serialNumber: string;
  registrationNumber?: string;
  mtowGrams: number;
  firmwareVersion?: string;
  purchaseDate?: Date;
  photoUrl?: string;
}

export interface CertificateData {
  id: string;
  pilotId: string;
  type: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  documentUrl: string | null;
  isValid: boolean;
  createdAt: Date;
}

export interface CreateCertificateData {
  pilotId: string;
  type: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  documentUrl?: string;
}

export interface InsuranceData {
  id: string;
  pilotId: string;
  insurerName: string;
  policyNumber: string;
  coverageType: string;
  coverageAmountCop: number;
  startDate: Date;
  endDate: Date;
  documentUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateInsuranceData {
  pilotId: string;
  insurerName: string;
  policyNumber: string;
  coverageType?: string;
  coverageAmountCop: number;
  startDate: Date;
  endDate: Date;
  documentUrl?: string;
}

export interface MissionData {
  id: string;
  pilotId: string;
  droneId: string;
  purposeId: string;
  name: string;
  purposeDetail: string | null;
  plannedDate: Date;
  plannedLocationLat: number;
  plannedLocationLng: number;
  plannedLocationName: string | null;
  plannedAltitudeM: number | null;
  operationType: string;
  status: string;
  regulatoryVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMissionData {
  pilotId: string;
  droneId: string;
  purposeId: string;
  name: string;
  purposeDetail?: string;
  plannedDate: Date;
  plannedLocationLat: number;
  plannedLocationLng: number;
  plannedLocationName?: string;
  plannedAltitudeM?: number;
  operationType: string;
}

export interface FlightLogData {
  id: string;
  missionId: string;
  pilotId: string;
  droneId: string;
  takeoffTime: Date;
  landingTime: Date | null;
  totalFlightMinutes: number | null;
  takeoffLat: number;
  takeoffLng: number;
  takeoffAltitudeM: number | null;
  landingLat: number | null;
  landingLng: number | null;
  maxAltitudeAglM: number | null;
  maxDistanceM: number | null;
  operationType: string;
  status: string;
  notes: string | null;
  regulatoryVersion: string;
  djiSyncId: string | null;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFlightLogData {
  missionId: string;
  pilotId: string;
  droneId: string;
  takeoffTime: Date;
  takeoffLat: number;
  takeoffLng: number;
  takeoffAltitudeM?: number;
  operationType: string;
  source?: string;
}

export interface TelemetryData {
  id: string;
  flightLogId: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  altitudeAglM: number | null;
  speedMs: number | null;
  headingDeg: number | null;
  batteryPercent: number | null;
  signalStrength: number | null;
  distanceFromPilotM: number | null;
  satelliteCount: number | null;
}

export interface CreateTelemetryData {
  flightLogId: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  altitudeAglM?: number;
  speedMs?: number;
  headingDeg?: number;
  batteryPercent?: number;
  signalStrength?: number;
  distanceFromPilotM?: number;
  satelliteCount?: number;
}

export interface ChecklistTemplateData {
  id: string;
  type: string;
  version: number;
  nameEs: string;
  isActive: boolean;
  items: ChecklistTemplateItemData[];
}

export interface ChecklistTemplateItemData {
  id: string;
  templateId: string;
  categoryId: string | null;
  orderIndex: number;
  textEs: string;
  isCritical: boolean;
  requiresPhoto: boolean;
  categoryCode?: string;
}

export interface ChecklistExecutionData {
  id: string;
  missionId: string;
  templateId: string;
  pilotId: string;
  startedAt: Date;
  completedAt: Date | null;
  status: string;
  isPassed: boolean | null;
  items: ChecklistExecutionItemData[];
}

export interface ChecklistExecutionItemData {
  id: string;
  executionId: string;
  templateItemId: string;
  isChecked: boolean;
  checkedAt: Date | null;
  note: string | null;
  photoUrl: string | null;
}

export interface CreateChecklistExecutionData {
  missionId: string;
  templateId: string;
  pilotId: string;
  startedAt: Date;
  items: { templateItemId: string }[];
}

export interface EmergencyContactData {
  id: string;
  name: string;
  role: string;
  phone: string;
  frequencyMhz: number | null;
  airportCode: string | null;
  region: string | null;
  isDefault: boolean;
}

export interface EmergencyEventData {
  id: string;
  flightLogId: string | null;
  pilotId: string;
  type: string;
  triggeredAt: Date;
  latitude: number | null;
  longitude: number | null;
  altitudeM: number | null;
  description: string | null;
  resolvedAt: Date | null;
  atcContacted: boolean;
  atcContactId: string | null;
}

export interface CreateEmergencyEventData {
  flightLogId?: string;
  pilotId: string;
  type: string;
  triggeredAt: Date;
  latitude?: number;
  longitude?: number;
  altitudeM?: number;
  description?: string;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface WeatherData {
  temperatureC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirectionDeg: number;
  humidityPercent: number;
  visibility: string;
  visibilityKm: number;
  kIndex: number | null;
  precipitation: boolean;
  thunderstorm: boolean;
  cloudCoverPercent: number;
  pressureHpa: number;
}

export interface AirspaceZoneData {
  id: string;
  name: string;
  type: string;
  icaoCode: string | null;
  centerLat: number;
  centerLng: number;
  radiusM: number;
  isPermanent: boolean;
  // ArcGIS polygon geometry (optional - for UAEAC real zones)
  geometry?: number[][][] | null;
  description?: string | null;
  source?: 'LOCAL' | 'UAEAC';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email?: string;
  pilotId?: string;
}

export interface AirspaceCheckResult {
  isRestricted: boolean;
  restrictedZones: AirspaceZoneData[];
  advisoryZones: AirspaceZoneData[];
  nearestAirportDistanceM?: number;
}

// ============================================================
// OUTBOUND PORT INTERFACES (driven ports)
// ============================================================

export interface IUserRepository {
  findById(id: string): Promise<UserData | null>;
  findByEmail(email: string): Promise<UserData | null>;
  findByDocumentNumber(doc: string): Promise<UserData | null>;
  create(data: CreateUserData): Promise<UserData>;
  update(id: string, data: Partial<CreateUserData>): Promise<UserData>;
}

export interface IPilotRepository {
  findById(id: string): Promise<PilotData | null>;
  findByUserId(userId: string): Promise<PilotData | null>;
  create(data: CreatePilotData): Promise<PilotData>;
  update(id: string, data: Partial<CreatePilotData>): Promise<PilotData>;
}

export interface IDroneRepository {
  findById(id: string): Promise<DroneData | null>;
  findByPilotId(pilotId: string): Promise<DroneData[]>;
  findBySerialNumber(serial: string): Promise<DroneData | null>;
  create(data: CreateDroneData): Promise<DroneData>;
  update(id: string, data: Partial<CreateDroneData>): Promise<DroneData>;
  delete(id: string): Promise<void>;
}

export interface ICertificateRepository {
  findById(id: string): Promise<CertificateData | null>;
  findByPilotId(pilotId: string): Promise<CertificateData[]>;
  findValidByPilotId(pilotId: string): Promise<CertificateData[]>;
  create(data: CreateCertificateData): Promise<CertificateData>;
  delete(id: string): Promise<void>;
}

export interface IInsuranceRepository {
  findById(id: string): Promise<InsuranceData | null>;
  findByPilotId(pilotId: string): Promise<InsuranceData[]>;
  findActiveByPilotId(pilotId: string): Promise<InsuranceData | null>;
  create(data: CreateInsuranceData): Promise<InsuranceData>;
  update(id: string, data: Partial<CreateInsuranceData>): Promise<InsuranceData>;
}

export interface IMissionRepository {
  findById(id: string): Promise<MissionData | null>;
  findByPilotId(pilotId: string): Promise<MissionData[]>;
  create(data: CreateMissionData): Promise<MissionData>;
  update(id: string, data: Partial<CreateMissionData>): Promise<MissionData>;
  updateStatus(id: string, status: string): Promise<MissionData>;
}

export interface IFlightLogRepository {
  findById(id: string): Promise<FlightLogData | null>;
  findByPilotId(pilotId: string): Promise<FlightLogData[]>;
  findByMissionId(missionId: string): Promise<FlightLogData[]>;
  create(data: CreateFlightLogData): Promise<FlightLogData>;
  update(id: string, data: Partial<FlightLogData>): Promise<FlightLogData>;
}

export interface ITelemetryRepository {
  create(data: CreateTelemetryData): Promise<TelemetryData>;
  findByFlightLogId(flightLogId: string): Promise<TelemetryData[]>;
}

export interface IChecklistRepository {
  findTemplateByType(type: string): Promise<ChecklistTemplateData | null>;
  findAllActiveTemplates(): Promise<ChecklistTemplateData[]>;
  findExecutionById(id: string): Promise<ChecklistExecutionData | null>;
  findExecutionsByMissionId(missionId: string): Promise<ChecklistExecutionData[]>;
  createExecution(data: CreateChecklistExecutionData): Promise<ChecklistExecutionData>;
  updateExecution(id: string, data: { status: string; isPassed?: boolean; completedAt?: Date }): Promise<ChecklistExecutionData>;
  updateExecutionItem(id: string, data: Partial<ChecklistExecutionItemData>): Promise<void>;
}

export interface IEmergencyContactRepository {
  findAll(): Promise<EmergencyContactData[]>;
  findByRegion(region: string): Promise<EmergencyContactData[]>;
}

export interface IEmergencyEventRepository {
  create(data: CreateEmergencyEventData): Promise<EmergencyEventData>;
  findById(id: string): Promise<EmergencyEventData | null>;
  update(id: string, data: Partial<EmergencyEventData>): Promise<EmergencyEventData>;
  addAction(eventId: string, actionText: string): Promise<void>;
}

export interface IRefreshTokenRepository {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(hash: string): Promise<RefreshTokenData | null>;
  revokeByUserId(userId: string): Promise<void>;
  revokeByTokenHash(hash: string): Promise<void>;
}

export interface IWeatherProvider {
  getCurrentWeather(lat: number, lng: number): Promise<WeatherData>;
  getForecast(lat: number, lng: number, hoursAhead?: number): Promise<WeatherData[]>;
}

export interface IGeofenceProvider {
  checkAirspace(lat: number, lng: number): Promise<AirspaceCheckResult>;
  getZonesInArea(lat: number, lng: number, radiusKm: number): Promise<AirspaceZoneData[]>;
}

export interface ITokenProvider {
  generateTokenPair(payload: TokenPayload): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  hashRefreshToken(token: string): string;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface IDjiIntegrationProvider {
  parseCsvImport(csvContent: string): Promise<any[]>;
}
