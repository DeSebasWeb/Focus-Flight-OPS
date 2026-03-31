export enum DroneCategory {
  OPEN = 'OPEN',
  SPECIFIC = 'SPECIFIC',
  CERTIFIED = 'CERTIFIED',
}

export enum OperationType {
  VLOS = 'VLOS',
  EVLOS = 'EVLOS',
  BVLOS = 'BVLOS',
}

export enum ChecklistType {
  PRE_ASSEMBLY = 'PRE_ASSEMBLY',
  CONFIGURATION = 'CONFIGURATION',
  PRE_TAKEOFF = 'PRE_TAKEOFF',
  POST_FLIGHT = 'POST_FLIGHT',
}

export enum FlightStatus {
  PLANNED = 'PLANNED',
  PREFLIGHT = 'PREFLIGHT',
  IN_FLIGHT = 'IN_FLIGHT',
  LANDED = 'LANDED',
  CLOSED = 'CLOSED',
}

export enum EmergencyType {
  FLYAWAY = 'FLYAWAY',
  SIGNAL_LOSS = 'SIGNAL_LOSS',
  BATTERY_CRITICAL = 'BATTERY_CRITICAL',
  INJURY = 'INJURY',
  AIRSPACE_VIOLATION = 'AIRSPACE_VIOLATION',
}

export enum RegulatoryVersion {
  RAC91_AP13 = 'RAC91_AP13',
  RAC100 = 'RAC100',
}

export enum DocumentType {
  CC = 'CC',
  CE = 'CE',
  PASSPORT = 'PASSPORT',
}

export enum MissionStatus {
  PLANNED = 'PLANNED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ChecklistExecutionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  ABORTED = 'ABORTED',
}

export enum FlightLogStatus {
  IN_FLIGHT = 'IN_FLIGHT',
  COMPLETED = 'COMPLETED',
  EMERGENCY_LANDED = 'EMERGENCY_LANDED',
}

export enum FlightSource {
  MANUAL = 'MANUAL',
  DJI_SYNC = 'DJI_SYNC',
  CSV_IMPORT = 'CSV_IMPORT',
}
