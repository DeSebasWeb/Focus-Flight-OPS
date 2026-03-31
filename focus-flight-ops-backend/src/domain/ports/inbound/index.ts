import {
  UserData,
  PilotData,
  DroneData,
  CertificateData,
  InsuranceData,
  MissionData,
  FlightLogData,
  TelemetryData,
  ChecklistTemplateData,
  ChecklistExecutionData,
  EmergencyContactData,
  EmergencyEventData,
  TokenPair,
  WeatherData,
  AirspaceCheckResult,
  AirspaceZoneData,
} from '../outbound';

// ============================================================
// INPUT TYPES
// ============================================================

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface AuthResult {
  user: { id: string; email: string; firstName: string; lastName: string };
  tokens: TokenPair;
  pilotId?: string;
}

export interface CreatePilotInput {
  licenseType: string;
  uaeacPilotNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface CreateDroneInput {
  modelId: string;
  serialNumber: string;
  registrationNumber?: string;
  mtowGrams: number;
  firmwareVersion?: string;
  purchaseDate?: string;
  photoUrl?: string;
}

export interface CreateCertificateInput {
  type: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
}

export interface CreateInsuranceInput {
  insurerName: string;
  policyNumber: string;
  coverageType?: string;
  coverageAmountCop: number;
  startDate: string;
  endDate: string;
  documentUrl?: string;
}

export interface CreateMissionInput {
  droneId: string;
  purposeId: string;
  name: string;
  purposeDetail?: string;
  plannedDate: string;
  plannedLocationLat: number;
  plannedLocationLng: number;
  plannedLocationName?: string;
  plannedAltitudeM?: number;
  operationType: string;
}

export interface StartFlightInput {
  missionId: string;
  droneId: string;
  takeoffLat: number;
  takeoffLng: number;
  takeoffAltitudeM?: number;
  operationType: string;
}

export interface EndFlightInput {
  landingLat: number;
  landingLng: number;
  maxAltitudeAglM?: number;
  maxDistanceM?: number;
  notes?: string;
}

export interface RecordTelemetryInput {
  timestamp: string;
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

export interface StartChecklistInput {
  missionId: string;
  templateType: string;
  pilotId: string;
}

export interface CheckItemInput {
  isChecked: boolean;
  note?: string;
  photoUrl?: string;
}

export interface TriggerEmergencyInput {
  type: string;
  flightLogId?: string;
  latitude?: number;
  longitude?: number;
  altitudeM?: number;
  description?: string;
}

export interface FlyawayStep {
  order: number;
  instruction: string;
  isCritical: boolean;
}

// ============================================================
// INBOUND PORT INTERFACES (driving ports / service interfaces)
// ============================================================

export interface IAuthService {
  register(data: RegisterInput): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  logout(userId: string): Promise<void>;
}

export interface IUserService {
  findById(id: string): Promise<UserData>;
  update(id: string, data: Partial<{ firstName: string; lastName: string; phone: string }>): Promise<UserData>;
}

export interface IPilotService {
  findByUserId(userId: string): Promise<PilotData | null>;
  create(userId: string, data: CreatePilotInput): Promise<PilotData>;
  update(pilotId: string, data: Partial<CreatePilotInput>): Promise<PilotData>;
}

export interface IDroneService {
  findById(id: string, pilotId: string): Promise<DroneData>;
  findByPilotId(pilotId: string): Promise<DroneData[]>;
  create(pilotId: string, data: CreateDroneInput): Promise<DroneData>;
  update(id: string, pilotId: string, data: Partial<CreateDroneInput>): Promise<DroneData>;
  delete(id: string, pilotId: string): Promise<void>;
}

export interface ICertificateService {
  findByPilotId(pilotId: string): Promise<CertificateData[]>;
  create(pilotId: string, data: CreateCertificateInput): Promise<CertificateData>;
  delete(id: string, pilotId: string): Promise<void>;
  checkExpiry(pilotId: string): Promise<CertificateData[]>;
}

export interface IInsuranceService {
  findByPilotId(pilotId: string): Promise<InsuranceData[]>;
  findActive(pilotId: string): Promise<InsuranceData | null>;
  create(pilotId: string, data: CreateInsuranceInput): Promise<InsuranceData>;
  update(id: string, pilotId: string, data: Partial<CreateInsuranceInput>): Promise<InsuranceData>;
}

export interface IMissionService {
  findById(id: string, pilotId: string): Promise<MissionData>;
  findByPilotId(pilotId: string): Promise<MissionData[]>;
  create(pilotId: string, data: CreateMissionInput): Promise<MissionData>;
  update(id: string, pilotId: string, data: Partial<CreateMissionInput>): Promise<MissionData>;
  updateStatus(id: string, pilotId: string, status: string): Promise<MissionData>;
}

export interface IFlightLogService {
  startFlight(pilotId: string, data: StartFlightInput): Promise<FlightLogData>;
  endFlight(id: string, pilotId: string, data: EndFlightInput): Promise<FlightLogData>;
  findById(id: string, pilotId: string): Promise<FlightLogData>;
  findByPilotId(pilotId: string): Promise<FlightLogData[]>;
  importFromCsv(pilotId: string, csvContent: string): Promise<FlightLogData[]>;
}

export interface ITelemetryService {
  recordPoint(flightLogId: string, data: RecordTelemetryInput): Promise<TelemetryData>;
  findByFlightLogId(flightLogId: string): Promise<TelemetryData[]>;
}

export interface IChecklistService {
  getTemplates(): Promise<ChecklistTemplateData[]>;
  getTemplateByType(type: string): Promise<ChecklistTemplateData>;
  startExecution(data: StartChecklistInput): Promise<ChecklistExecutionData>;
  checkItem(executionId: string, itemId: string, data: CheckItemInput): Promise<void>;
  finalizeExecution(executionId: string): Promise<ChecklistExecutionData>;
  findExecutionsByMission(missionId: string): Promise<ChecklistExecutionData[]>;
}

export interface IEmergencyService {
  getContacts(): Promise<EmergencyContactData[]>;
  getNearestContacts(lat: number, lng: number): Promise<EmergencyContactData[]>;
  triggerEvent(pilotId: string, data: TriggerEmergencyInput): Promise<EmergencyEventData>;
  addAction(eventId: string, actionText: string): Promise<void>;
  resolveEvent(eventId: string): Promise<EmergencyEventData>;
  getFlyawayProtocol(): FlyawayStep[];
}

export interface IWeatherService {
  getCurrent(lat: number, lng: number): Promise<WeatherData>;
  getForecast(lat: number, lng: number, hoursAhead?: number): Promise<WeatherData[]>;
}

export interface IGeofenceService {
  checkAirspace(lat: number, lng: number): Promise<AirspaceCheckResult>;
  getZones(lat: number, lng: number, radiusKm: number): Promise<AirspaceZoneData[]>;
}
