import ExpoDjiTelemetryModule from './src/ExpoDjiTelemetryModule';

interface EventSubscription {
  remove(): void;
}

// --- Types (infrastructure-level, NOT domain types) ---

export interface DjiRawTelemetry {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitudeM: number;
  speedMs: number;
  headingDeg: number;
  batteryPercent: number;
  signalStrength: number;
  satelliteCount: number;
  distanceFromPilotM: number;
  pitch: number;
  roll: number;
  yaw: number;
  flightMode: string;
  isLowBattery: boolean;
  flightTimeSeconds: number;
  windSpeedMs: number;
}

export interface DjiConnectionEvent {
  connected: boolean;
  productName: string | null;
}

export interface DjiSdkError {
  code: string;
  message: string;
}

// --- Functions ---

export const initialize = (): Promise<void> =>
  ExpoDjiTelemetryModule.initialize();

export const startTelemetryListeners = (): Promise<void> =>
  ExpoDjiTelemetryModule.startTelemetryListeners();

export const stopTelemetryListeners = (): void =>
  ExpoDjiTelemetryModule.stopTelemetryListeners();

export const getConnectionStatus = (): boolean =>
  ExpoDjiTelemetryModule.getConnectionStatus();

export const getProductName = (): string | null =>
  ExpoDjiTelemetryModule.getProductName();

// --- Event Listeners (native module IS the EventEmitter in Expo SDK 52+) ---

export const addTelemetryListener = (callback: (data: DjiRawTelemetry) => void): EventSubscription =>
  ExpoDjiTelemetryModule.addListener('onTelemetryUpdate', callback);

export const addConnectionListener = (callback: (event: DjiConnectionEvent) => void): EventSubscription =>
  ExpoDjiTelemetryModule.addListener('onConnectionChange', callback);

export const addErrorListener = (callback: (error: DjiSdkError) => void): EventSubscription =>
  ExpoDjiTelemetryModule.addListener('onSdkError', callback);
