# Universal Code Modification Framework (UCMF)

> **Purpose**: A mandatory framework that applies to EVERY code modification in this codebase. Combines enforced TypeScript constants with a verification process to prevent unintended side effects and ensure consistency.

---

## Core Principle

**No code modification happens in isolation.** Every change has potential ripple effects. This framework ensures those effects are identified and handled BEFORE the change is committed.

---

## Framework Structure

```
UCMF/
├── UNIVERSAL_CODE_MODIFICATION_FRAMEWORK.md  (this file - documentation)
├── lib/
│   └── ucmf/
│       ├── index.ts              (main exports)
│       ├── ui-labels.ts          (UI text constants)
│       ├── components.ts         (component registry)
│       ├── routes.ts             (route definitions)
│       ├── state-keys.ts         (localStorage/state keys)
│       ├── reserved-terms.ts     (protected terminology)
│       └── __tests__/
│           └── ucmf.test.ts      (enforcement tests)
```

---

## MANDATORY PRE-MODIFICATION CHECKLIST

Before ANY change, complete these steps:

### 1. IDENTIFY
- What exactly are you changing?
- What type? (Bug fix / Feature / Refactor / UI change / Config change)

### 2. TRACE
- Search for all usages across the codebase
- Map what depends on it and what it depends on
- Check tests, docs, related patterns

### 3. CONFLICT CHECK
- Does it clash with existing terminology?
- Does it break established patterns?
- Could it cause user confusion?

### 4. PLAN
- List ALL files needing changes
- List ALL tests needing updates
- List ALL docs needing updates

### 5. EXECUTE
- Update constants/types first
- Update implementations
- Update tests
- Update documentation

### 6. VERIFY
- Run ALL tests
- Manual verification
- No TypeScript errors
- No console errors

---

## CATEGORY 1: UI LABELS

### Constants File: `lib/ucmf/ui-labels.ts`

```typescript
/**
 * UI Labels - Single Source of Truth
 * 
 * MANDATORY: All user-facing text MUST use these constants.
 * DO NOT hardcode strings in components.
 * 
 * @example
 * // ✅ Correct
 * import { UI_LABELS } from '@/lib/ucmf';
 * <span>{UI_LABELS.HEADER.THEME}</span>
 * 
 * // ❌ Wrong
 * <span>Theme</span>
 */

export const UI_LABELS = {
  /**
   * HEADER - Labels in the main header area
   */
  HEADER: {
    /** Navigation between app modes (Chat/Empty/Conversation/Agents) */
    MODE: 'Mode',
    /** Dark/Light appearance toggle - located in hamburger menu */
    THEME: 'Theme',
  },

  /**
   * SETTINGS - Labels in the wheel settings menu
   */
  SETTINGS: {
    /** Opens presets management modal */
    PRESETS_SETTING: 'Presets Setting',
    /** Opens categories management modal */
    CATEGORIES_SETTING: 'Categories Setting',
    /** Chat-specific styling (bubble colors, fonts) - NOT global theme */
    CHAT_THEME: 'Chat Theme',
    /** Language selection */
    LANGUAGE: 'Language',
    /** Export conversation data */
    EXPORT_DATA: 'Export Data',
  },

  /**
   * CONTROLS - Labels for control bar buttons
   */
  CONTROLS: {
    /** Opens hamburger menu */
    MENU: 'Menu',
    /** Creates new chat */
    NEW_CHAT: 'New Chat',
    /** Opens model selector */
    MODELS: 'Models',
    /** Generates synthesis from responses */
    SYNTHESIZER: 'Synthesizer',
    /** Opens settings menu */
    SETTINGS: 'Settings',
    /** Saves current conversation */
    SAVE: 'Save',
    /** Opens presets panel */
    PRESETS: 'Presets',
  },

  /**
   * WINDOWS - Labels for window management
   */
  WINDOWS: {
    /** Section header in hamburger menu */
    SECTION_TITLE: 'WINDOWS',
    /** Opens layout presets */
    WINDOW_LAYOUTS: 'Window Layouts',
    /** Creates new chat window */
    NEW_CHAT_WINDOW: 'New Chat Window',
  },

  /**
   * ACTIONS - Common action labels
   */
  ACTIONS: {
    SAVE: 'Save',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CLOSE: 'Close',
    QUIT: 'Quit',
    RENAME: 'Rename',
    DUPLICATE: 'Duplicate',
    EXPORT: 'Export',
    IMPORT: 'Import',
  },

  /**
   * MESSAGES - Toast and notification messages
   */
  MESSAGES: {
    THEME_SWITCHED: (mode: 'dark' | 'light') => `Switched to ${mode} mode`,
    CHAT_THEME_COMING_SOON: 'Chat theme settings coming soon',
    LANGUAGE_COMING_SOON: 'Language settings coming soon',
    FEATURE_COMING_SOON: 'Feature coming soon',
  },
} as const;

/** Type for accessing UI_LABELS */
export type UILabels = typeof UI_LABELS;
```

---

## CATEGORY 2: RESERVED TERMS

### Constants File: `lib/ucmf/reserved-terms.ts`

```typescript
/**
 * Reserved Terms - Words with specific meanings that CANNOT be reused
 * 
 * These terms have established meanings in the app. Using them
 * elsewhere will cause user confusion.
 */

export const RESERVED_TERMS = {
  /**
   * 'Mode' - RESERVED for navigation modes only
   * Used in: Header ModeMenu
   * Meaning: Chat / Empty / Conversation / Agents navigation
   * DO NOT use for: Theme modes, edit modes, view modes
   */
  MODE: {
    term: 'Mode',
    reservedFor: 'Navigation between app modes',
    usedIn: ['ModeMenu.tsx', 'Header'],
    alternatives: ['Theme', 'View', 'State', 'Setting'],
  },

  /**
   * 'Theme' - RESERVED for appearance settings
   * Used in: Hamburger menu (global), Wheel settings (chat-specific)
   * DO NOT use for: Presets, styles, skins
   */
  THEME: {
    term: 'Theme',
    reservedFor: 'Dark/Light appearance',
    usedIn: ['EmptyPage.tsx hamburger menu'],
    alternatives: ['Style', 'Appearance', 'Look'],
  },

  /**
   * 'Settings' - RESERVED for the wheel settings menu
   * DO NOT use for: Preferences, options, config
   */
  SETTINGS: {
    term: 'Settings',
    reservedFor: 'Wheel settings menu',
    usedIn: ['ChatControlBox', 'ChatFooter'],
    alternatives: ['Preferences', 'Options', 'Configuration'],
  },

  /**
   * 'Presets' - RESERVED for model presets
   * DO NOT use for: Templates, defaults, configurations
   */
  PRESETS: {
    term: 'Presets',
    reservedFor: 'Model preset combinations',
    usedIn: ['PresetsPanel', 'PresetEditorModal'],
    alternatives: ['Templates', 'Defaults', 'Configurations'],
  },
} as const;

/** List of reserved term strings for quick checking */
export const RESERVED_TERM_LIST = Object.values(RESERVED_TERMS).map(r => r.term);
```

---

## CATEGORY 3: COMPONENTS

### Constants File: `lib/ucmf/components.ts`

```typescript
/**
 * Component Registry - Critical components and their relationships
 */

export const COMPONENTS = {
  /**
   * Core Providers - Wrap the entire app
   */
  PROVIDERS: {
    THEME_PROVIDER: {
      name: 'ThemeProvider',
      path: 'contexts/ThemeContext.tsx',
      purpose: 'Global dark/light theme management',
      dependents: ['All components'],
      dependencies: [],
    },
    ZINDEX_PROVIDER: {
      name: 'ZIndexProvider',
      path: 'contexts/ZIndexContext.tsx',
      purpose: 'Dynamic z-index management for layering',
      dependents: ['FloatingChatWindow', 'ModeMenu', 'All modals'],
      dependencies: [],
    },
  },

  /**
   * Core UI Components
   */
  CORE: {
    FLOATING_CHAT_WINDOW: {
      name: 'FloatingChatWindow',
      path: 'components/FloatingChatWindow.tsx',
      purpose: 'Main draggable chat interface',
      dependents: ['EmptyPage'],
      dependencies: ['ChatControlBox', 'ZIndexProvider'],
    },
    CHAT_CONTROL_BOX: {
      name: 'ChatControlBox',
      path: 'components/ChatControlBox/',
      purpose: 'Reusable chat controls (buttons, input, modals)',
      dependents: ['FloatingChatWindow'],
      dependencies: ['ModelSelector', 'PresetsPanel', 'SettingsMenu'],
    },
    MODE_MENU: {
      name: 'ModeMenu',
      path: 'components/ModeMenu.tsx',
      purpose: 'Navigation between app modes',
      dependents: ['EmptyPage', 'ConversationPage', 'AgentsPage'],
      dependencies: ['ZIndexProvider'],
    },
  },

  /**
   * Modal Components
   */
  MODALS: {
    PRESET_EDITOR: {
      name: 'PresetEditorModal',
      path: 'components/PresetEditorModal.tsx',
      purpose: 'Create/edit model presets',
    },
    CATEGORIES_SETTINGS: {
      name: 'CategoriesSettingsModal',
      path: 'components/CategoriesSettingsModal.tsx',
      purpose: 'Manage preset categories',
    },
    PRESETS_MANAGEMENT: {
      name: 'PresetsManagementModal',
      path: 'components/PresetsManagementModal.tsx',
      purpose: 'Full presets management interface',
    },
  },
} as const;
```

---

## CATEGORY 4: ROUTES

### Constants File: `lib/ucmf/routes.ts`

```typescript
/**
 * Route Definitions - All app routes
 */

export const ROUTES = {
  /** Main entry point - shows EmptyPage with floating windows */
  HOME: '/',
  
  /** Chat mode - same as home, opens chat window */
  CHAT: '/chat',
  
  /** Conversation mode page */
  CONVERSATION: '/conversation',
  
  /** Agents mode page */
  AGENTS: '/agents',
  
  /** Legacy home page */
  HOME_LEGACY: '/home',
  
  /** Test routes */
  TEST: {
    CHAT_CONTROL_BOX: '/test/chat-control-box',
  },
} as const;

/** Route to Component mapping */
export const ROUTE_COMPONENTS = {
  [ROUTES.HOME]: 'EmptyPage',
  [ROUTES.CHAT]: 'EmptyPage',
  [ROUTES.CONVERSATION]: 'ConversationPage',
  [ROUTES.AGENTS]: 'AgentsPage',
  [ROUTES.HOME_LEGACY]: 'Home',
} as const;
```

---

## CATEGORY 5: STATE KEYS

### Constants File: `lib/ucmf/state-keys.ts`

```typescript
/**
 * State Keys - localStorage and state management keys
 * 
 * MANDATORY: Use these constants for all storage operations.
 * Changing these keys will break user data persistence.
 */

export const STATE_KEYS = {
  /**
   * localStorage keys
   */
  LOCAL_STORAGE: {
    /** User's theme preference: 'dark' | 'light' */
    THEME: 'theme',
    
    /** Array of floating chat window states */
    FLOATING_CHAT_WINDOWS: 'floatingChatWindows',
    
    /** User-created custom presets */
    CUSTOM_PRESETS: 'customPresets',
    
    /** Quick presets list */
    QUICK_PRESETS: 'quickPresets',
    
    /** Saved conversations (prefix) */
    CONVERSATION_PREFIX: 'conversation:',
    
    /** Preset usage analytics */
    PRESET_USAGE: 'presetUsage',
    
    /** User-created categories */
    CUSTOM_CATEGORIES: 'customCategories',
  },

  /**
   * State variable naming conventions
   */
  STATE_PATTERNS: {
    /** Boolean visibility: show{Feature} */
    VISIBILITY: 'show',
    /** Boolean loading: is{Action}ing */
    LOADING: 'is',
    /** Selected items: selected{Items} */
    SELECTED: 'selected',
    /** Editing state: editing{Item} */
    EDITING: 'editing',
  },
} as const;
```

---

## CATEGORY 6: ENFORCEMENT TESTS

### Test File: `lib/ucmf/__tests__/ucmf.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { UI_LABELS, RESERVED_TERMS, RESERVED_TERM_LIST } from '../index';

describe('UCMF - Universal Code Modification Framework', () => {
  
  describe('UI Labels', () => {
    it('should have all required header labels', () => {
      expect(UI_LABELS.HEADER.MODE).toBe('Mode');
      expect(UI_LABELS.HEADER.THEME).toBe('Theme');
    });

    it('should have all required settings labels', () => {
      expect(UI_LABELS.SETTINGS.CHAT_THEME).toBe('Chat Theme');
      expect(UI_LABELS.SETTINGS.PRESETS_SETTING).toBe('Presets Setting');
    });

    it('should have distinct labels for Theme vs Chat Theme', () => {
      expect(UI_LABELS.HEADER.THEME).not.toBe(UI_LABELS.SETTINGS.CHAT_THEME);
    });
  });

  describe('Reserved Terms', () => {
    it('should have Mode reserved for navigation only', () => {
      expect(RESERVED_TERMS.MODE.reservedFor).toContain('navigation');
    });

    it('should provide alternatives for reserved terms', () => {
      expect(RESERVED_TERMS.MODE.alternatives.length).toBeGreaterThan(0);
      expect(RESERVED_TERMS.THEME.alternatives.length).toBeGreaterThan(0);
    });

    it('should have all reserved terms in the quick list', () => {
      expect(RESERVED_TERM_LIST).toContain('Mode');
      expect(RESERVED_TERM_LIST).toContain('Theme');
      expect(RESERVED_TERM_LIST).toContain('Settings');
      expect(RESERVED_TERM_LIST).toContain('Presets');
    });
  });

  describe('Component Usage Verification', () => {
    // These tests verify components use UI_LABELS constants
    // Add specific component tests as needed
    
    it('should verify ChatControlBox uses UI_LABELS.SETTINGS.CHAT_THEME', async () => {
      // This test should grep the component file and verify
      // it imports and uses UI_LABELS instead of hardcoded strings
      // Implementation depends on test setup
    });
  });
});
```

---

## CHANGE CLASSIFICATION

| Risk Level | Type | Examples | Requirements |
|------------|------|----------|--------------|
| **HIGH** | Breaking | Rename exports, change props, modify storage keys, change routes | Full impact analysis, all tests, manual QA |
| **MEDIUM** | Additive | New components, new features, new routes | Verify no conflicts, add tests, update docs |
| **LOW** | Cosmetic | Style updates, label changes, comments | Verify consistency, update related items |

---

## ROLLBACK CRITERIA

Immediately rollback if:
- Tests fail that weren't modified
- Console errors in unrelated areas
- UI breaks unexpectedly
- User reports issues in unrelated features

---

## USAGE EXAMPLE

### Before: Hardcoded String (❌ Wrong)

```tsx
// EmptyPage.tsx
<button onClick={toggleTheme}>
  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}  // ❌ Hardcoded
</button>
```

### After: Using UCMF Constants (✅ Correct)

```tsx
// EmptyPage.tsx
import { UI_LABELS } from '@/lib/ucmf';

<button onClick={toggleTheme}>
  <Sun className="h-4 w-4" />
  <span>{UI_LABELS.HEADER.THEME}</span>
</button>
```

---

## FRAMEWORK MAINTENANCE

Update this framework when:
- New protected items are added
- New patterns are established
- New categories emerge
- Enforcement mechanisms are added

**Version**: 1.0.0
