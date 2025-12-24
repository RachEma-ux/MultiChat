/**
 * Chat Templates Tests
 * 
 * Tests for the chat window template system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CHAT_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  getSelectedTemplateId,
  setSelectedTemplateId,
  getTemplate,
  getAllTemplates,
  getHeaderClasses,
  getWindowClasses,
  getAccentClasses,
  getButtonClasses,
} from '../chat-templates';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Chat Templates', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('CHAT_TEMPLATES', () => {
    it('should have classic template', () => {
      expect(CHAT_TEMPLATES.classic).toBeDefined();
      expect(CHAT_TEMPLATES.classic.name).toBe('Classic');
      expect(CHAT_TEMPLATES.classic.footerComponent).toBe('ChatFooter');
    });

    it('should have modern template', () => {
      expect(CHAT_TEMPLATES.modern).toBeDefined();
      expect(CHAT_TEMPLATES.modern.name).toBe('Modern');
      expect(CHAT_TEMPLATES.modern.footerComponent).toBe('ChatControlBox');
    });

    it('should have correct accent colors', () => {
      expect(CHAT_TEMPLATES.classic.accentColor).toBe('zinc');
      expect(CHAT_TEMPLATES.modern.accentColor).toBe('cyan');
    });

    it('should have preview colors for each template', () => {
      Object.values(CHAT_TEMPLATES).forEach(template => {
        expect(template.previewColors).toBeDefined();
        expect(template.previewColors.primary).toBeDefined();
        expect(template.previewColors.secondary).toBeDefined();
        expect(template.previewColors.accent).toBeDefined();
      });
    });

    it('should mark built-in templates correctly', () => {
      Object.values(CHAT_TEMPLATES).forEach(template => {
        expect(template.isBuiltIn).toBe(true);
      });
    });
  });

  describe('DEFAULT_TEMPLATE_ID', () => {
    it('should be classic', () => {
      expect(DEFAULT_TEMPLATE_ID).toBe('classic');
    });
  });

  describe('getSelectedTemplateId', () => {
    it('should return default when no selection stored', () => {
      expect(getSelectedTemplateId()).toBe(DEFAULT_TEMPLATE_ID);
    });

    it('should return stored selection', () => {
      localStorageMock.setItem('chat-window-template', 'modern');
      expect(getSelectedTemplateId()).toBe('modern');
    });
  });

  describe('setSelectedTemplateId', () => {
    it('should store template selection', () => {
      setSelectedTemplateId('modern');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chat-window-template', 'modern');
    });
  });

  describe('getTemplate', () => {
    it('should return classic template by id', () => {
      const template = getTemplate('classic');
      expect(template.name).toBe('Classic');
    });

    it('should return modern template by id', () => {
      const template = getTemplate('modern');
      expect(template.name).toBe('Modern');
    });

    it('should return default template for unknown id', () => {
      const template = getTemplate('unknown-template');
      expect(template.id).toBe(DEFAULT_TEMPLATE_ID);
    });
  });

  describe('getAllTemplates', () => {
    it('should return all built-in templates', () => {
      const templates = getAllTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(2);
      expect(templates.some(t => t.id === 'classic')).toBe(true);
      expect(templates.some(t => t.id === 'modern')).toBe(true);
    });
  });

  describe('getHeaderClasses', () => {
    it('should return default header classes for classic template', () => {
      const classes = getHeaderClasses(CHAT_TEMPLATES.classic);
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('bg-card');
    });

    it('should return gradient header classes for modern template', () => {
      const classes = getHeaderClasses(CHAT_TEMPLATES.modern);
      expect(classes).toContain('flex');
      expect(classes).toContain('bg-gradient-to-r');
      expect(classes).toContain('from-cyan');
    });
  });

  describe('getWindowClasses', () => {
    it('should return default window classes for classic template', () => {
      const classes = getWindowClasses(CHAT_TEMPLATES.classic);
      expect(classes).toContain('fixed');
      expect(classes).toContain('flex');
      expect(classes).toContain('bg-card');
    });

    it('should return gradient window classes for modern template', () => {
      const classes = getWindowClasses(CHAT_TEMPLATES.modern);
      expect(classes).toContain('fixed');
      expect(classes).toContain('bg-gradient-to-b');
      expect(classes).toContain('from-slate-900');
    });
  });

  describe('getAccentClasses', () => {
    it('should return zinc accent for classic template', () => {
      const classes = getAccentClasses(CHAT_TEMPLATES.classic);
      expect(classes).toContain('text-foreground');
    });

    it('should return cyan accent for modern template', () => {
      const classes = getAccentClasses(CHAT_TEMPLATES.modern);
      expect(classes).toContain('text-cyan-400');
    });
  });

  describe('getButtonClasses', () => {
    it('should return primary button for classic template', () => {
      const classes = getButtonClasses(CHAT_TEMPLATES.classic);
      expect(classes).toContain('bg-primary');
    });

    it('should return cyan button for modern template', () => {
      const classes = getButtonClasses(CHAT_TEMPLATES.modern);
      expect(classes).toContain('bg-cyan-600');
    });
  });

  describe('Template Structure Validation', () => {
    it('all templates should have required fields', () => {
      Object.values(CHAT_TEMPLATES).forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.accentColor).toBeDefined();
        expect(template.bgVariant).toBeDefined();
        expect(template.headerStyle).toBeDefined();
        expect(template.footerComponent).toBeDefined();
        expect(template.isBuiltIn).toBeDefined();
        expect(template.previewColors).toBeDefined();
      });
    });

    it('footerComponent should be valid value', () => {
      Object.values(CHAT_TEMPLATES).forEach(template => {
        expect(['ChatFooter', 'ChatControlBox']).toContain(template.footerComponent);
      });
    });

    it('bgVariant should be valid value', () => {
      Object.values(CHAT_TEMPLATES).forEach(template => {
        expect(['default', 'subtle', 'accent']).toContain(template.bgVariant);
      });
    });

    it('headerStyle should be valid value', () => {
      Object.values(CHAT_TEMPLATES).forEach(template => {
        expect(['default', 'compact', 'gradient']).toContain(template.headerStyle);
      });
    });
  });
});
