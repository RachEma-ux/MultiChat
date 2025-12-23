import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Tailwind breakpoint values (in pixels)
 * These match the default Tailwind CSS breakpoints
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Device type based on viewport width
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Viewport information returned by useResponsive hook
 */
export interface ViewportInfo {
  /** Current viewport width in pixels */
  width: number;
  /** Current viewport height in pixels */
  height: number;
  /** Whether the viewport is mobile-sized (< 768px) */
  isMobile: boolean;
  /** Whether the viewport is tablet-sized (768px - 1023px) */
  isTablet: boolean;
  /** Whether the viewport is desktop-sized (>= 1024px) */
  isDesktop: boolean;
  /** Current device type */
  deviceType: DeviceType;
  /** Whether touch is the primary input method */
  isTouchDevice: boolean;
  /** Current active breakpoint */
  breakpoint: Breakpoint | 'xs';
  /** Check if viewport is at or above a specific breakpoint */
  isAbove: (bp: Breakpoint) => boolean;
  /** Check if viewport is below a specific breakpoint */
  isBelow: (bp: Breakpoint) => boolean;
  /** Check if viewport is between two breakpoints (inclusive) */
  isBetween: (minBp: Breakpoint, maxBp: Breakpoint) => boolean;
}

/**
 * Debounce utility for resize events
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Detect if the device supports touch
 */
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is IE-specific
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get the current breakpoint based on viewport width
 */
function getBreakpoint(width: number): Breakpoint | 'xs' {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Get device type based on viewport width
 */
function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
}

/**
 * Hook for responsive viewport information
 * 
 * @param debounceMs - Debounce delay for resize events (default: 100ms)
 * @returns ViewportInfo object with current viewport state and utilities
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isAbove, deviceType } = useResponsive();
 *   
 *   return (
 *     <div className={isMobile ? 'flex-col' : 'flex-row'}>
 *       {isAbove('lg') && <Sidebar />}
 *       <Content />
 *     </div>
 *   );
 * }
 * ```
 */
export function useResponsive(debounceMs: number = 100): ViewportInfo {
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  const [isTouchDevice] = useState(() => detectTouchDevice());

  useEffect(() => {
    const handleResize = debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, debounceMs);

    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [debounceMs]);

  const isAbove = useCallback(
    (bp: Breakpoint) => dimensions.width >= BREAKPOINTS[bp],
    [dimensions.width]
  );

  const isBelow = useCallback(
    (bp: Breakpoint) => dimensions.width < BREAKPOINTS[bp],
    [dimensions.width]
  );

  const isBetween = useCallback(
    (minBp: Breakpoint, maxBp: Breakpoint) =>
      dimensions.width >= BREAKPOINTS[minBp] && dimensions.width < BREAKPOINTS[maxBp],
    [dimensions.width]
  );

  const viewportInfo = useMemo<ViewportInfo>(() => {
    const { width, height } = dimensions;
    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg;

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      deviceType: getDeviceType(width),
      isTouchDevice,
      breakpoint: getBreakpoint(width),
      isAbove,
      isBelow,
      isBetween,
    };
  }, [dimensions, isTouchDevice, isAbove, isBelow, isBetween]);

  return viewportInfo;
}

/**
 * Hook for checking a single breakpoint
 * More performant than useResponsive when you only need one check
 * 
 * @param breakpoint - The breakpoint to check against
 * @param direction - 'above' (>=) or 'below' (<)
 * @returns boolean indicating if condition is met
 * 
 * @example
 * ```tsx
 * const isLargeScreen = useBreakpoint('lg', 'above');
 * const isMobileOnly = useBreakpoint('md', 'below');
 * ```
 */
export function useBreakpoint(
  breakpoint: Breakpoint,
  direction: 'above' | 'below' = 'above'
): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return direction === 'above';
    const width = window.innerWidth;
    return direction === 'above'
      ? width >= BREAKPOINTS[breakpoint]
      : width < BREAKPOINTS[breakpoint];
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      direction === 'above'
        ? `(min-width: ${BREAKPOINTS[breakpoint]}px)`
        : `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`
    );

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint, direction]);

  return matches;
}

/**
 * Hook for touch-friendly event handling
 * Returns handlers that work for both mouse and touch
 * 
 * @example
 * ```tsx
 * const { handlers, isPressed } = useTouchHandlers({
 *   onPress: () => console.log('pressed'),
 *   onRelease: () => console.log('released'),
 * });
 * 
 * return <button {...handlers}>Click me</button>;
 * ```
 */
export function useTouchHandlers(options: {
  onPress?: () => void;
  onRelease?: () => void;
  onLongPress?: () => void;
  longPressDelay?: number;
}) {
  const { onPress, onRelease, onLongPress, longPressDelay = 500 } = options;
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useMemo(() => ({ current: null as ReturnType<typeof setTimeout> | null }), []);

  const handleStart = useCallback(() => {
    setIsPressed(true);
    onPress?.();

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }
  }, [onPress, onLongPress, longPressDelay, longPressTimer]);

  const handleEnd = useCallback(() => {
    setIsPressed(false);
    onRelease?.();

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, [onRelease, longPressTimer]);

  const handlers = useMemo(
    () => ({
      onMouseDown: handleStart,
      onMouseUp: handleEnd,
      onMouseLeave: handleEnd,
      onTouchStart: handleStart,
      onTouchEnd: handleEnd,
      onTouchCancel: handleEnd,
    }),
    [handleStart, handleEnd]
  );

  return { handlers, isPressed };
}

/**
 * Z-Index scale constants for consistent layering
 * Use these instead of arbitrary z-index values
 */
export const Z_INDEX = {
  /** Base content layer */
  base: 0,
  /** Floating elements like tooltips */
  tooltip: 50,
  /** Sticky headers and navigation */
  sticky: 100,
  /** Dropdown menus and select popups */
  dropdown: 200,
  /** Modal backdrop overlay */
  modalBackdrop: 300,
  /** Modal content */
  modal: 400,
  /** Toast notifications */
  toast: 500,
  /** Critical overlays (use sparingly) */
  critical: 9999,
} as const;

export type ZIndexLayer = keyof typeof Z_INDEX;

/**
 * Get z-index value for a specific layer
 */
export function getZIndex(layer: ZIndexLayer): number {
  return Z_INDEX[layer];
}

export default useResponsive;
