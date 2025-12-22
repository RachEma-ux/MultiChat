/**
 * Centralized Z-Index Management System
 * 
 * This file defines a consistent z-index scale for the entire application.
 * All components should import and use these constants instead of hardcoding z-index values.
 * 
 * The scale is designed with clear layers to prevent stacking conflicts:
 * 
 * LAYER HIERARCHY (lowest to highest):
 * 1. Base content (0-99) - Normal page content
 * 2. Sticky elements (100-199) - Headers, footers, sticky nav
 * 3. Floating windows (200-299) - FloatingChatWindow, draggable panels
 * 4. Dropdowns (300-399) - Dropdown menus, select menus, popovers
 * 5. Modals (400-499) - Dialog boxes, modal overlays
 * 6. Notifications (500-599) - Toast messages, alerts
 * 7. Tooltips (600-699) - Tooltip overlays
 * 8. Critical overlays (700+) - Loading screens, error boundaries
 * 
 * USAGE:
 * import { Z_INDEX } from '@/lib/z-index';
 * <div style={{ zIndex: Z_INDEX.MODAL }}>...</div>
 * or
 * <div className={`z-[${Z_INDEX.MODAL}]`}>...</div>
 */

export const Z_INDEX = {
  // Base content layer (0-99)
  BASE: 0,
  CONTENT: 10,
  
  // Sticky elements (100-199)
  STICKY: 100,
  HEADER: 110,
  FOOTER: 120,
  
  // Floating windows (200-299)
  FLOATING_WINDOW: 200,
  FLOATING_WINDOW_ACTIVE: 210,
  FLOATING_WINDOW_MINIMIZED: 220,
  WINDOW_TRAY: 230,
  
  // Dropdowns and popovers (300-399)
  DROPDOWN: 300,
  POPOVER: 310,
  SELECT_MENU: 320,
  CONTEXT_MENU: 330,
  
  // Modals and dialogs (400-499)
  MODAL_BACKDROP: 400,
  MODAL: 410,
  MODAL_NESTED: 420,
  DIALOG: 430,
  
  // Notifications (500-599)
  TOAST: 500,
  NOTIFICATION: 510,
  ALERT: 520,
  
  // Tooltips (600-699)
  TOOLTIP: 600,
  
  // Critical overlays (700+)
  LOADING: 700,
  ERROR_BOUNDARY: 800,
  DEV_TOOLS: 900,
  MAX: 9999,
} as const;

/**
 * CSS class helpers for common z-index values
 * Use these in className for Tailwind compatibility
 */
export const Z_CLASS = {
  FLOATING_WINDOW: 'z-[200]',
  FLOATING_WINDOW_ACTIVE: 'z-[210]',
  DROPDOWN: 'z-[300]',
  POPOVER: 'z-[310]',
  MODAL_BACKDROP: 'z-[400]',
  MODAL: 'z-[410]',
  TOAST: 'z-[500]',
  TOOLTIP: 'z-[600]',
} as const;

/**
 * Type for z-index values
 */
export type ZIndexValue = typeof Z_INDEX[keyof typeof Z_INDEX];
