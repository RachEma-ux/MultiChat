/**
 * Chat Window Templates
 * 
 * Defines the template system for chat windows.
 * Templates control the visual appearance and component structure of chat windows.
 */

// ============================================
// TYPES
// ============================================

export interface ChatWindowTemplate {
  id: string;
  name: string;
  description: string;
  /** Primary accent color (Tailwind class or hex) */
  accentColor: string;
  /** Background color variant */
  bgVariant: 'default' | 'subtle' | 'accent';
  /** Header style */
  headerStyle: 'default' | 'compact' | 'gradient';
  /** Footer component to use */
  footerComponent: 'ChatFooter' | 'ChatControlBox';
  /** Whether this is a built-in template */
  isBuiltIn: boolean;
  /** Preview colors for the template selector */
  previewColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// ============================================
// BUILT-IN TEMPLATES
// ============================================

export const CHAT_TEMPLATES: Record<string, ChatWindowTemplate> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'The original chat window design with neutral colors',
    accentColor: 'zinc',
    bgVariant: 'default',
    headerStyle: 'default',
    footerComponent: 'ChatFooter',
    isBuiltIn: true,
    previewColors: {
      primary: '#18181b',    // zinc-900
      secondary: '#27272a',  // zinc-800
      accent: '#3f3f46',     // zinc-700
    },
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'A fresh look with blue/cyan accents and streamlined controls',
    accentColor: 'cyan',
    bgVariant: 'subtle',
    headerStyle: 'gradient',
    footerComponent: 'ChatControlBox',
    isBuiltIn: true,
    previewColors: {
      primary: '#0e7490',    // cyan-700
      secondary: '#155e75',  // cyan-800
      accent: '#06b6d4',     // cyan-500
    },
  },
};

// ============================================
// DEFAULT TEMPLATE
// ============================================

export const DEFAULT_TEMPLATE_ID = 'classic';

// ============================================
// STORAGE FUNCTIONS
// ============================================

const STORAGE_KEY = 'chat-window-template';
const CUSTOM_TEMPLATES_KEY = 'custom-chat-templates';

/**
 * Get the currently selected template ID
 */
export function getSelectedTemplateId(): string {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATE_ID;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_TEMPLATE_ID;
}

/**
 * Set the selected template ID
 */
export function setSelectedTemplateId(templateId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, templateId);
}

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string): ChatWindowTemplate {
  // Check built-in templates first
  if (CHAT_TEMPLATES[templateId]) {
    return CHAT_TEMPLATES[templateId];
  }
  
  // Check custom templates
  const customTemplates = getCustomTemplates();
  const custom = customTemplates.find(t => t.id === templateId);
  if (custom) {
    return custom;
  }
  
  // Fallback to default
  return CHAT_TEMPLATES[DEFAULT_TEMPLATE_ID];
}

/**
 * Get all available templates (built-in + custom)
 */
export function getAllTemplates(): ChatWindowTemplate[] {
  const builtIn = Object.values(CHAT_TEMPLATES);
  const custom = getCustomTemplates();
  return [...builtIn, ...custom];
}

/**
 * Get custom templates from localStorage
 */
export function getCustomTemplates(): ChatWindowTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save custom templates to localStorage
 */
export function saveCustomTemplates(templates: ChatWindowTemplate[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
}

// ============================================
// TEMPLATE STYLE HELPERS
// ============================================

/**
 * Get CSS classes for a template's header
 */
export function getHeaderClasses(template: ChatWindowTemplate): string {
  const base = 'flex items-center justify-between px-3 py-2 border-b';
  
  switch (template.headerStyle) {
    case 'gradient':
      return `${base} bg-gradient-to-r from-cyan-900/50 to-cyan-800/30 border-cyan-700/50`;
    case 'compact':
      return `${base} py-1.5 bg-card/95 border-border`;
    default:
      return `${base} bg-card border-border`;
  }
}

/**
 * Get CSS classes for a template's window container
 */
export function getWindowClasses(template: ChatWindowTemplate): string {
  const base = 'fixed flex flex-col shadow-2xl overflow-hidden';
  
  switch (template.bgVariant) {
    case 'accent':
      return `${base} bg-cyan-950 border border-cyan-700/50`;
    case 'subtle':
      return `${base} bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-800/30`;
    default:
      return `${base} bg-card border border-border rounded-lg`;
  }
}

/**
 * Get CSS classes for accent elements
 */
export function getAccentClasses(template: ChatWindowTemplate): string {
  switch (template.accentColor) {
    case 'cyan':
      return 'text-cyan-400 hover:text-cyan-300';
    case 'blue':
      return 'text-blue-400 hover:text-blue-300';
    case 'green':
      return 'text-green-400 hover:text-green-300';
    case 'purple':
      return 'text-purple-400 hover:text-purple-300';
    default:
      return 'text-foreground hover:text-foreground/80';
  }
}

/**
 * Get button variant classes for a template
 */
export function getButtonClasses(template: ChatWindowTemplate): string {
  switch (template.accentColor) {
    case 'cyan':
      return 'bg-cyan-600 hover:bg-cyan-500 text-white';
    default:
      return 'bg-primary hover:bg-primary/90 text-primary-foreground';
  }
}
