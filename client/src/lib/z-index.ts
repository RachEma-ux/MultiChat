/**
 * Centralized Z-Index Management System
 * =====================================
 * 
 * This file is the SINGLE SOURCE OF TRUTH for all z-index values in the application.
 * 
 * WHY THIS EXISTS:
 * - Prevents z-index conflicts between components
 * - Ensures consistent layering across the entire app
 * - Makes it easy to understand the visual stacking order
 * - Provides TypeScript enforcement to catch errors at compile time
 * 
 * RULES:
 * 1. NEVER use arbitrary z-index values (z-50, z-[999], etc.) in components
 * 2. ALWAYS use Z_CLASS for Tailwind classes (e.g., Z_CLASS.MODAL)
 * 3. Use Z_VALUES only when you need numeric values (e.g., inline styles)
 * 4. If you need a new layer, add it here with proper documentation
 * 
 * ⚠️ ANTI-PATTERNS TO AVOID:
 * ❌ z-[${Z_VALUES.MODAL}]     - Template literal in regular string doesn't work!
 * ❌ `z-[${someVariable}]`     - Dynamic classes aren't picked up by Tailwind
 * ❌ z-50, z-[999]             - Arbitrary values bypass the system
 * 
 * ✅ CORRECT USAGE:
 * ✅ Z_CLASS.MODAL             - Pre-computed class string
 * ✅ style={{ zIndex: Z_VALUES.MODAL }}  - Inline style for dynamic needs
 * ✅ getZIndexClass('MODAL')   - Function that returns class string
 * 
 * LAYER HIERARCHY (from bottom to top):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ z-9999  CRITICAL    │ System-level overlays, loading screens │
 * │ z-500   TOAST       │ Toast notifications, snackbars          │
 * │ z-450   NESTED_MODAL│ Modals inside modals                    │
 * │ z-400   MODAL       │ Modal dialogs, full-screen overlays     │
 * │ z-350   MODAL_BACKDROP │ Dark backdrop behind modals          │
 * │ z-300   POPOVER     │ Popovers, tooltips                      │
 * │ z-250   DROPDOWN    │ Dropdown menus, select menus            │
 * │ z-200   FLOATING    │ Floating windows, chat windows          │
 * │ z-150   STICKY      │ Sticky headers, floating action buttons │
 * │ z-100   ELEVATED    │ Cards with elevation, raised elements   │
 * │ z-50    ABOVE       │ Elements slightly above normal flow     │
 * │ z-0     BASE        │ Normal document flow                    │
 * │ z-(-1)  BELOW       │ Background elements, decorations        │
 * └─────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// INTERNAL Z-INDEX SCALE (Not exported directly to prevent misuse)
// =============================================================================

/**
 * Internal z-index numeric values.
 * NOT exported directly - use Z_VALUES for numeric access.
 */
const _Z_INDEX = {
  BELOW: -1,
  BASE: 0,
  ABOVE: 50,
  ELEVATED: 100,
  STICKY: 150,
  FLOATING: 200,
  DROPDOWN: 250,
  SIDEBAR_BACKDROP: 275,  // Backdrop behind sidebar menu (above floating windows)
  SIDEBAR_MENU: 280,      // Sidebar/hamburger menu (above floating windows and dropdowns)
  POPOVER: 300,
  MODAL_BACKDROP: 350,
  MODAL: 400,
  NESTED_MODAL: 450,
  TOAST: 500,
  CRITICAL: 9999,
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** All valid z-index layer names */
export type ZIndexLayer = keyof typeof _Z_INDEX;

/** All valid z-index values */
export type ZIndexValue = typeof _Z_INDEX[ZIndexLayer];

// =============================================================================
// EXPORTED CONSTANTS - USE THESE!
// =============================================================================

/**
 * Z_VALUES - Numeric z-index values for inline styles and calculations.
 * 
 * USE THIS when you need the actual number (e.g., for style={{ zIndex: ... }})
 * 
 * @example
 * // For inline styles
 * <div style={{ zIndex: Z_VALUES.MODAL }}>Modal</div>
 * 
 * // For calculations
 * const aboveModal = Z_VALUES.MODAL + 10;
 */
export const Z_VALUES = _Z_INDEX;

/**
 * @deprecated Use Z_VALUES instead. Z_INDEX is kept for backward compatibility
 * but will be removed in a future version.
 * 
 * ⚠️ WARNING: Do NOT use Z_INDEX in template literals within className strings!
 * ❌ WRONG: className={`z-[${Z_INDEX.MODAL}]`}  // Works but error-prone
 * ❌ WRONG: className="z-[${Z_INDEX.MODAL}]"    // BROKEN - not interpolated!
 * ✅ RIGHT: className={Z_CLASS.MODAL}           // Always use Z_CLASS for classes
 */
export const Z_INDEX = _Z_INDEX;

/**
 * Z_CLASS - Pre-computed Tailwind CSS classes for z-index.
 * 
 * ✅ ALWAYS USE THIS for className props!
 * 
 * These are pre-computed strings that Tailwind can statically analyze.
 * Using these prevents template literal bugs and ensures classes are included in the build.
 * 
 * @example
 * // In className (CORRECT)
 * <div className={Z_CLASS.MODAL}>Modal content</div>
 * <div className={cn("other-classes", Z_CLASS.DROPDOWN)}>Dropdown</div>
 * 
 * // With conditional classes
 * <div className={cn(isOpen && Z_CLASS.MODAL)}>Content</div>
 */
export const Z_CLASS = {
  BELOW: 'z-[-1]',
  BASE: 'z-0',
  ABOVE: 'z-[50]',
  ELEVATED: 'z-[100]',
  STICKY: 'z-[150]',
  FLOATING: 'z-[200]',
  DROPDOWN: 'z-[250]',
  SIDEBAR_BACKDROP: 'z-[275]',
  SIDEBAR_MENU: 'z-[280]',
  POPOVER: 'z-[300]',
  MODAL_BACKDROP: 'z-[350]',
  MODAL: 'z-[400]',
  NESTED_MODAL: 'z-[450]',
  TOAST: 'z-[500]',
  CRITICAL: 'z-[9999]',
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the z-index numeric value for a specific layer.
 * 
 * @example
 * const modalZ = getZIndex('MODAL'); // Returns 400
 * <div style={{ zIndex: getZIndex('FLOATING') }}>Window</div>
 */
export function getZIndex(layer: ZIndexLayer): ZIndexValue {
  return _Z_INDEX[layer];
}

/**
 * Get the Tailwind CSS class for a z-index layer.
 * 
 * Prefer using Z_CLASS directly for better readability,
 * but this function is useful for dynamic layer selection.
 * 
 * @example
 * <div className={getZIndexClass('MODAL')}>Modal content</div>
 * // Renders: <div class="z-[400]">Modal content</div>
 * 
 * // Dynamic usage
 * const layer: ZIndexLayer = isModal ? 'MODAL' : 'DROPDOWN';
 * <div className={getZIndexClass(layer)}>Content</div>
 */
export function getZIndexClass(layer: ZIndexLayer): string {
  return Z_CLASS[layer];
}

/**
 * Get inline style object for z-index.
 * Useful when you need to apply z-index via style prop.
 * 
 * @example
 * <div style={getZIndexStyle('FLOATING')}>Floating window</div>
 * 
 * // Combining with other styles
 * <div style={{ ...getZIndexStyle('MODAL'), opacity: 0.9 }}>Modal</div>
 */
export function getZIndexStyle(layer: ZIndexLayer): { zIndex: number } {
  return { zIndex: _Z_INDEX[layer] };
}

/**
 * Create a z-index class with an offset from a base layer.
 * Useful for stacking elements within the same layer category.
 * 
 * @example
 * // Modal content slightly above modal backdrop
 * <div className={getZIndexClassWithOffset('MODAL', 10)}>Modal Content</div>
 * // Returns: "z-[410]"
 */
export function getZIndexClassWithOffset(layer: ZIndexLayer, offset: number): string {
  const value = _Z_INDEX[layer] + offset;
  return `z-[${value}]`;
}

// =============================================================================
// COMPONENT-SPECIFIC MAPPINGS
// =============================================================================

/**
 * Recommended z-index layers for common component types.
 * Use this as a reference when building new components.
 */
export const COMPONENT_Z_INDEX = {
  // Layout components
  header: _Z_INDEX.STICKY,
  sidebar: _Z_INDEX.ELEVATED,
  sidebarMenu: _Z_INDEX.SIDEBAR_MENU,
  sidebarBackdrop: _Z_INDEX.SIDEBAR_BACKDROP,
  footer: _Z_INDEX.ELEVATED,
  
  // Floating elements
  floatingWindow: _Z_INDEX.FLOATING,
  floatingButton: _Z_INDEX.STICKY,
  windowDock: _Z_INDEX.FLOATING,
  
  // Menus and dropdowns
  dropdownMenu: _Z_INDEX.DROPDOWN,
  selectMenu: _Z_INDEX.DROPDOWN,
  contextMenu: _Z_INDEX.DROPDOWN,
  
  // Popovers and tooltips
  tooltip: _Z_INDEX.POPOVER,
  popover: _Z_INDEX.POPOVER,
  
  // Modals and dialogs
  modalBackdrop: _Z_INDEX.MODAL_BACKDROP,
  modal: _Z_INDEX.MODAL,
  dialog: _Z_INDEX.MODAL,
  drawer: _Z_INDEX.MODAL,
  nestedModal: _Z_INDEX.NESTED_MODAL,
  confirmDialog: _Z_INDEX.NESTED_MODAL,
  
  // Notifications
  toast: _Z_INDEX.TOAST,
  notification: _Z_INDEX.TOAST,
  snackbar: _Z_INDEX.TOAST,
  
  // System
  loadingOverlay: _Z_INDEX.CRITICAL,
  errorBoundary: _Z_INDEX.CRITICAL,
} as const;

/**
 * Pre-computed Tailwind classes for component types.
 * Use these directly in components for maximum safety.
 */
export const COMPONENT_Z_CLASS = {
  // Layout components
  header: Z_CLASS.STICKY,
  sidebar: Z_CLASS.ELEVATED,
  sidebarMenu: Z_CLASS.SIDEBAR_MENU,
  sidebarBackdrop: Z_CLASS.SIDEBAR_BACKDROP,
  footer: Z_CLASS.ELEVATED,
  
  // Floating elements
  floatingWindow: Z_CLASS.FLOATING,
  floatingButton: Z_CLASS.STICKY,
  windowDock: Z_CLASS.FLOATING,
  
  // Menus and dropdowns
  dropdownMenu: Z_CLASS.DROPDOWN,
  selectMenu: Z_CLASS.DROPDOWN,
  contextMenu: Z_CLASS.DROPDOWN,
  
  // Popovers and tooltips
  tooltip: Z_CLASS.POPOVER,
  popover: Z_CLASS.POPOVER,
  
  // Modals and dialogs
  modalBackdrop: Z_CLASS.MODAL_BACKDROP,
  modal: Z_CLASS.MODAL,
  dialog: Z_CLASS.MODAL,
  drawer: Z_CLASS.MODAL,
  nestedModal: Z_CLASS.NESTED_MODAL,
  confirmDialog: Z_CLASS.NESTED_MODAL,
  
  // Notifications
  toast: Z_CLASS.TOAST,
  notification: Z_CLASS.TOAST,
  snackbar: Z_CLASS.TOAST,
  
  // System
  loadingOverlay: Z_CLASS.CRITICAL,
  errorBoundary: Z_CLASS.CRITICAL,
} as const;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if a z-index value is valid according to our scale.
 * Useful for runtime validation or testing.
 */
export function isValidZIndex(value: number): boolean {
  return Object.values(_Z_INDEX).includes(value as ZIndexValue);
}

/**
 * Get the layer name for a z-index value.
 * Returns undefined if the value is not in our scale.
 */
export function getLayerName(value: number): ZIndexLayer | undefined {
  const entries = Object.entries(_Z_INDEX) as [ZIndexLayer, ZIndexValue][];
  const entry = entries.find(([_, v]) => v === value);
  return entry?.[0];
}
