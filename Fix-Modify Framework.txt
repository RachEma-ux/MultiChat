================================================================================
                         FIX-MODIFY FRAMEWORK (FMF)
                    Universal Code Modification Framework
================================================================================

PURPOSE
-------
A mandatory framework that applies to EVERY code modification in this codebase,
regardless of type or size. This framework combines enforced TypeScript constants
with a verification process to prevent unintended side effects, ensure consistency,
and maintain code integrity across the entire application.

CORE PRINCIPLE
--------------
No code modification happens in isolation. Every change—whether fixing a bug,
adding a feature, renaming a variable, updating a label, or modifying styles—has
potential ripple effects. This framework ensures those effects are identified
and handled BEFORE the change is committed.


================================================================================
                              FRAMEWORK STRUCTURE
================================================================================

Location: client/src/lib/fmf/

Files:
├── index.ts                    Main exports (re-exports all modules)
├── ui-labels.ts                UI text constants
├── components.ts               Component registry
├── routes.ts                   Route definitions
├── state-keys.ts               localStorage and state keys
├── reserved-terms.ts           Protected terminology
├── patterns.ts                 Naming patterns and conventions
├── relationships.ts            Dependency mappings
└── __tests__/
    ├── fmf.test.ts             Core framework tests
    ├── ui-labels.test.ts       UI label compliance tests
    ├── components.test.ts      Component usage tests
    └── integration.test.ts     Cross-category tests


================================================================================
                    MANDATORY PRE-MODIFICATION CHECKLIST
================================================================================

Before making ANY change to the codebase, complete ALL six steps:

------------------------------------------------------------------------------
STEP 1: IDENTIFY - What Are You Changing?
------------------------------------------------------------------------------

Questions to answer:
□ What exactly is being changed? (Be specific: file, line, function, component)
□ What is the change type?
  - [ ] Bug fix
  - [ ] Feature addition
  - [ ] Feature modification
  - [ ] Refactor / Code cleanup
  - [ ] UI/UX modification
  - [ ] Performance optimization
  - [ ] Dependency update
  - [ ] Configuration change
  - [ ] Documentation update
  - [ ] Test update
□ What is the scope?
  - [ ] Single file
  - [ ] Single component
  - [ ] Multiple related files
  - [ ] Cross-component
  - [ ] App-wide
□ What is the risk level?
  - [ ] HIGH - Breaking changes (exports, props, storage keys, routes)
  - [ ] MEDIUM - Additive changes (new components, features)
  - [ ] LOW - Cosmetic changes (styles, labels, comments)

------------------------------------------------------------------------------
STEP 2: TRACE - What Does It Affect?
------------------------------------------------------------------------------

Actions to perform:
□ Search for all usages of the item being changed:
  - Run: grep -r "searchTerm" --include="*.tsx" --include="*.ts"
  - Check imports/exports
  - Check test files
  - Check documentation files
  - Check configuration files

□ Map dependencies (fill in):
  - What USES this item (dependents):
    1. _______________
    2. _______________
    3. _______________
  
  - What does this item USE (dependencies):
    1. _______________
    2. _______________
    3. _______________

□ Check for related patterns:
  - Are there similar items following the same pattern?
  - Will this change break consistency with related code?
  - What naming conventions must this follow?

□ Document the impact radius:
  - Files needing changes: _______________
  - Tests needing updates: _______________
  - Docs needing updates: _______________

------------------------------------------------------------------------------
STEP 3: CONFLICT CHECK - Does It Clash With Existing Code?
------------------------------------------------------------------------------

Verify each:
□ Terminology conflicts:
  - Is this term already used elsewhere? Check RESERVED_TERMS
  - Could it cause user confusion with similar features?
  - Does it conflict with established vocabulary?

□ Pattern conflicts:
  - Does this follow established patterns? Check PATTERNS
  - If deviating, is there a documented justification?

□ Behavioral conflicts:
  - Does this change alter expected behavior elsewhere?
  - Are there implicit assumptions that will break?
  - Will existing tests fail?

□ Visual/UX conflicts:
  - Does this create inconsistency in the UI?
  - Does it conflict with established design patterns?
  - Will users be confused?

------------------------------------------------------------------------------
STEP 4: PLAN - What Else Needs Updating?
------------------------------------------------------------------------------

Create a complete list:
□ Code updates required:
  File: _______________ Change: _______________
  File: _______________ Change: _______________
  File: _______________ Change: _______________

□ Test updates required:
  Test: _______________ Change: _______________
  Test: _______________ Change: _______________

□ Documentation updates required:
  Doc: _______________ Change: _______________
  Doc: _______________ Change: _______________

□ Framework updates required:
  - [ ] UI_LABELS needs update
  - [ ] COMPONENTS needs update
  - [ ] ROUTES needs update
  - [ ] STATE_KEYS needs update
  - [ ] RESERVED_TERMS needs update
  - [ ] PATTERNS needs update

------------------------------------------------------------------------------
STEP 5: EXECUTE - Make the Changes
------------------------------------------------------------------------------

Order of operations:
1. □ Update FMF constants/types first (if applicable)
2. □ Update shared utilities/helpers
3. □ Update core logic/implementations
4. □ Update dependent components
5. □ Update tests
6. □ Update documentation

Rules:
□ Keep changes atomic - each commit should be complete and working
□ Don't leave partial changes
□ Follow existing code style
□ Use FMF constants - never hardcode protected values

------------------------------------------------------------------------------
STEP 6: VERIFY - Confirm Everything Works
------------------------------------------------------------------------------

Verification checklist:
□ Run ALL tests: pnpm test
□ Run TypeScript check: pnpm tsc --noEmit
□ Run linter: pnpm lint
□ Manual verification of affected areas
□ Check browser console for errors/warnings
□ Test on multiple viewports (if UI change)
□ Cross-reference with impact list from Step 2
□ Verify no regressions in unrelated areas


================================================================================
                         CATEGORY 1: UI LABELS
================================================================================

File: client/src/lib/fmf/ui-labels.ts

Purpose: Single source of truth for ALL user-facing text in the application.
         Components MUST import and use these constants instead of hardcoding strings.

------------------------------------------------------------------------------

/**
 * UI_LABELS - All User-Facing Text Constants
 * 
 * MANDATORY USAGE:
 * - Import: import { UI_LABELS } from '@/lib/fmf';
 * - Use: <span>{UI_LABELS.HEADER.THEME}</span>
 * 
 * FORBIDDEN:
 * - Hardcoded strings: <span>Theme</span>
 * - Template literals with hardcoded text: `Switch to ${mode} mode`
 */

export const UI_LABELS = {
  
  // ===========================================================================
  // HEADER - Labels appearing in the main header area
  // ===========================================================================
  HEADER: {
    /**
     * MODE
     * Location: Header, top-right corner
     * Component: ModeMenu.tsx
     * Purpose: Navigation dropdown for switching between app modes
     * Values shown: Chat, Empty, Conversation, Agents
     * 
     * WARNING: "Mode" is RESERVED for navigation only.
     * DO NOT use "Mode" for theme switching or any other purpose.
     */
    MODE: 'Mode',

    /**
     * THEME
     * Location: Hamburger menu (sidebar), before WINDOWS section
     * Component: EmptyPage.tsx
     * Purpose: Toggle between dark and light appearance
     * Behavior: Shows sun icon (dark mode) or moon icon (light mode)
     * 
     * NOTE: This is GLOBAL theme. For chat-specific styling, see SETTINGS.CHAT_THEME
     */
    THEME: 'Theme',
  },

  // ===========================================================================
  // SETTINGS - Labels in the wheel (gear) settings menu
  // ===========================================================================
  SETTINGS: {
    /**
     * PRESETS_SETTING
     * Location: Wheel settings menu
     * Components: ChatControlBox.tsx, ChatFooter.tsx, SettingsMenu.tsx
     * Purpose: Opens the presets management modal
     * Action: Opens PresetsManagementModal
     */
    PRESETS_SETTING: 'Presets Setting',

    /**
     * CATEGORIES_SETTING
     * Location: Wheel settings menu
     * Components: ChatControlBox.tsx, ChatFooter.tsx, SettingsMenu.tsx
     * Purpose: Opens the categories management modal
     * Action: Opens CategoriesSettingsModal
     */
    CATEGORIES_SETTING: 'Categories Setting',

    /**
     * CHAT_THEME
     * Location: Wheel settings menu
     * Components: ChatControlBox.tsx, ChatFooter.tsx, SettingsMenu.tsx, Home.tsx
     * Purpose: Chat-specific styling (bubble colors, fonts, avatar styles)
     * Status: Coming soon (shows toast message)
     * 
     * NOTE: This is CHAT-SPECIFIC theme, different from HEADER.THEME (global)
     * - HEADER.THEME = Dark/Light mode for entire app
     * - SETTINGS.CHAT_THEME = Colors/fonts for chat bubbles only
     */
    CHAT_THEME: 'Chat Theme',

    /**
     * LANGUAGE
     * Location: Wheel settings menu
     * Components: ChatControlBox.tsx, ChatFooter.tsx, SettingsMenu.tsx
     * Purpose: Language/locale selection
     * Status: Coming soon (shows toast message)
     */
    LANGUAGE: 'Language',

    /**
     * EXPORT_DATA
     * Location: Wheel settings menu
     * Components: ChatControlBox.tsx, ChatFooter.tsx, SettingsMenu.tsx
     * Purpose: Export conversation data as JSON
     * Action: Downloads conversations.json file
     */
    EXPORT_DATA: 'Export Data',
  },

  // ===========================================================================
  // CONTROLS - Labels for control bar buttons (ChatControlBox)
  // ===========================================================================
  CONTROLS: {
    /**
     * MENU
     * Location: Control bar, first button (hamburger icon)
     * Purpose: Opens the footer menu with recent conversations
     * Tooltip: "Menu"
     */
    MENU: 'Menu',

    /**
     * NEW_CHAT
     * Location: Control bar, second button (plus icon)
     * Purpose: Clears current conversation and starts fresh
     * Tooltip: "New Chat"
     */
    NEW_CHAT: 'New Chat',

    /**
     * MODELS
     * Location: Control bar, button showing count
     * Purpose: Opens model selector panel
     * Display format: "{count} Model" or "{count} Models"
     */
    MODELS: 'Models',
    MODEL_SINGULAR: 'Model',
    MODEL_PLURAL: 'Models',
    
    /**
     * Helper function for model count display
     */
    MODEL_COUNT: (count: number) => `${count} ${count === 1 ? 'Model' : 'Models'}`,

    /**
     * SYNTHESIZER
     * Location: Control bar (if not hidden)
     * Purpose: Generates synthesis from all AI responses
     * Icon: Sparkles
     */
    SYNTHESIZER: 'Synthesizer',

    /**
     * SETTINGS
     * Location: Control bar, gear icon button
     * Purpose: Opens settings dropdown menu
     * Tooltip: "Settings"
     */
    SETTINGS: 'Settings',

    /**
     * SAVE
     * Location: Control bar, save icon button
     * Purpose: Saves current conversation
     * Tooltip: "Save Conversation"
     */
    SAVE: 'Save',
    SAVE_CONVERSATION: 'Save Conversation',

    /**
     * PRESETS
     * Location: Control bar, text button
     * Purpose: Opens quick presets panel
     */
    PRESETS: 'Presets',

    /**
     * CONNECTORS
     * Location: Control bar (if not hidden)
     * Purpose: Opens connectors store
     * Icon: Plug
     */
    CONNECTORS: 'Connectors',

    /**
     * VOICE_INPUT
     * Location: Inside textarea, microphone button
     * Purpose: Voice-to-text input
     * Tooltip: "Voice Input"
     */
    VOICE_INPUT: 'Voice Input',

    /**
     * ATTACH_FILES
     * Location: Input row, paperclip button
     * Purpose: Attach files to message
     * Tooltip: "Attach files"
     */
    ATTACH_FILES: 'Attach files',
  },

  // ===========================================================================
  // WINDOWS - Labels for window management (hamburger menu)
  // ===========================================================================
  WINDOWS: {
    /**
     * SECTION_TITLE
     * Location: Hamburger menu, section header
     * Purpose: Groups window management options
     */
    SECTION_TITLE: 'WINDOWS',

    /**
     * WINDOW_LAYOUTS
     * Location: Hamburger menu, under WINDOWS section
     * Purpose: Opens window layout presets modal
     * Icon: Layout
     */
    WINDOW_LAYOUTS: 'Window Layouts',

    /**
     * NEW_CHAT_WINDOW
     * Location: Hamburger menu, under WINDOWS section
     * Purpose: Creates a new floating chat window
     * Icon: Plus
     * Disabled when: MAX_WINDOWS reached
     */
    NEW_CHAT_WINDOW: 'New Chat Window',
  },

  // ===========================================================================
  // HAMBURGER_MENU - Labels for hamburger menu sections
  // ===========================================================================
  HAMBURGER_MENU: {
    /**
     * Menu section headers
     */
    USER_ACCOUNT: 'USER ACCOUNT',
    AGENTS: 'AGENTS',
    SKILLS: 'SKILLS',
    HOSTING: 'HOSTING',
    IDE: 'IDE',
    RUNNERS: 'RUNNERS',
    SEARCH: 'SEARCH',

    /**
     * QUIT
     * Location: Bottom of hamburger menu
     * Purpose: Clears all data and closes app
     * Behavior: Shows confirmation dialog first
     */
    QUIT: 'Quit',
  },

  // ===========================================================================
  // ACTIONS - Common action labels used throughout the app
  // ===========================================================================
  ACTIONS: {
    SAVE: 'Save',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CLOSE: 'Close',
    CONFIRM: 'Confirm',
    RENAME: 'Rename',
    DUPLICATE: 'Duplicate',
    EXPORT: 'Export',
    IMPORT: 'Import',
    CREATE: 'Create',
    UPDATE: 'Update',
    ADD: 'Add',
    REMOVE: 'Remove',
    CLEAR: 'Clear',
    RESET: 'Reset',
    APPLY: 'Apply',
    SEND: 'Send',
    RETRY: 'Retry',
    BACK: 'Back',
    NEXT: 'Next',
    DONE: 'Done',
    VIEW_ALL: 'View All',
    SHOW_MORE: 'Show More',
    SHOW_LESS: 'Show Less',
  },

  // ===========================================================================
  // MESSAGES - Toast notifications and feedback messages
  // ===========================================================================
  MESSAGES: {
    /**
     * Theme messages
     */
    THEME_SWITCHED_DARK: 'Switched to dark mode',
    THEME_SWITCHED_LIGHT: 'Switched to light mode',
    THEME_SWITCHED: (mode: 'dark' | 'light') => `Switched to ${mode} mode`,

    /**
     * Coming soon messages
     */
    CHAT_THEME_COMING_SOON: 'Chat theme settings coming soon',
    LANGUAGE_COMING_SOON: 'Language settings coming soon',
    FEATURE_COMING_SOON: 'Feature coming soon',

    /**
     * Success messages
     */
    CONVERSATION_SAVED: 'Conversation saved',
    PRESET_CREATED: 'Preset created',
    PRESET_UPDATED: 'Preset updated',
    PRESET_DELETED: 'Preset deleted',
    CATEGORY_CREATED: 'Category created',
    CATEGORY_DELETED: 'Category deleted',
    DATA_EXPORTED: 'Data exported successfully',
    COPIED_TO_CLIPBOARD: 'Copied to clipboard',

    /**
     * Error messages
     */
    SELECT_MODELS_FIRST: 'Please select at least one model first',
    CONVERSATION_EMPTY: 'No messages to save',
    EXPORT_FAILED: 'Export failed',
    IMPORT_FAILED: 'Import failed',

    /**
     * Confirmation messages
     */
    CONFIRM_DELETE: 'Are you sure you want to delete this?',
    CONFIRM_QUIT: 'Are you sure you want to quit? All data will be cleared.',
    CONFIRM_CLEAR: 'Are you sure you want to clear all messages?',
  },

  // ===========================================================================
  // PLACEHOLDERS - Input placeholder text
  // ===========================================================================
  PLACEHOLDERS: {
    MESSAGE_INPUT: 'Type your message...',
    MESSAGE_INPUT_DISABLED: 'Select models to start chatting',
    SEARCH: 'Search...',
    PRESET_NAME: 'Enter preset name',
    CATEGORY_NAME: 'Enter category name',
    CONVERSATION_TITLE: 'Enter conversation title',
  },

  // ===========================================================================
  // TOOLTIPS - Hover tooltip text
  // ===========================================================================
  TOOLTIPS: {
    MENU: 'Menu',
    NEW_CHAT: 'New Chat',
    SETTINGS: 'Settings',
    SAVE_CONVERSATION: 'Save Conversation',
    ATTACH_FILES: 'Attach files',
    VOICE_INPUT: 'Voice Input',
    SEND_MESSAGE: 'Send Message',
    CLOSE: 'Close',
    MINIMIZE: 'Minimize',
    MAXIMIZE: 'Maximize',
    PIN_WINDOW: 'Pin Window',
    EXPAND: 'Expand',
  },

} as const;

/** Type for UI_LABELS */
export type UILabels = typeof UI_LABELS;

/** Type-safe accessor */
export function getLabel<
  C extends keyof UILabels,
  K extends keyof UILabels[C]
>(category: C, key: K): UILabels[C][K] {
  return UI_LABELS[category][key];
}


================================================================================
                       CATEGORY 2: RESERVED TERMS
================================================================================

File: client/src/lib/fmf/reserved-terms.ts

Purpose: Documents terms that have specific, established meanings in the app.
         These terms MUST NOT be reused for other purposes to avoid user confusion.

------------------------------------------------------------------------------

/**
 * RESERVED_TERMS - Protected Vocabulary
 * 
 * These terms have established meanings. Using them elsewhere WILL cause
 * user confusion and inconsistency.
 * 
 * Before using any common UI term, CHECK THIS LIST FIRST.
 */

export const RESERVED_TERMS = {

  /**
   * MODE
   * ----
   * RESERVED FOR: Navigation between app modes only
   * 
   * Current Usage:
   * - Location: Header ModeMenu dropdown
   * - Component: ModeMenu.tsx
   * - Values: Chat, Empty, Conversation, Agents
   * - Behavior: Routes to different pages/views
   * 
   * DO NOT USE FOR:
   * - Theme switching (use "Theme" instead)
   * - Edit modes (use "Editing" or "Edit Mode" instead)
   * - View modes (use "View" instead)
   * - Display modes (use "Display" or "Layout" instead)
   * 
   * Alternatives if you need similar concept:
   * - Theme, View, State, Setting, Option, Style
   */
  MODE: {
    term: 'Mode',
    reservedFor: 'Navigation between app modes (Chat/Empty/Conversation/Agents)',
    usedIn: [
      'ModeMenu.tsx - Header dropdown',
      'EmptyPage.tsx - Mode selection',
      'App.tsx - Route definitions',
    ],
    doNotUseFor: [
      'Theme switching',
      'Edit modes',
      'View modes',
      'Display modes',
    ],
    alternatives: ['Theme', 'View', 'State', 'Setting', 'Option', 'Style', 'Layout'],
  },

  /**
   * THEME
   * -----
   * RESERVED FOR: Appearance/visual styling settings
   * 
   * Current Usage:
   * - Global Theme: Hamburger menu → Dark/Light mode toggle
   * - Chat Theme: Wheel settings → Chat-specific styling (coming soon)
   * 
   * DO NOT USE FOR:
   * - Presets (use "Preset" instead)
   * - Templates (use "Template" instead)
   * - Skins (use "Style" instead)
   * 
   * Note: "Theme" appears in TWO places with DIFFERENT meanings:
   * 1. HEADER.THEME = Global dark/light mode
   * 2. SETTINGS.CHAT_THEME = Chat bubble colors/fonts
   * Both are valid uses under the "appearance" umbrella.
   */
  THEME: {
    term: 'Theme',
    reservedFor: 'Visual appearance settings (dark/light mode, colors)',
    usedIn: [
      'EmptyPage.tsx - Hamburger menu (global theme toggle)',
      'ChatControlBox.tsx - Wheel settings (chat theme)',
      'ThemeContext.tsx - Theme state management',
    ],
    doNotUseFor: [
      'Presets',
      'Templates',
      'Configurations',
    ],
    alternatives: ['Style', 'Appearance', 'Look', 'Skin'],
    relatedTerms: {
      'Chat Theme': 'Chat-specific styling in wheel settings',
      'Theme': 'Global dark/light in hamburger menu',
    },
  },

  /**
   * SETTINGS
   * --------
   * RESERVED FOR: The wheel (gear) icon settings menu
   * 
   * Current Usage:
   * - Location: Control bar, gear icon button
   * - Component: ChatControlBox.tsx, ChatFooter.tsx
   * - Contains: Presets Setting, Categories Setting, Chat Theme, Language, Export Data
   * 
   * DO NOT USE FOR:
   * - Preferences (different concept)
   * - Options (too generic)
   * - Configuration (too technical)
   */
  SETTINGS: {
    term: 'Settings',
    reservedFor: 'The wheel/gear icon settings menu in chat controls',
    usedIn: [
      'ChatControlBox.tsx - Settings button and menu',
      'ChatFooter.tsx - Settings button and menu',
      'SettingsMenu.tsx - Settings menu component',
    ],
    doNotUseFor: [
      'General preferences',
      'App configuration',
      'User options',
    ],
    alternatives: ['Preferences', 'Options', 'Configuration', 'Config'],
  },

  /**
   * PRESETS
   * -------
   * RESERVED FOR: Model preset combinations
   * 
   * Current Usage:
   * - Quick Presets: Control bar button → Opens PresetsPanel
   * - Presets Setting: Wheel settings → Opens PresetsManagementModal
   * - Built-in presets: Coding Team, Creative Writers, Research Squad, etc.
   * - Custom presets: User-created model combinations
   * 
   * DO NOT USE FOR:
   * - Templates (different concept)
   * - Defaults (too generic)
   * - Configurations (too technical)
   */
  PRESETS: {
    term: 'Presets',
    reservedFor: 'Model preset combinations (groups of AI models)',
    usedIn: [
      'PresetsPanel.tsx - Quick presets selection',
      'PresetEditorModal.tsx - Create/edit presets',
      'PresetsManagementModal.tsx - Full presets management',
      'PresetSelectionDialog.tsx - Preset picker',
    ],
    doNotUseFor: [
      'Window layouts (use "Layouts")',
      'Message templates',
      'Default settings',
    ],
    alternatives: ['Templates', 'Defaults', 'Configurations', 'Profiles'],
  },

  /**
   * MODELS
   * ------
   * RESERVED FOR: AI model selection
   * 
   * Current Usage:
   * - Location: Control bar button showing count
   * - Component: ModelSelector.tsx
   * - Behavior: Opens panel to select AI models (GPT-4, Claude, etc.)
   */
  MODELS: {
    term: 'Models',
    reservedFor: 'AI model selection (GPT-4, Claude, Gemini, etc.)',
    usedIn: [
      'ChatControlBox.tsx - Models button',
      'ModelSelector.tsx - Model selection panel',
    ],
    doNotUseFor: [
      '3D models',
      'Data models',
      'Business models',
    ],
    alternatives: ['AI Models', 'LLMs', 'Providers'],
  },

  /**
   * WINDOWS
   * -------
   * RESERVED FOR: Chat window management
   * 
   * Current Usage:
   * - Location: Hamburger menu section
   * - Contains: Window Layouts, New Chat Window
   * - Behavior: Manages floating chat windows
   */
  WINDOWS: {
    term: 'Windows',
    reservedFor: 'Floating chat window management',
    usedIn: [
      'EmptyPage.tsx - Hamburger menu section',
      'WindowLayoutPresets.tsx - Layout management',
      'FloatingChatWindow.tsx - Individual windows',
    ],
    doNotUseFor: [
      'Modal dialogs (use "Dialog" or "Modal")',
      'Panels (use "Panel")',
      'Popups (use "Popup" or "Popover")',
    ],
    alternatives: ['Dialogs', 'Modals', 'Panels', 'Panes'],
  },

} as const;

/**
 * Quick lookup list of all reserved terms
 */
export const RESERVED_TERM_LIST = Object.values(RESERVED_TERMS).map(r => r.term);

/**
 * Check if a term is reserved
 */
export function isReservedTerm(term: string): boolean {
  return RESERVED_TERM_LIST.includes(term);
}

/**
 * Get alternatives for a reserved term
 */
export function getAlternatives(term: string): string[] {
  const reserved = Object.values(RESERVED_TERMS).find(r => r.term === term);
  return reserved?.alternatives || [];
}


================================================================================
                         CATEGORY 3: COMPONENTS
================================================================================

File: client/src/lib/fmf/components.ts

Purpose: Registry of critical components, their purposes, and dependency relationships.
         Use this to understand impact when modifying components.

------------------------------------------------------------------------------

/**
 * COMPONENTS - Component Registry
 * 
 * Documents critical components and their relationships.
 * Before modifying any component, check its dependents and dependencies.
 */

export const COMPONENTS = {

  // ===========================================================================
  // PROVIDERS - Context providers that wrap the app
  // ===========================================================================
  PROVIDERS: {
    
    THEME_PROVIDER: {
      name: 'ThemeProvider',
      path: 'client/src/contexts/ThemeContext.tsx',
      purpose: 'Manages global dark/light theme state',
      exports: ['ThemeProvider', 'useTheme'],
      wraps: 'Entire application',
      dependents: [
        'App.tsx - Wraps all routes',
        'EmptyPage.tsx - Uses useTheme for toggle',
        'ComponentShowcase.tsx - Uses useTheme for demo',
      ],
      dependencies: [],
      stateManaged: {
        theme: "'dark' | 'light'",
        toggleTheme: '() => void',
        switchable: 'boolean',
      },
      localStorage: 'theme',
      breakingChanges: [
        'Changing theme type values',
        'Removing toggleTheme function',
        'Changing localStorage key',
      ],
    },

    ZINDEX_PROVIDER: {
      name: 'ZIndexProvider',
      path: 'client/src/contexts/ZIndexContext.tsx',
      purpose: 'Dynamic z-index management for bring-to-front behavior',
      exports: ['ZIndexProvider', 'useZIndex', 'useBringToFront'],
      wraps: 'Entire application',
      dependents: [
        'FloatingChatWindow.tsx - Window layering',
        'ModeMenu.tsx - Dropdown layering',
        'All modals and dropdowns',
      ],
      dependencies: [],
      relatedFiles: [
        'lib/z-index.ts - Z_CLASS constants',
      ],
      breakingChanges: [
        'Changing z-index scale',
        'Removing hooks',
      ],
    },

    TOOLTIP_PROVIDER: {
      name: 'TooltipProvider',
      path: 'client/src/components/ui/tooltip.tsx',
      purpose: 'Enables tooltips throughout the app',
      wraps: 'Entire application',
      dependents: ['All components using Tooltip'],
      dependencies: ['@radix-ui/react-tooltip'],
    },
  },

  // ===========================================================================
  // CORE - Main application components
  // ===========================================================================
  CORE: {

    FLOATING_CHAT_WINDOW: {
      name: 'FloatingChatWindow',
      path: 'client/src/components/FloatingChatWindow.tsx',
      purpose: 'Main draggable, resizable chat interface',
      exports: ['FloatingChatWindow'],
      dependents: [
        'EmptyPage.tsx - Renders chat windows',
      ],
      dependencies: [
        'ChatControlBox - Chat controls',
        'AIChatBox - Message display',
        'ZIndexContext - Layering',
        'framer-motion - Animations',
      ],
      props: {
        id: 'string - Unique window identifier',
        initialPosition: '{ x: number, y: number }',
        onClose: '() => void',
        onMinimize: '() => void',
        onPositionChange: '(pos) => void',
        onSizeChange: '(size) => void',
      },
      localStorage: 'floatingChatWindows',
      breakingChanges: [
        'Changing prop interface',
        'Changing window state structure',
        'Removing drag/resize functionality',
      ],
    },

    CHAT_CONTROL_BOX: {
      name: 'ChatControlBox',
      path: 'client/src/components/ChatControlBox/',
      purpose: 'Reusable chat control component with all built-in behaviors',
      exports: ['ChatControlBox', 'Message', 'SavedConversation', 'Attachment'],
      dependents: [
        'FloatingChatWindow.tsx - Main usage',
      ],
      dependencies: [
        'ModelSelector',
        'PresetsPanel',
        'PresetEditorModal',
        'PresetSelectionDialog',
        'PresetsManagementModal',
        'CategoriesSettingsModal',
        'AnalyticsPanel',
        'RenameChatDialog',
        'SavedConversationsModal',
        'ConnectorsStore',
      ],
      props: {
        messages: 'Message[]',
        selectedModels: 'string[]',
        onSendMessage: '(message, attachments) => void',
        onModelsChange: '(models) => void',
        // ... many optional props
      },
      testFile: 'ChatControlBox.test.tsx',
      breakingChanges: [
        'Changing Message interface',
        'Changing required props',
        'Removing built-in modals',
      ],
    },

    MODE_MENU: {
      name: 'ModeMenu',
      path: 'client/src/components/ModeMenu.tsx',
      purpose: 'Navigation dropdown for switching between app modes',
      exports: ['ModeMenu'],
      dependents: [
        'EmptyPage.tsx',
        'ConversationPage.tsx',
        'AgentsPage.tsx',
      ],
      dependencies: [
        'wouter - Navigation',
        'ZIndexContext - Layering',
      ],
      modes: ['Chat', 'Empty', 'Conversation', 'Agents'],
      breakingChanges: [
        'Changing mode names',
        'Changing route mappings',
      ],
    },

    EMPTY_PAGE: {
      name: 'EmptyPage',
      path: 'client/src/pages/EmptyPage.tsx',
      purpose: 'Main app page with floating chat windows',
      exports: ['default'],
      dependents: [
        'App.tsx - Route component',
      ],
      dependencies: [
        'FloatingChatWindow',
        'WindowDock',
        'WindowLayoutPresets',
        'ModeMenu',
        'CollapsibleMenuGroup',
        'ThemeContext',
        'ZIndexContext',
      ],
      routes: ['/', '/chat'],
      features: [
        'Hamburger menu',
        'Theme toggle',
        'Window management',
        'Mode selection',
      ],
    },
  },

  // ===========================================================================
  // MODALS - Modal dialog components
  // ===========================================================================
  MODALS: {

    PRESET_EDITOR_MODAL: {
      name: 'PresetEditorModal',
      path: 'client/src/components/PresetEditorModal.tsx',
      purpose: 'Create and edit model presets',
      openedBy: [
        'PresetsPanel - Edit button',
        'PresetsManagementModal - Edit button',
      ],
    },

    PRESETS_MANAGEMENT_MODAL: {
      name: 'PresetsManagementModal',
      path: 'client/src/components/PresetsManagementModal.tsx',
      purpose: 'Full presets management interface',
      openedBy: [
        'Settings menu - Presets Setting',
      ],
    },

    CATEGORIES_SETTINGS_MODAL: {
      name: 'CategoriesSettingsModal',
      path: 'client/src/components/CategoriesSettingsModal.tsx',
      purpose: 'Manage preset categories',
      openedBy: [
        'Settings menu - Categories Setting',
      ],
    },

    PRESET_SELECTION_DIALOG: {
      name: 'PresetSelectionDialog',
      path: 'client/src/components/PresetSelectionDialog.tsx',
      purpose: 'Select presets to add to quick presets',
      openedBy: [
        'PresetsPanel - +New button',
      ],
    },

    SAVED_CONVERSATIONS_MODAL: {
      name: 'SavedConversationsModal',
      path: 'client/src/components/SavedConversationsModal.tsx',
      purpose: 'View and manage saved conversations',
      openedBy: [
        'Footer menu - View All Saved',
      ],
    },

    WINDOW_LAYOUT_PRESETS: {
      name: 'WindowLayoutPresets',
      path: 'client/src/components/WindowLayoutPresets.tsx',
      purpose: 'Manage window layout presets',
      openedBy: [
        'Hamburger menu - Window Layouts',
      ],
    },
  },

  // ===========================================================================
  // PANELS - Slide-out or dropdown panels
  // ===========================================================================
  PANELS: {

    MODEL_SELECTOR: {
      name: 'ModelSelector',
      path: 'client/src/components/ModelSelector.tsx',
      purpose: 'Select AI models for chat',
      openedBy: [
        'ChatControlBox - Models button',
      ],
    },

    PRESETS_PANEL: {
      name: 'PresetsPanel',
      path: 'client/src/components/PresetsPanel.tsx',
      purpose: 'Quick presets selection and management',
      openedBy: [
        'ChatControlBox - Presets button',
      ],
    },

    ANALYTICS_PANEL: {
      name: 'AnalyticsPanel',
      path: 'client/src/components/AnalyticsPanel.tsx',
      purpose: 'View preset usage analytics',
      openedBy: [
        'Footer menu - Analytics',
      ],
    },

    CONNECTORS_STORE: {
      name: 'ConnectorsStore',
      path: 'client/src/components/ConnectorsStore.tsx',
      purpose: 'Browse and enable connectors',
      openedBy: [
        'ChatControlBox - Connectors button',
      ],
    },
  },

} as const;

/**
 * Get all components that depend on a given component
 */
export function getDependents(componentName: string): string[] {
  for (const category of Object.values(COMPONENTS)) {
    for (const component of Object.values(category)) {
      if (component.name === componentName) {
        return (component as any).dependents || [];
      }
    }
  }
  return [];
}

/**
 * Get all dependencies of a given component
 */
export function getDependencies(componentName: string): string[] {
  for (const category of Object.values(COMPONENTS)) {
    for (const component of Object.values(category)) {
      if (component.name === componentName) {
        return (component as any).dependencies || [];
      }
    }
  }
  return [];
}


================================================================================
                           CATEGORY 4: ROUTES
================================================================================

File: client/src/lib/fmf/routes.ts

Purpose: Single source of truth for all application routes.
         Components MUST use these constants for navigation.

------------------------------------------------------------------------------

/**
 * ROUTES - Application Route Definitions
 * 
 * MANDATORY: Use these constants for all navigation.
 * DO NOT hardcode route strings in components.
 * 
 * @example
 * import { ROUTES } from '@/lib/fmf';
 * setLocation(ROUTES.CHAT);
 */

export const ROUTES = {
  /**
   * HOME - Main entry point
   * Component: EmptyPage
   * Features: Floating chat windows, hamburger menu
   */
  HOME: '/',

  /**
   * CHAT - Chat mode
   * Component: EmptyPage (same as HOME)
   * Behavior: Opens with chat window focused
   */
  CHAT: '/chat',

  /**
   * CONVERSATION - Conversation mode
   * Component: ConversationPage
   * Status: Coming soon
   */
  CONVERSATION: '/conversation',

  /**
   * AGENTS - Agents mode
   * Component: AgentsPage
   * Status: Coming soon
   */
  AGENTS: '/agents',

  /**
   * HOME_LEGACY - Legacy home page
   * Component: Home
   * Note: Kept for backwards compatibility
   */
  HOME_LEGACY: '/home',

  /**
   * TEST - Test routes (development only)
   */
  TEST: {
    CHAT_CONTROL_BOX: '/test/chat-control-box',
  },
} as const;

/**
 * Route to Component mapping
 */
export const ROUTE_COMPONENTS: Record<string, string> = {
  [ROUTES.HOME]: 'EmptyPage',
  [ROUTES.CHAT]: 'EmptyPage',
  [ROUTES.CONVERSATION]: 'ConversationPage',
  [ROUTES.AGENTS]: 'AgentsPage',
  [ROUTES.HOME_LEGACY]: 'Home',
  [ROUTES.TEST.CHAT_CONTROL_BOX]: 'ChatControlBoxTest',
};

/**
 * Route metadata
 */
export const ROUTE_METADATA: Record<string, { title: string; mode: string }> = {
  [ROUTES.HOME]: { title: 'Multi-AI Chat', mode: 'Empty' },
  [ROUTES.CHAT]: { title: 'Chat', mode: 'Chat' },
  [ROUTES.CONVERSATION]: { title: 'Conversation', mode: 'Conversation' },
  [ROUTES.AGENTS]: { title: 'Agents', mode: 'Agents' },
};

/** Type for ROUTES */
export type Routes = typeof ROUTES;


================================================================================
                         CATEGORY 5: STATE KEYS
================================================================================

File: client/src/lib/fmf/state-keys.ts

Purpose: Single source of truth for all localStorage keys and state variable patterns.
         Changing these keys will break user data persistence.

------------------------------------------------------------------------------

/**
 * STATE_KEYS - Storage and State Management Keys
 * 
 * CRITICAL: These keys are used for data persistence.
 * Changing them will cause users to lose their saved data.
 * 
 * @example
 * import { STATE_KEYS } from '@/lib/fmf';
 * localStorage.getItem(STATE_KEYS.LOCAL_STORAGE.THEME);
 */

export const STATE_KEYS = {

  // ===========================================================================
  // LOCAL_STORAGE - Keys for localStorage persistence
  // ===========================================================================
  LOCAL_STORAGE: {
    /**
     * THEME
     * Type: 'dark' | 'light'
     * Used by: ThemeContext
     * Purpose: Persists user's theme preference
     */
    THEME: 'theme',

    /**
     * FLOATING_CHAT_WINDOWS
     * Type: ChatWindow[]
     * Used by: EmptyPage
     * Purpose: Persists window positions, sizes, and states
     */
    FLOATING_CHAT_WINDOWS: 'floatingChatWindows',

    /**
     * CUSTOM_PRESETS
     * Type: CustomPreset[]
     * Used by: ChatControlBox, PresetsManagementModal
     * Purpose: User-created model presets
     */
    CUSTOM_PRESETS: 'customPresets',

    /**
     * QUICK_PRESETS
     * Type: QuickPreset[]
     * Used by: PresetsPanel
     * Purpose: Presets shown in quick access panel
     */
    QUICK_PRESETS: 'quickPresets',

    /**
     * CONVERSATION_PREFIX
     * Type: Prefix for conversation keys
     * Format: 'conversation:{id}'
     * Used by: ChatControlBox
     * Purpose: Individual saved conversations
     */
    CONVERSATION_PREFIX: 'conversation:',

    /**
     * PRESET_USAGE
     * Type: Record<string, number>
     * Used by: AnalyticsPanel
     * Purpose: Track preset usage counts
     */
    PRESET_USAGE: 'presetUsage',

    /**
     * CUSTOM_CATEGORIES
     * Type: Category[]
     * Used by: CategoriesSettingsModal
     * Purpose: User-created preset categories
     */
    CUSTOM_CATEGORIES: 'customCategories',

    /**
     * WINDOW_LAYOUTS
     * Type: WindowLayout[]
     * Used by: WindowLayoutPresets
     * Purpose: Saved window layout configurations
     */
    WINDOW_LAYOUTS: 'windowLayouts',
  },

  // ===========================================================================
  // STATE_PATTERNS - Naming conventions for state variables
  // ===========================================================================
  STATE_PATTERNS: {
    /**
     * Boolean visibility states
     * Pattern: show{Feature}
     * Examples: showMenu, showSettings, showModelsPanel
     */
    VISIBILITY: {
      prefix: 'show',
      examples: ['showMenu', 'showSettings', 'showModelsPanel', 'showPresetsPanel'],
    },

    /**
     * Boolean loading/action states
     * Pattern: is{Action}ing
     * Examples: isLoading, isSending, isListening
     */
    LOADING: {
      prefix: 'is',
      suffix: 'ing',
      examples: ['isLoading', 'isSending', 'isListening', 'isEditing'],
    },

    /**
     * Selected items
     * Pattern: selected{Items}
     * Examples: selectedModels, selectedPreset, selectedCategory
     */
    SELECTED: {
      prefix: 'selected',
      examples: ['selectedModels', 'selectedPreset', 'selectedCategory'],
    },

    /**
     * Editing state
     * Pattern: editing{Item}
     * Examples: editingPreset, editingCategory, editingTitle
     */
    EDITING: {
      prefix: 'editing',
      examples: ['editingPreset', 'editingCategory', 'editingTitle'],
    },

    /**
     * Current/Active item
     * Pattern: current{Item} or active{Item}
     * Examples: currentConversation, activeWindow
     */
    CURRENT: {
      prefixes: ['current', 'active'],
      examples: ['currentConversation', 'activeWindow', 'currentPage'],
    },
  },

} as const;

/** Type for STATE_KEYS */
export type StateKeys = typeof STATE_KEYS;

/**
 * Get conversation storage key
 */
export function getConversationKey(id: string): string {
  return `${STATE_KEYS.LOCAL_STORAGE.CONVERSATION_PREFIX}${id}`;
}

/**
 * Check if a key is a conversation key
 */
export function isConversationKey(key: string): boolean {
  return key.startsWith(STATE_KEYS.LOCAL_STORAGE.CONVERSATION_PREFIX);
}


================================================================================
                          CATEGORY 6: PATTERNS
================================================================================

File: client/src/lib/fmf/patterns.ts

Purpose: Documents naming conventions and coding patterns used in the codebase.
         New code MUST follow these patterns for consistency.

------------------------------------------------------------------------------

/**
 * PATTERNS - Naming Conventions and Coding Patterns
 * 
 * All new code MUST follow these established patterns.
 */

export const PATTERNS = {

  // ===========================================================================
  // FILE_NAMING - How to name files
  // ===========================================================================
  FILE_NAMING: {
    /**
     * Components: PascalCase
     * Examples: FloatingChatWindow.tsx, ChatControlBox.tsx
     */
    COMPONENTS: {
      case: 'PascalCase',
      extension: '.tsx',
      examples: ['FloatingChatWindow.tsx', 'ChatControlBox.tsx', 'ModeMenu.tsx'],
    },

    /**
     * Hooks: camelCase with 'use' prefix
     * Examples: useTheme.ts, useResponsive.ts
     */
    HOOKS: {
      case: 'camelCase',
      prefix: 'use',
      extension: '.ts',
      examples: ['useTheme.ts', 'useResponsive.ts', 'useZIndex.ts'],
    },

    /**
     * Utilities: kebab-case
     * Examples: z-index.ts, quick-presets.ts
     */
    UTILITIES: {
      case: 'kebab-case',
      extension: '.ts',
      examples: ['z-index.ts', 'quick-presets.ts', 'ai-providers.ts'],
    },

    /**
     * Tests: Same as source file + .test
     * Examples: ChatControlBox.test.tsx, z-index.test.ts
     */
    TESTS: {
      suffix: '.test',
      examples: ['ChatControlBox.test.tsx', 'z-index.test.ts'],
    },

    /**
     * Types: PascalCase or kebab-case
     * Examples: types.ts, interfaces.ts
     */
    TYPES: {
      extension: '.ts',
      examples: ['types.ts', 'interfaces.ts'],
    },
  },

  // ===========================================================================
  // COMPONENT_STRUCTURE - How to structure components
  // ===========================================================================
  COMPONENT_STRUCTURE: {
    /**
     * Standard component file structure
     */
    order: [
      '1. Imports (external, then internal)',
      '2. Type definitions',
      '3. Constants',
      '4. Helper functions',
      '5. Component function',
      '6. Export',
    ],

    /**
     * Inside component function
     */
    componentOrder: [
      '1. Hooks (useState, useEffect, custom hooks)',
      '2. Refs',
      '3. Derived state / memoized values',
      '4. Event handlers',
      '5. Effects',
      '6. Render helpers',
      '7. Return JSX',
    ],
  },

  // ===========================================================================
  // PROP_NAMING - How to name props
  // ===========================================================================
  PROP_NAMING: {
    /**
     * Event handlers: on{Event}
     * Examples: onClick, onClose, onSendMessage
     */
    EVENT_HANDLERS: {
      prefix: 'on',
      examples: ['onClick', 'onClose', 'onSendMessage', 'onModelsChange'],
    },

    /**
     * Boolean props: is{State} or has{Feature}
     * Examples: isLoading, isDisabled, hasError
     */
    BOOLEANS: {
      prefixes: ['is', 'has', 'should', 'can'],
      examples: ['isLoading', 'isDisabled', 'hasError', 'shouldAutoFocus'],
    },

    /**
     * Render props: render{Element}
     * Examples: renderHeader, renderFooter
     */
    RENDER_PROPS: {
      prefix: 'render',
      examples: ['renderHeader', 'renderFooter', 'renderItem'],
    },

    /**
     * Hide/Show props: hide{Feature}
     * Examples: hideConnectors, hideSynthesizer
     */
    VISIBILITY: {
      prefix: 'hide',
      examples: ['hideConnectors', 'hideSynthesizer', 'hideVoiceInput'],
    },
  },

  // ===========================================================================
  // CSS_PATTERNS - How to write styles
  // ===========================================================================
  CSS_PATTERNS: {
    /**
     * Use Tailwind utility classes
     */
    framework: 'Tailwind CSS',

    /**
     * Z-index: Use Z_CLASS constants
     * NEVER use arbitrary z-index values
     */
    zIndex: {
      correct: 'className={Z_CLASS.MODAL}',
      incorrect: 'className="z-50"',
      reference: 'lib/z-index.ts',
    },

    /**
     * Colors: Use CSS variables from theme
     */
    colors: {
      correct: 'bg-background text-foreground',
      incorrect: 'bg-gray-900 text-white',
    },

    /**
     * Responsive: Mobile-first approach
     */
    responsive: {
      approach: 'Mobile-first',
      breakpoints: ['sm:', 'md:', 'lg:', 'xl:', '2xl:'],
    },
  },

  // ===========================================================================
  // IMPORT_ORDER - How to order imports
  // ===========================================================================
  IMPORT_ORDER: {
    order: [
      '1. React and React-related (useState, useEffect)',
      '2. External libraries (framer-motion, wouter)',
      '3. Internal components (@/components/)',
      '4. Internal hooks (@/hooks/)',
      '5. Internal utilities (@/lib/)',
      '6. Types',
      '7. Styles/CSS',
    ],
  },

} as const;


================================================================================
                       CATEGORY 7: RELATIONSHIPS
================================================================================

File: client/src/lib/fmf/relationships.ts

Purpose: Documents relationships between different parts of the codebase.
         Use this to understand impact when making changes.

------------------------------------------------------------------------------

/**
 * RELATIONSHIPS - Dependency and Impact Mappings
 * 
 * Use this to understand what will be affected by changes.
 */

export const RELATIONSHIPS = {

  // ===========================================================================
  // LABEL_LOCATIONS - Where each label appears
  // ===========================================================================
  LABEL_LOCATIONS: {
    'Theme': [
      'EmptyPage.tsx - Hamburger menu toggle',
    ],
    'Chat Theme': [
      'ChatControlBox.tsx - Wheel settings menu',
      'ChatFooter.tsx - Wheel settings menu',
      'SettingsMenu.tsx - Wheel settings menu',
      'Home.tsx - Wheel settings menu',
    ],
    'Mode': [
      'ModeMenu.tsx - Header dropdown',
    ],
    'Presets': [
      'ChatControlBox.tsx - Control bar button',
    ],
    'Presets Setting': [
      'ChatControlBox.tsx - Wheel settings menu',
      'ChatFooter.tsx - Wheel settings menu',
      'SettingsMenu.tsx - Wheel settings menu',
    ],
    'Settings': [
      'ChatControlBox.tsx - Control bar button tooltip',
    ],
    'Models': [
      'ChatControlBox.tsx - Control bar button',
    ],
  },

  // ===========================================================================
  // COMPONENT_CHAINS - Component dependency chains
  // ===========================================================================
  COMPONENT_CHAINS: {
    /**
     * App → EmptyPage → FloatingChatWindow → ChatControlBox
     */
    MAIN_CHAT_FLOW: [
      'App.tsx',
      'EmptyPage.tsx',
      'FloatingChatWindow.tsx',
      'ChatControlBox.tsx',
    ],

    /**
     * ThemeProvider affects everything
     */
    THEME_IMPACT: [
      'ThemeContext.tsx',
      '→ App.tsx (wrapper)',
      '→ All components (via useTheme or dark: classes)',
    ],

    /**
     * Z-index system
     */
    ZINDEX_IMPACT: [
      'z-index.ts (constants)',
      'ZIndexContext.tsx (provider)',
      '→ FloatingChatWindow.tsx',
      '→ ModeMenu.tsx',
      '→ All modals',
      '→ All dropdowns',
    ],
  },

  // ===========================================================================
  // STORAGE_DEPENDENCIES - What depends on each storage key
  // ===========================================================================
  STORAGE_DEPENDENCIES: {
    'theme': [
      'ThemeContext.tsx - Read/write',
      'App.tsx - Initial load',
    ],
    'floatingChatWindows': [
      'EmptyPage.tsx - Read/write',
    ],
    'customPresets': [
      'ChatControlBox.tsx - Read/write',
      'PresetsManagementModal.tsx - Read/write',
      'PresetsPanel.tsx - Read',
    ],
    'quickPresets': [
      'PresetsPanel.tsx - Read/write',
      'ChatControlBox.tsx - Read',
    ],
  },

  // ===========================================================================
  // ROUTE_DEPENDENCIES - What each route depends on
  // ===========================================================================
  ROUTE_DEPENDENCIES: {
    '/': {
      component: 'EmptyPage',
      providers: ['ThemeProvider', 'ZIndexProvider', 'TooltipProvider'],
      features: ['FloatingChatWindow', 'WindowDock', 'ModeMenu'],
    },
    '/chat': {
      component: 'EmptyPage',
      providers: ['ThemeProvider', 'ZIndexProvider', 'TooltipProvider'],
      features: ['FloatingChatWindow', 'WindowDock', 'ModeMenu'],
    },
    '/conversation': {
      component: 'ConversationPage',
      providers: ['ThemeProvider', 'ZIndexProvider', 'TooltipProvider'],
      features: ['ModeMenu'],
    },
    '/agents': {
      component: 'AgentsPage',
      providers: ['ThemeProvider', 'ZIndexProvider', 'TooltipProvider'],
      features: ['ModeMenu'],
    },
  },

} as const;


================================================================================
                        CATEGORY 8: ENFORCEMENT
================================================================================

File: client/src/lib/fmf/__tests__/fmf.test.ts

Purpose: Automated tests that verify compliance with the framework.
         These tests MUST pass before any code can be committed.

------------------------------------------------------------------------------

/**
 * FMF Enforcement Tests
 * 
 * These tests verify that the codebase complies with the Fix-Modify Framework.
 * Run with: pnpm test
 */

import { describe, it, expect } from 'vitest';
import { UI_LABELS } from '../ui-labels';
import { RESERVED_TERMS, RESERVED_TERM_LIST, isReservedTerm } from '../reserved-terms';
import { ROUTES, ROUTE_COMPONENTS } from '../routes';
import { STATE_KEYS } from '../state-keys';
import { COMPONENTS } from '../components';

describe('Fix-Modify Framework (FMF)', () => {

  // ===========================================================================
  // UI Labels Tests
  // ===========================================================================
  describe('UI Labels', () => {
    
    it('should have all required header labels', () => {
      expect(UI_LABELS.HEADER.MODE).toBe('Mode');
      expect(UI_LABELS.HEADER.THEME).toBe('Theme');
    });

    it('should have all required settings labels', () => {
      expect(UI_LABELS.SETTINGS.PRESETS_SETTING).toBe('Presets Setting');
      expect(UI_LABELS.SETTINGS.CATEGORIES_SETTING).toBe('Categories Setting');
      expect(UI_LABELS.SETTINGS.CHAT_THEME).toBe('Chat Theme');
      expect(UI_LABELS.SETTINGS.LANGUAGE).toBe('Language');
      expect(UI_LABELS.SETTINGS.EXPORT_DATA).toBe('Export Data');
    });

    it('should have all required control labels', () => {
      expect(UI_LABELS.CONTROLS.MENU).toBe('Menu');
      expect(UI_LABELS.CONTROLS.NEW_CHAT).toBe('New Chat');
      expect(UI_LABELS.CONTROLS.MODELS).toBe('Models');
      expect(UI_LABELS.CONTROLS.SETTINGS).toBe('Settings');
      expect(UI_LABELS.CONTROLS.PRESETS).toBe('Presets');
    });

    it('should have distinct labels for Theme vs Chat Theme', () => {
      expect(UI_LABELS.HEADER.THEME).toBe('Theme');
      expect(UI_LABELS.SETTINGS.CHAT_THEME).toBe('Chat Theme');
      expect(UI_LABELS.HEADER.THEME).not.toBe(UI_LABELS.SETTINGS.CHAT_THEME);
    });

    it('should have model count function that handles singular/plural', () => {
      expect(UI_LABELS.CONTROLS.MODEL_COUNT(0)).toBe('0 Models');
      expect(UI_LABELS.CONTROLS.MODEL_COUNT(1)).toBe('1 Model');
      expect(UI_LABELS.CONTROLS.MODEL_COUNT(2)).toBe('2 Models');
      expect(UI_LABELS.CONTROLS.MODEL_COUNT(10)).toBe('10 Models');
    });

    it('should have theme switched message function', () => {
      expect(UI_LABELS.MESSAGES.THEME_SWITCHED('dark')).toBe('Switched to dark mode');
      expect(UI_LABELS.MESSAGES.THEME_SWITCHED('light')).toBe('Switched to light mode');
    });
  });

  // ===========================================================================
  // Reserved Terms Tests
  // ===========================================================================
  describe('Reserved Terms', () => {
    
    it('should have Mode reserved for navigation only', () => {
      expect(RESERVED_TERMS.MODE.term).toBe('Mode');
      expect(RESERVED_TERMS.MODE.reservedFor).toContain('navigation');
    });

    it('should have Theme reserved for appearance', () => {
      expect(RESERVED_TERMS.THEME.term).toBe('Theme');
      expect(RESERVED_TERMS.THEME.reservedFor).toContain('appearance');
    });

    it('should provide alternatives for all reserved terms', () => {
      Object.values(RESERVED_TERMS).forEach(term => {
        expect(term.alternatives.length).toBeGreaterThan(0);
      });
    });

    it('should have quick lookup list with all terms', () => {
      expect(RESERVED_TERM_LIST).toContain('Mode');
      expect(RESERVED_TERM_LIST).toContain('Theme');
      expect(RESERVED_TERM_LIST).toContain('Settings');
      expect(RESERVED_TERM_LIST).toContain('Presets');
      expect(RESERVED_TERM_LIST).toContain('Models');
      expect(RESERVED_TERM_LIST).toContain('Windows');
    });

    it('should correctly identify reserved terms', () => {
      expect(isReservedTerm('Mode')).toBe(true);
      expect(isReservedTerm('Theme')).toBe(true);
      expect(isReservedTerm('RandomWord')).toBe(false);
    });
  });

  // ===========================================================================
  // Routes Tests
  // ===========================================================================
  describe('Routes', () => {
    
    it('should have all main routes defined', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.CHAT).toBe('/chat');
      expect(ROUTES.CONVERSATION).toBe('/conversation');
      expect(ROUTES.AGENTS).toBe('/agents');
    });

    it('should have component mapping for all routes', () => {
      expect(ROUTE_COMPONENTS[ROUTES.HOME]).toBe('EmptyPage');
      expect(ROUTE_COMPONENTS[ROUTES.CHAT]).toBe('EmptyPage');
      expect(ROUTE_COMPONENTS[ROUTES.CONVERSATION]).toBe('ConversationPage');
      expect(ROUTE_COMPONENTS[ROUTES.AGENTS]).toBe('AgentsPage');
    });
  });

  // ===========================================================================
  // State Keys Tests
  // ===========================================================================
  describe('State Keys', () => {
    
    it('should have all localStorage keys defined', () => {
      expect(STATE_KEYS.LOCAL_STORAGE.THEME).toBe('theme');
      expect(STATE_KEYS.LOCAL_STORAGE.FLOATING_CHAT_WINDOWS).toBe('floatingChatWindows');
      expect(STATE_KEYS.LOCAL_STORAGE.CUSTOM_PRESETS).toBe('customPresets');
      expect(STATE_KEYS.LOCAL_STORAGE.QUICK_PRESETS).toBe('quickPresets');
    });

    it('should have conversation prefix defined', () => {
      expect(STATE_KEYS.LOCAL_STORAGE.CONVERSATION_PREFIX).toBe('conversation:');
    });
  });

  // ===========================================================================
  // Components Tests
  // ===========================================================================
  describe('Components', () => {
    
    it('should have all providers documented', () => {
      expect(COMPONENTS.PROVIDERS.THEME_PROVIDER.name).toBe('ThemeProvider');
      expect(COMPONENTS.PROVIDERS.ZINDEX_PROVIDER.name).toBe('ZIndexProvider');
    });

    it('should have all core components documented', () => {
      expect(COMPONENTS.CORE.FLOATING_CHAT_WINDOW.name).toBe('FloatingChatWindow');
      expect(COMPONENTS.CORE.CHAT_CONTROL_BOX.name).toBe('ChatControlBox');
      expect(COMPONENTS.CORE.MODE_MENU.name).toBe('ModeMenu');
    });

    it('should have dependency information for critical components', () => {
      expect(COMPONENTS.CORE.FLOATING_CHAT_WINDOW.dependencies.length).toBeGreaterThan(0);
      expect(COMPONENTS.CORE.CHAT_CONTROL_BOX.dependencies.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Cross-Category Tests
  // ===========================================================================
  describe('Cross-Category Consistency', () => {
    
    it('should not have Mode used outside of navigation context', () => {
      // Mode should only appear in HEADER, not in SETTINGS or CONTROLS
      expect(UI_LABELS.HEADER.MODE).toBeDefined();
      expect((UI_LABELS.SETTINGS as any).MODE).toBeUndefined();
      expect((UI_LABELS.CONTROLS as any).MODE).toBeUndefined();
    });

    it('should have Theme in correct locations only', () => {
      // Theme in HEADER (global), Chat Theme in SETTINGS (chat-specific)
      expect(UI_LABELS.HEADER.THEME).toBe('Theme');
      expect(UI_LABELS.SETTINGS.CHAT_THEME).toBe('Chat Theme');
    });
  });

});


================================================================================
                            CHANGE CLASSIFICATION
================================================================================

Use this table to determine the risk level and requirements for any change:

+------------+------------------+--------------------------------+------------------+
| Risk Level | Change Type      | Examples                       | Requirements     |
+------------+------------------+--------------------------------+------------------+
| HIGH       | Breaking         | - Rename exported functions    | - Full impact    |
|            |                  | - Change prop interfaces       |   analysis       |
|            |                  | - Modify localStorage keys     | - All tests pass |
|            |                  | - Change route paths           | - Manual QA      |
|            |                  | - Alter shared state structure | - Update FMF     |
+------------+------------------+--------------------------------+------------------+
| MEDIUM     | Additive         | - Add new components           | - Verify no      |
|            |                  | - Add new features             |   conflicts      |
|            |                  | - Add new routes               | - Add tests      |
|            |                  | - Add new state                | - Update docs    |
|            |                  | - Add new localStorage keys    | - Update FMF     |
+------------+------------------+--------------------------------+------------------+
| LOW        | Cosmetic         | - Style updates                | - Verify         |
|            |                  | - Label text changes           |   consistency    |
|            |                  | - Comment updates              | - Update related |
|            |                  | - Documentation fixes          |   items          |
+------------+------------------+--------------------------------+------------------+


================================================================================
                            ROLLBACK CRITERIA
================================================================================

IMMEDIATELY rollback changes if ANY of the following occur:

1. Tests fail that weren't modified by the change
2. Console errors appear in unrelated areas
3. UI breaks in unexpected places
4. TypeScript compilation errors in unrelated files
5. User reports issues in features that weren't touched
6. Performance degradation in unrelated areas
7. Data loss or corruption in localStorage
8. Navigation breaks between routes

Rollback process:
1. git revert <commit> OR webdev_rollback_checkpoint
2. Verify app returns to working state
3. Document what went wrong
4. Re-analyze using FMF checklist
5. Create new change with proper impact analysis


================================================================================
                              USAGE EXAMPLES
================================================================================

------------------------------------------------------------------------------
EXAMPLE 1: Changing a UI Label
------------------------------------------------------------------------------

WRONG WAY (causes inconsistency):
```tsx
// EmptyPage.tsx
<button onClick={toggleTheme}>
  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}  // ❌ Hardcoded, wrong label
</button>
```

RIGHT WAY (using FMF):
```tsx
// EmptyPage.tsx
import { UI_LABELS } from '@/lib/fmf';

<button onClick={toggleTheme}>
  {theme === 'dark' ? <Sun /> : <Moon />}
  <span>{UI_LABELS.HEADER.THEME}</span>  // ✅ Uses constant
</button>
```

------------------------------------------------------------------------------
EXAMPLE 2: Adding a New Feature
------------------------------------------------------------------------------

Before adding, complete the checklist:

1. IDENTIFY:
   - Change: Add "Favorites" feature to presets
   - Type: Feature addition
   - Risk: MEDIUM

2. TRACE:
   - Affects: PresetsPanel, PresetEditorModal, localStorage
   - Related patterns: Similar to "pinned" presets

3. CONFLICT CHECK:
   - "Favorites" not used elsewhere ✓
   - Follows preset pattern ✓

4. PLAN:
   - Add UI_LABELS.CONTROLS.FAVORITES
   - Add STATE_KEYS.LOCAL_STORAGE.FAVORITE_PRESETS
   - Update PresetsPanel.tsx
   - Update PresetEditorModal.tsx
   - Add tests
   - Update FMF documentation

5. EXECUTE:
   - Update FMF constants first
   - Implement feature
   - Add tests

6. VERIFY:
   - Run all tests
   - Manual testing
   - No regressions

------------------------------------------------------------------------------
EXAMPLE 3: Renaming a Component
------------------------------------------------------------------------------

1. IDENTIFY:
   - Change: Rename ChatControlBox → ChatControls
   - Type: Refactor
   - Risk: HIGH (breaking change)

2. TRACE:
   - Imports in: FloatingChatWindow.tsx, index.ts, test file
   - Exports: components/ChatControlBox/index.ts
   - Documentation: JSDoc, todo.md, FMF

3. CONFLICT CHECK:
   - "ChatControls" not used ✓
   - Follows naming pattern ✓

4. PLAN:
   - Rename folder: ChatControlBox/ → ChatControls/
   - Rename file: ChatControlBox.tsx → ChatControls.tsx
   - Update all imports (3 files)
   - Rename test file
   - Update index.ts export
   - Update FMF COMPONENTS registry
   - Update all documentation

5. EXECUTE (in order):
   1. Update FMF COMPONENTS
   2. Rename folder and files
   3. Update component name
   4. Update all imports
   5. Update test file
   6. Update documentation

6. VERIFY:
   - TypeScript compilation
   - All tests pass
   - Component renders correctly


================================================================================
                          FRAMEWORK MAINTENANCE
================================================================================

This framework MUST be updated when:

1. New protected items are added (labels, components, routes, keys)
2. New patterns are established
3. New categories of items emerge
4. Enforcement mechanisms are added or modified
5. Relationships between components change
6. Breaking changes are made to existing items

Update process:
1. Identify what changed
2. Update relevant category file(s)
3. Update tests if needed
4. Update this documentation
5. Commit with message: "FMF: [description of update]"

------------------------------------------------------------------------------

Version: 1.0.0
Created: 2024
Last Updated: [Current Date]

================================================================================
                              END OF FRAMEWORK
================================================================================
