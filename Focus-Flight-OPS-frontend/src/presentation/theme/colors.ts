export interface ThemeColors {
  surface0: string;
  surface1: string;
  surface2: string;
  surface3: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textOnPrimary: string;
  emergencyBg: string;
  emergencyText: string;
  emergencyBorder: string;
  mapSafe: string;
  mapCaution: string;
  mapRestricted: string;
  batteryFull: string;
  batteryMedium: string;
  batteryLow: string;
  signalStrong: string;
  signalWeak: string;
  border: string;
  divider: string;
  transparent: string;
  overlay: string;
  mapTileUrl: string;
}

/**
 * Dark theme - Optimized for outdoor use under sunlight.
 * Surfaces slightly lifted from pure black for better sun readability.
 * High-contrast text and bright accent colors.
 */
export const darkColors: ThemeColors = {
  // Surfaces: lifted from pure black for outdoor readability
  surface0: '#101018',
  surface1: '#1A1A28',
  surface2: '#242436',
  surface3: '#30304A',

  // Primary: bright cyan - visible under direct sunlight
  primary: '#56CCF2',
  primaryLight: '#8DE4FF',
  primaryDark: '#0288D1',

  // Semantic: extra bright for outdoor visibility
  success: '#00E676',
  warning: '#FFEA00',
  danger: '#FF5252',
  info: '#40C4FF',

  // Text: high contrast whites
  textPrimary: '#F8F8F8',
  textSecondary: '#B8C4CE',
  textDisabled: '#6B6B80',
  textOnPrimary: '#0A0A0F',

  // Emergency: maximum contrast
  emergencyBg: '#D50000',
  emergencyText: '#FFFFFF',
  emergencyBorder: '#FF8A80',

  // Map zones: HIGHER opacity for sun visibility
  mapSafe: 'rgba(0, 230, 118, 0.45)',
  mapCaution: 'rgba(255, 234, 0, 0.45)',
  mapRestricted: 'rgba(255, 82, 82, 0.45)',

  // Battery/Signal: bright neon for quick glance
  batteryFull: '#00E676',
  batteryMedium: '#FFEA00',
  batteryLow: '#FF5252',
  signalStrong: '#00E676',
  signalWeak: '#FF5252',

  // Borders: slightly brighter for visibility
  border: '#363650',
  divider: '#242436',
  transparent: 'transparent',
  overlay: 'rgba(10, 10, 15, 0.7)',

  // Map: use Voyager (slightly lighter than dark_all, better road visibility)
  mapTileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
};

/**
 * Light theme - Maximum outdoor readability.
 */
export const lightColors: ThemeColors = {
  surface0: '#F5F5F8',
  surface1: '#FFFFFF',
  surface2: '#F0F0F4',
  surface3: '#E8E8EE',
  primary: '#0277BD',
  primaryLight: '#4FC3F7',
  primaryDark: '#01579B',
  success: '#2E7D32',
  warning: '#F57F17',
  danger: '#C62828',
  info: '#0277BD',
  textPrimary: '#1A1A2E',
  textSecondary: '#5C5C72',
  textDisabled: '#9E9EB0',
  textOnPrimary: '#FFFFFF',
  emergencyBg: '#C62828',
  emergencyText: '#FFFFFF',
  emergencyBorder: '#EF5350',
  mapSafe: 'rgba(46, 125, 50, 0.30)',
  mapCaution: 'rgba(245, 127, 23, 0.30)',
  mapRestricted: 'rgba(198, 40, 40, 0.30)',
  batteryFull: '#2E7D32',
  batteryMedium: '#F57F17',
  batteryLow: '#C62828',
  signalStrong: '#2E7D32',
  signalWeak: '#C62828',
  border: '#D8D8E0',
  divider: '#E8E8EE',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.4)',
  mapTileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

// Default export for backward compatibility
export const colors = darkColors;

export type ColorToken = keyof ThemeColors;
