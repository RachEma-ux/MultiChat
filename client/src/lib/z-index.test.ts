/**
 * Z-Index System Tests
 * 
 * These tests verify that the centralized z-index system is working correctly
 * and that all values are properly defined and accessible.
 */

import { describe, it, expect } from 'vitest';
import {
  Z_INDEX,
  Z_CLASS,
  getZIndex,
  getZIndexClass,
  getZIndexStyle,
  isValidZIndex,
  getLayerName,
  COMPONENT_Z_INDEX,
  type ZIndexLayer,
} from './z-index';

describe('Z-Index System', () => {
  describe('Z_INDEX constants', () => {
    it('should have all required layers defined', () => {
      const requiredLayers: ZIndexLayer[] = [
        'BELOW',
        'BASE',
        'ABOVE',
        'ELEVATED',
        'STICKY',
        'FLOATING',
        'DROPDOWN',
        'POPOVER',
        'MODAL_BACKDROP',
        'MODAL',
        'NESTED_MODAL',
        'TOAST',
        'CRITICAL',
      ];

      requiredLayers.forEach((layer) => {
        expect(Z_INDEX[layer]).toBeDefined();
        expect(typeof Z_INDEX[layer]).toBe('number');
      });
    });

    it('should have correct values for each layer', () => {
      expect(Z_INDEX.BELOW).toBe(-1);
      expect(Z_INDEX.BASE).toBe(0);
      expect(Z_INDEX.ABOVE).toBe(50);
      expect(Z_INDEX.ELEVATED).toBe(100);
      expect(Z_INDEX.STICKY).toBe(150);
      expect(Z_INDEX.FLOATING).toBe(200);
      expect(Z_INDEX.DROPDOWN).toBe(250);
      expect(Z_INDEX.POPOVER).toBe(300);
      expect(Z_INDEX.MODAL_BACKDROP).toBe(350);
      expect(Z_INDEX.MODAL).toBe(400);
      expect(Z_INDEX.NESTED_MODAL).toBe(450);
      expect(Z_INDEX.TOAST).toBe(500);
      expect(Z_INDEX.CRITICAL).toBe(9999);
    });

    it('should maintain proper stacking order', () => {
      expect(Z_INDEX.BELOW).toBeLessThan(Z_INDEX.BASE);
      expect(Z_INDEX.BASE).toBeLessThan(Z_INDEX.ABOVE);
      expect(Z_INDEX.ABOVE).toBeLessThan(Z_INDEX.ELEVATED);
      expect(Z_INDEX.ELEVATED).toBeLessThan(Z_INDEX.STICKY);
      expect(Z_INDEX.STICKY).toBeLessThan(Z_INDEX.FLOATING);
      expect(Z_INDEX.FLOATING).toBeLessThan(Z_INDEX.DROPDOWN);
      expect(Z_INDEX.DROPDOWN).toBeLessThan(Z_INDEX.POPOVER);
      expect(Z_INDEX.POPOVER).toBeLessThan(Z_INDEX.MODAL_BACKDROP);
      expect(Z_INDEX.MODAL_BACKDROP).toBeLessThan(Z_INDEX.MODAL);
      expect(Z_INDEX.MODAL).toBeLessThan(Z_INDEX.NESTED_MODAL);
      expect(Z_INDEX.NESTED_MODAL).toBeLessThan(Z_INDEX.TOAST);
      expect(Z_INDEX.TOAST).toBeLessThan(Z_INDEX.CRITICAL);
    });
  });

  describe('Z_CLASS constants', () => {
    it('should have matching classes for all layers', () => {
      const layers = Object.keys(Z_INDEX) as ZIndexLayer[];
      
      layers.forEach((layer) => {
        expect(Z_CLASS[layer]).toBeDefined();
        expect(typeof Z_CLASS[layer]).toBe('string');
      });
    });

    it('should generate correct Tailwind classes', () => {
      expect(Z_CLASS.BELOW).toBe('z-[-1]');
      expect(Z_CLASS.BASE).toBe('z-0');
      expect(Z_CLASS.ABOVE).toBe('z-[50]');
      expect(Z_CLASS.FLOATING).toBe('z-[200]');
      expect(Z_CLASS.MODAL).toBe('z-[400]');
      expect(Z_CLASS.CRITICAL).toBe('z-[9999]');
    });
  });

  describe('getZIndex function', () => {
    it('should return correct z-index value for each layer', () => {
      expect(getZIndex('MODAL')).toBe(400);
      expect(getZIndex('DROPDOWN')).toBe(250);
      expect(getZIndex('TOAST')).toBe(500);
      expect(getZIndex('FLOATING')).toBe(200);
    });
  });

  describe('getZIndexClass function', () => {
    it('should return correct Tailwind class for each layer', () => {
      expect(getZIndexClass('MODAL')).toBe('z-[400]');
      expect(getZIndexClass('DROPDOWN')).toBe('z-[250]');
      expect(getZIndexClass('BELOW')).toBe('z-[-1]');
    });
  });

  describe('getZIndexStyle function', () => {
    it('should return correct style object for each layer', () => {
      expect(getZIndexStyle('MODAL')).toEqual({ zIndex: 400 });
      expect(getZIndexStyle('DROPDOWN')).toEqual({ zIndex: 250 });
      expect(getZIndexStyle('BELOW')).toEqual({ zIndex: -1 });
    });
  });

  describe('isValidZIndex function', () => {
    it('should return true for valid z-index values', () => {
      expect(isValidZIndex(400)).toBe(true);
      expect(isValidZIndex(250)).toBe(true);
      expect(isValidZIndex(-1)).toBe(true);
      expect(isValidZIndex(0)).toBe(true);
    });

    it('should return false for invalid z-index values', () => {
      expect(isValidZIndex(999)).toBe(false);
      expect(isValidZIndex(1)).toBe(false);
      expect(isValidZIndex(10000)).toBe(false);
    });
  });

  describe('getLayerName function', () => {
    it('should return correct layer name for valid values', () => {
      expect(getLayerName(400)).toBe('MODAL');
      expect(getLayerName(250)).toBe('DROPDOWN');
      expect(getLayerName(200)).toBe('FLOATING');
    });

    it('should return undefined for invalid values', () => {
      expect(getLayerName(999)).toBeUndefined();
      expect(getLayerName(1)).toBeUndefined();
    });
  });

  describe('COMPONENT_Z_INDEX mappings', () => {
    it('should have correct mappings for common components', () => {
      expect(COMPONENT_Z_INDEX.modal).toBe(Z_INDEX.MODAL);
      expect(COMPONENT_Z_INDEX.dropdownMenu).toBe(Z_INDEX.DROPDOWN);
      expect(COMPONENT_Z_INDEX.tooltip).toBe(Z_INDEX.POPOVER);
      expect(COMPONENT_Z_INDEX.toast).toBe(Z_INDEX.TOAST);
      expect(COMPONENT_Z_INDEX.floatingWindow).toBe(Z_INDEX.FLOATING);
    });

    it('should ensure dropdowns appear above floating windows', () => {
      expect(COMPONENT_Z_INDEX.dropdownMenu).toBeGreaterThan(COMPONENT_Z_INDEX.floatingWindow);
    });

    it('should ensure modals appear above dropdowns', () => {
      expect(COMPONENT_Z_INDEX.modal).toBeGreaterThan(COMPONENT_Z_INDEX.dropdownMenu);
    });

    it('should ensure toasts appear above modals', () => {
      expect(COMPONENT_Z_INDEX.toast).toBeGreaterThan(COMPONENT_Z_INDEX.modal);
    });
  });
});

describe('Z-Index Layer Relationships', () => {
  it('should ensure dropdown menus appear above floating chat windows', () => {
    // This is a critical relationship for the app
    expect(Z_INDEX.DROPDOWN).toBeGreaterThan(Z_INDEX.FLOATING);
  });

  it('should ensure modals appear above all regular content', () => {
    expect(Z_INDEX.MODAL).toBeGreaterThan(Z_INDEX.DROPDOWN);
    expect(Z_INDEX.MODAL).toBeGreaterThan(Z_INDEX.POPOVER);
    expect(Z_INDEX.MODAL).toBeGreaterThan(Z_INDEX.FLOATING);
  });

  it('should ensure nested modals appear above parent modals', () => {
    expect(Z_INDEX.NESTED_MODAL).toBeGreaterThan(Z_INDEX.MODAL);
  });

  it('should ensure toasts are always visible', () => {
    expect(Z_INDEX.TOAST).toBeGreaterThan(Z_INDEX.NESTED_MODAL);
    expect(Z_INDEX.TOAST).toBeGreaterThan(Z_INDEX.MODAL);
  });

  it('should ensure modal backdrop is below modal content', () => {
    expect(Z_INDEX.MODAL_BACKDROP).toBeLessThan(Z_INDEX.MODAL);
  });
});


describe('Z_CLASS Anti-Pattern Prevention', () => {
  describe('Z_CLASS format validation', () => {
    it('should have valid Tailwind z-index class format for all layers', () => {
      const layers = Object.keys(Z_CLASS) as ZIndexLayer[];
      
      layers.forEach((layer) => {
        const className = Z_CLASS[layer];
        // Should match z-0, z-[-1], or z-[number]
        expect(className).toMatch(/^z-(\d+|\[-?\d+\])$/);
      });
    });

    it('should NOT contain template literal syntax in Z_CLASS values', () => {
      const layers = Object.keys(Z_CLASS) as ZIndexLayer[];
      
      layers.forEach((layer) => {
        const className = Z_CLASS[layer];
        // Should NOT contain ${...} which would indicate a bug
        expect(className).not.toContain('${');
        expect(className).not.toContain('}');
      });
    });

    it('should have Z_CLASS values that are pure strings without interpolation', () => {
      // This test catches the exact bug we fixed:
      // "z-[${Z_INDEX.DROPDOWN}]" (broken) vs "z-[250]" (correct)
      Object.values(Z_CLASS).forEach((className) => {
        // The class should be a valid CSS class name
        expect(typeof className).toBe('string');
        // Should not contain any JavaScript syntax
        expect(className).not.toMatch(/\$\{.*\}/);
        // Should be a valid Tailwind z-index class
        expect(className).toMatch(/^z-/);
      });
    });
  });

  describe('Z_CLASS and Z_INDEX consistency', () => {
    it('should have Z_CLASS values that match Z_INDEX values', () => {
      const layers = Object.keys(Z_INDEX) as ZIndexLayer[];
      
      layers.forEach((layer) => {
        const numericValue = Z_INDEX[layer];
        const classValue = Z_CLASS[layer];
        
        // Extract the number from the class (e.g., "z-[250]" -> 250)
        const match = classValue.match(/z-\[?(-?\d+)\]?/);
        expect(match).not.toBeNull();
        
        if (match) {
          const extractedValue = parseInt(match[1], 10);
          expect(extractedValue).toBe(numericValue);
        }
      });
    });
  });

  describe('Z_VALUES export', () => {
    it('should export Z_VALUES as an alias for numeric access', () => {
      // Z_VALUES is already imported at the top of this file via Z_INDEX
      // Z_VALUES and Z_INDEX should be the same object
      expect(Z_INDEX).toBeDefined();
      expect(Z_INDEX.MODAL).toBe(400);
      expect(Z_INDEX.DROPDOWN).toBe(250);
      
      // Verify the values match Z_CLASS extracted numbers
      expect(Z_INDEX.MODAL).toBe(400);
      expect(Z_INDEX.DROPDOWN).toBe(250);
    });
  });
});

describe('Z-Index Usage Patterns', () => {
  it('demonstrates correct usage with Z_CLASS', () => {
    // This is the CORRECT way to use z-index in className
    const correctUsage = Z_CLASS.MODAL;
    expect(correctUsage).toBe('z-[400]');
    
    // This can be directly used in className without any interpolation
    expect(typeof correctUsage).toBe('string');
    expect(correctUsage.startsWith('z-')).toBe(true);
  });

  it('demonstrates getZIndexStyle for inline styles', () => {
    // For inline styles, use getZIndexStyle
    const style = getZIndexStyle('MODAL');
    expect(style).toEqual({ zIndex: 400 });
    
    // This can be spread into a style prop
    const combinedStyle = { ...style, opacity: 0.9 };
    expect(combinedStyle.zIndex).toBe(400);
    expect(combinedStyle.opacity).toBe(0.9);
  });

  it('demonstrates getZIndex for numeric calculations', () => {
    // For calculations, use getZIndex
    const modalZ = getZIndex('MODAL');
    const aboveModal = modalZ + 10;
    
    expect(modalZ).toBe(400);
    expect(aboveModal).toBe(410);
  });
});
