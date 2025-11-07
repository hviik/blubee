/**
 * Z-Index Constants for Layout Components
 * 
 * Unified stacking context to prevent z-index conflicts
 * and ensure predictable layering across the application.
 * 
 * Usage:
 * - Import: import { Z } from '@/lib/layoutZ';
 * - Apply: style={{ zIndex: Z.header }} or className="z-[50]"
 */

export const Z = {
  /** Header component - always on top of main content */
  header: 50,
  
  /** Sidebar component - below header but above content */
  sidebar: 40,
  
  /** Chat container - below sidebar/header */
  chat: 30,
  
  /** Modal overlays/backdrops - above all normal content */
  overlay: 60,
  
  /** Mobile sidebar overlay - same as modal overlay */
  sidebarOverlay: 60,
  
  /** Mobile sidebar panel - above overlay */
  sidebarPanel: 65,
  
  /** Hamburger menu button - always accessible, above all */
  hamburger: 70,
} as const;

export type ZIndexKey = keyof typeof Z;

