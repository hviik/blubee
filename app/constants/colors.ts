/**
 * Blubeez Color Palette
 * Centralized color constants to maintain design consistency
 */

export const COLORS = {
  // Primary Brand Colors
  blubeezBlue: '#2d4e92',
  blubeezDark: '#132341',
  blubeezNavy: '#2f4f93',
  
  // Background Effects
  blurEllipse1: '#b4caff',
  blurEllipse2: '#aaceff',
  
  // Grid Lines
  gridLines: '#a0a0a0',
  
  // Text Colors
  textBlack: '#000000',
  textPrimary: '#181818',
  textSecondary: '#807f7f',
  textTertiary: '#132341',
  textQuaternary: '#475f73',
  textModalTitle: '#2f4f93',
  textModalTitleDesktop: '#475f73',
  textModalSubtitle: '#7286b0',
  textModalSubtitleDesktop: '#768a9a',
  
  // Border Colors
  borderLight: '#d5d5d5',
  borderMedium: '#cbcbcb',
  borderDark: '#2c3d5d',
  borderInput: '#475f73',
  
  // Background Colors
  white: '#ffffff',
  transparent: 'transparent',
  
  // Modal Overlay
  modalOverlay: 'rgba(0, 0, 0, 0.2)',
} as const;

export type ColorKey = keyof typeof COLORS;
