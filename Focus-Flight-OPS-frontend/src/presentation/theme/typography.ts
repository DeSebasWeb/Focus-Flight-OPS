/**
 * Typography system for Focus Flight Ops
 *
 * Uses Inter for UI text and monospace for telemetry readouts.
 * Font sizes in sp (scalable pixels) for accessibility.
 */

export const fontFamily = {
  primary: 'Inter',
  mono: 'JetBrainsMono',
  system: 'System',
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const typography = {
  h1: {
    fontFamily: fontFamily.primary,
    fontSize: 24,
    fontWeight: fontWeight.bold,
    letterSpacing: 0,
    lineHeight: 32,
  },
  h2: {
    fontFamily: fontFamily.primary,
    fontSize: 20,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 0,
    lineHeight: 28,
  },
  h3: {
    fontFamily: fontFamily.primary,
    fontSize: 18,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 0,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.primary,
    fontSize: 16,
    fontWeight: fontWeight.regular,
    lineHeight: 24,
  },
  bodyBold: {
    fontFamily: fontFamily.primary,
    fontSize: 16,
    fontWeight: fontWeight.bold,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fontFamily.primary,
    fontSize: 14,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  button: {
    fontFamily: fontFamily.primary,
    fontSize: 16,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  // Telemetry-specific styles
  telemetryReadout: {
    fontFamily: fontFamily.mono,
    fontSize: 32,
    fontWeight: fontWeight.bold,
    lineHeight: 40,
  },
  telemetryLabel: {
    fontFamily: fontFamily.primary,
    fontSize: 12,
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  flightTimer: {
    fontFamily: fontFamily.mono,
    fontSize: 48,
    fontWeight: fontWeight.bold,
    lineHeight: 56,
  },
} as const;
