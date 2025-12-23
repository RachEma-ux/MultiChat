import { describe, it, expect } from 'vitest';
import { BREAKPOINTS, Z_INDEX, getZIndex } from './useResponsive';

// Test the exported constants and utility functions
// Hook testing would require @testing-library/react which is not installed

describe('BREAKPOINTS', () => {
  it('should have correct Tailwind breakpoint values', () => {
    expect(BREAKPOINTS.sm).toBe(640);
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
    expect(BREAKPOINTS.xl).toBe(1280);
    expect(BREAKPOINTS['2xl']).toBe(1536);
  });

  it('should have all expected breakpoints defined', () => {
    const expectedBreakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
    expectedBreakpoints.forEach(bp => {
      expect(BREAKPOINTS).toHaveProperty(bp);
      expect(typeof BREAKPOINTS[bp as keyof typeof BREAKPOINTS]).toBe('number');
    });
  });

  it('should have breakpoints in ascending order', () => {
    expect(BREAKPOINTS.sm).toBeLessThan(BREAKPOINTS.md);
    expect(BREAKPOINTS.md).toBeLessThan(BREAKPOINTS.lg);
    expect(BREAKPOINTS.lg).toBeLessThan(BREAKPOINTS.xl);
    expect(BREAKPOINTS.xl).toBeLessThan(BREAKPOINTS['2xl']);
  });
});

describe('Z_INDEX', () => {
  it('should have correct z-index scale values', () => {
    expect(Z_INDEX.base).toBe(0);
    expect(Z_INDEX.tooltip).toBe(50);
    expect(Z_INDEX.sticky).toBe(100);
    expect(Z_INDEX.dropdown).toBe(200);
    expect(Z_INDEX.modalBackdrop).toBe(300);
    expect(Z_INDEX.modal).toBe(400);
    expect(Z_INDEX.toast).toBe(500);
    expect(Z_INDEX.critical).toBe(9999);
  });

  it('should maintain proper layering order', () => {
    // Each layer should be higher than the previous
    expect(Z_INDEX.base).toBeLessThan(Z_INDEX.tooltip);
    expect(Z_INDEX.tooltip).toBeLessThan(Z_INDEX.sticky);
    expect(Z_INDEX.sticky).toBeLessThan(Z_INDEX.dropdown);
    expect(Z_INDEX.dropdown).toBeLessThan(Z_INDEX.modalBackdrop);
    expect(Z_INDEX.modalBackdrop).toBeLessThan(Z_INDEX.modal);
    expect(Z_INDEX.modal).toBeLessThan(Z_INDEX.toast);
    expect(Z_INDEX.toast).toBeLessThan(Z_INDEX.critical);
  });

  it('should have all expected layers defined', () => {
    const expectedLayers = ['base', 'tooltip', 'sticky', 'dropdown', 'modalBackdrop', 'modal', 'toast', 'critical'];
    expectedLayers.forEach(layer => {
      expect(Z_INDEX).toHaveProperty(layer);
      expect(typeof Z_INDEX[layer as keyof typeof Z_INDEX]).toBe('number');
    });
  });

  it('should have dropdown below modal for proper layering', () => {
    // This is critical for our UI - dropdowns should never appear above modals
    expect(Z_INDEX.dropdown).toBeLessThan(Z_INDEX.modal);
  });

  it('should have modal backdrop below modal content', () => {
    // Backdrop should be behind the modal content
    expect(Z_INDEX.modalBackdrop).toBeLessThan(Z_INDEX.modal);
  });

  it('should have toast above modal for notifications', () => {
    // Toasts should appear above modals so users can see notifications
    expect(Z_INDEX.toast).toBeGreaterThan(Z_INDEX.modal);
  });
});

describe('getZIndex', () => {
  it('should return correct z-index for each layer', () => {
    expect(getZIndex('base')).toBe(0);
    expect(getZIndex('tooltip')).toBe(50);
    expect(getZIndex('sticky')).toBe(100);
    expect(getZIndex('dropdown')).toBe(200);
    expect(getZIndex('modalBackdrop')).toBe(300);
    expect(getZIndex('modal')).toBe(400);
    expect(getZIndex('toast')).toBe(500);
    expect(getZIndex('critical')).toBe(9999);
  });

  it('should return the same value as direct Z_INDEX access', () => {
    const layers = ['base', 'tooltip', 'sticky', 'dropdown', 'modalBackdrop', 'modal', 'toast', 'critical'] as const;
    layers.forEach(layer => {
      expect(getZIndex(layer)).toBe(Z_INDEX[layer]);
    });
  });
});

describe('Z-Index Scale Compliance', () => {
  // These tests verify our z-index scale matches what we documented
  
  it('should have dropdown at z-200 as per our standard', () => {
    expect(Z_INDEX.dropdown).toBe(200);
  });

  it('should have modal at z-400 as per our standard', () => {
    expect(Z_INDEX.modal).toBe(400);
  });

  it('should have toast at z-500 as per our standard', () => {
    expect(Z_INDEX.toast).toBe(500);
  });

  it('should have 100 units gap between dropdown and modalBackdrop for nested elements', () => {
    // This gap allows for z-250, z-275 etc for elements that need to be between
    const gap = Z_INDEX.modalBackdrop - Z_INDEX.dropdown;
    expect(gap).toBe(100);
  });

  it('should have 100 units gap between modal and toast for nested modals', () => {
    // This gap allows for z-450 for nested modals
    const gap = Z_INDEX.toast - Z_INDEX.modal;
    expect(gap).toBe(100);
  });
});
