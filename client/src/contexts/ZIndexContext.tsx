/**
 * ZIndexContext - Dynamic Z-Index Manager
 * 
 * This context provides a system for managing z-index values dynamically,
 * ensuring that newly opened or clicked components always appear in front.
 * 
 * Key Features:
 * - Tracks all registered floating elements
 * - Assigns z-index based on interaction order (most recent = highest)
 * - Supports different layer categories (floating, dropdown, modal)
 * - Provides hooks for components to register and bring themselves to front
 * 
 * Usage:
 * 1. Wrap your app with <ZIndexProvider>
 * 2. In floating components, use useZIndexManager() to register and get z-index
 * 3. Call bringToFront() when the component is opened or clicked
 */

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { Z_VALUES } from '@/lib/z-index';

// Layer categories with their base z-index values
// Elements within a category will stack above the base
export type LayerCategory = 'floating' | 'dropdown' | 'popover' | 'modal' | 'toast';

const LAYER_BASE: Record<LayerCategory, number> = {
  floating: Z_VALUES.FLOATING,   // 200
  dropdown: Z_VALUES.DROPDOWN,   // 250
  popover: Z_VALUES.POPOVER,     // 300
  modal: Z_VALUES.MODAL,         // 400
  toast: Z_VALUES.TOAST,         // 500
};

// Maximum offset within a category (to prevent overlap with next category)
const MAX_OFFSET: Record<LayerCategory, number> = {
  floating: 49,   // 200-249
  dropdown: 49,   // 250-299
  popover: 49,    // 300-349
  modal: 49,      // 400-449
  toast: 49,      // 500-549
};

interface RegisteredElement {
  id: string;
  category: LayerCategory;
  order: number; // Interaction order (higher = more recent)
  callback?: (zIndex: number) => void; // Callback to notify of z-index changes
}

interface ZIndexContextValue {
  // Register a new element and get its initial z-index
  register: (id: string, category: LayerCategory, callback?: (zIndex: number) => void) => number;
  
  // Unregister an element when it's closed/unmounted
  unregister: (id: string) => void;
  
  // Bring an element to the front of its category
  bringToFront: (id: string) => number;
  
  // Get the current z-index for an element
  getZIndex: (id: string) => number;
  
  // Check if an element is registered
  isRegistered: (id: string) => boolean;
}

const ZIndexContext = createContext<ZIndexContextValue | null>(null);

export function ZIndexProvider({ children }: { children: React.ReactNode }) {
  // Track all registered elements using a ref (doesn't cause re-renders)
  const elementsRef = useRef<Map<string, RegisteredElement>>(new Map());
  
  // Global counter for interaction order
  const orderCounterRef = useRef(0);

  // Calculate z-index for an element based on its order within its category
  const calculateZIndex = useCallback((element: RegisteredElement): number => {
    const elements = Array.from(elementsRef.current.values());
    
    // Get all elements in the same category
    const categoryElements = elements
      .filter(e => e.category === element.category)
      .sort((a, b) => a.order - b.order);
    
    // Find the position of this element within its category
    const position = categoryElements.findIndex(e => e.id === element.id);
    
    // Calculate offset (capped to prevent overlap with next category)
    const offset = Math.min(position, MAX_OFFSET[element.category]);
    
    return LAYER_BASE[element.category] + offset;
  }, []);

  // Register a new element
  const register = useCallback((id: string, category: LayerCategory, callback?: (zIndex: number) => void): number => {
    // If already registered, just return current z-index
    const existing = elementsRef.current.get(id);
    if (existing) {
      // Update callback if provided
      if (callback) {
        existing.callback = callback;
        elementsRef.current.set(id, existing);
      }
      return calculateZIndex(existing);
    }
    
    const order = ++orderCounterRef.current;
    
    const element: RegisteredElement = {
      id,
      category,
      order,
      callback,
    };
    
    elementsRef.current.set(id, element);
    
    return calculateZIndex(element);
  }, [calculateZIndex]);

  // Unregister an element
  const unregister = useCallback((id: string): void => {
    elementsRef.current.delete(id);
  }, []);

  // Bring an element to the front of its category
  const bringToFront = useCallback((id: string): number => {
    const element = elementsRef.current.get(id);
    if (!element) {
      console.warn(`ZIndexContext: Element "${id}" not registered`);
      return 0;
    }
    
    // Update the order to be the highest
    const newOrder = ++orderCounterRef.current;
    element.order = newOrder;
    elementsRef.current.set(id, element);
    
    const newZ = calculateZIndex(element);
    
    // Notify via callback instead of triggering re-renders
    if (element.callback) {
      element.callback(newZ);
    }
    
    return newZ;
  }, [calculateZIndex]);

  // Get the current z-index for an element
  const getZIndex = useCallback((id: string): number => {
    const element = elementsRef.current.get(id);
    if (!element) {
      return 0;
    }
    return calculateZIndex(element);
  }, [calculateZIndex]);

  // Check if an element is registered
  const isRegistered = useCallback((id: string): boolean => {
    return elementsRef.current.has(id);
  }, []);

  // Context value is stable - callbacks are memoized
  const value: ZIndexContextValue = {
    register,
    unregister,
    bringToFront,
    getZIndex,
    isRegistered,
  };

  return (
    <ZIndexContext.Provider value={value}>
      {children}
    </ZIndexContext.Provider>
  );
}

// Hook to access the z-index context
export function useZIndexContext(): ZIndexContextValue {
  const context = useContext(ZIndexContext);
  if (!context) {
    throw new Error('useZIndexContext must be used within a ZIndexProvider');
  }
  return context;
}

/**
 * Hook for managing a single element's z-index
 * 
 * Usage:
 * ```tsx
 * function FloatingWindow({ id }) {
 *   const { zIndex, bringToFront } = useZIndexManager(id, 'floating');
 *   
 *   return (
 *     <div 
 *       style={{ zIndex }} 
 *       onClick={bringToFront}
 *       onMouseDown={bringToFront}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useZIndexManager(id: string, category: LayerCategory) {
  const context = useContext(ZIndexContext);
  const [zIndex, setZIndex] = React.useState(() => LAYER_BASE[category]);
  const registeredRef = useRef(false);

  // Register on mount with callback, unregister on unmount
  React.useEffect(() => {
    if (!context) return;
    
    // Register with callback to update local state
    const initialZ = context.register(id, category, (newZ) => {
      setZIndex(newZ);
    });
    setZIndex(initialZ);
    registeredRef.current = true;
    
    return () => {
      context.unregister(id);
      registeredRef.current = false;
    };
  }, [context, id, category]);

  const bringToFront = useCallback(() => {
    if (!context) return;
    const newZ = context.bringToFront(id);
    setZIndex(newZ);
  }, [context, id]);

  return {
    zIndex,
    bringToFront,
    isRegistered: registeredRef.current,
  };
}

/**
 * Simple hook to just bring an element to front without full management
 * Useful for dropdowns that need to appear above other elements
 */
export function useBringToFront(id: string, category: LayerCategory) {
  const context = useContext(ZIndexContext);
  const [zIndex, setZIndex] = React.useState(LAYER_BASE[category]);

  const bringToFront = useCallback(() => {
    if (!context) {
      // Fallback: just use the base z-index for the category
      return LAYER_BASE[category];
    }
    
    // Register if not already registered
    if (!context.isRegistered(id)) {
      const z = context.register(id, category);
      setZIndex(z);
      return z;
    }
    
    // Bring to front
    const z = context.bringToFront(id);
    setZIndex(z);
    return z;
  }, [context, id, category]);

  const close = useCallback(() => {
    if (context?.isRegistered(id)) {
      context.unregister(id);
    }
  }, [context, id]);

  return {
    zIndex,
    bringToFront,
    close,
  };
}

export default ZIndexContext;
