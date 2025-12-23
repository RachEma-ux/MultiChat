# FloatingChatWindow Footer Adaptation Tasks

## Phase 1: Update ChatFooter Component
- [ ] Update Hamburger Menu to show Recent Conversations section with last 3 saved
- [ ] Add "View All Saved" and "Archive (X)" links to Hamburger Menu
- [ ] Update Settings Menu to include "Presets Setting" option that opens modal
- [ ] Ensure all button sizes match: 28×28px for controls, 40×40px for input row
- [ ] Add attachments preview section above footer controls
- [ ] Update file upload to show attachment previews with remove buttons
- [ ] Ensure textarea has correct placeholder text and disabled state
- [ ] Verify all tooltips match Reference Version

## Phase 2: Add Presets Management Modal
- [ ] Create full-screen Presets Management modal component
- [ ] Add preset editor form with name, description, and model selection
- [ ] Organize model selection by provider with checkboxes
- [ ] Implement create/edit/delete preset functionality
- [ ] Add validation (name required, at least 1 model)
- [ ] Update localStorage integration for custom presets

## Phase 3: Implement Inline Title Editing
- [ ] Add isEditingTitle state to FloatingChatWindow
- [ ] Update window header to support inline editing mode
- [ ] Add edit input field with save/cancel buttons
- [ ] Wire "Rename Chat" menu option to enable inline editing
- [ ] Update conversation title on save

## Phase 4: Update State Management
- [ ] Add archivedConversations state
- [ ] Update savedConversations to load from localStorage on mount
- [ ] Add customPresets state and localStorage integration
- [ ] Ensure all state variables match Reference Version naming
- [ ] Update all localStorage keys to match Reference Version

## Phase 5: Testing
- [ ] Test Hamburger Menu with Recent Conversations display
- [ ] Test Presets Management modal (create/edit/delete)
- [ ] Test inline title editing
- [ ] Test file attachments preview and removal
- [ ] Test all disabled states and validation
- [ ] Verify localStorage persistence across page refresh

## Phase 6: Final Checkpoint
- [ ] Create checkpoint with complete adaptation

## URGENT FIXES
- [ ] Fix Summarizer button - Shows "select models" error even when 3 models are already selected
  - Check handleSummarizer/onSummarizerClick function in FloatingChatWindow
  - Ensure it uses the current selectedModels state
  - Should generate synthesis from all selected models' responses
- [ ] Fix PresetEditorModal UI to match Reference Version screenshot exactly
  - Show provider sections with colored dots (Anthropic=orange, OpenAI=green, Google=blue)
  - Display checkboxes for each model under provider (blue checkmark when selected)
  - Add Cancel and Update Preset buttons at bottom
- [ ] Implement auto-growing textarea in ChatFooter
  - Textarea should start at single line height
  - Auto-expand as user types (up to reasonable max height)


## Cloud Sync, Analytics & Shortcuts
- [x] Create database schema for conversations (conversations table)
- [x] Create tRPC procedures for CRUD operations on conversations
- [x] Update frontend to sync conversations with database
- [x] Implement Advanced Analytics with visual charts
- [x] Implement Keyboard Shortcuts (Ctrl+K for search, Ctrl+S for save)

## Bug Fixes (Reported Issues)
- [x] Fix floating chat window dragging not working
- [x] Fix Models button not working
- [x] Fix Presets button not working

## View All Saved Modal & Window Enhancements
- [x] Fix View All Saved modal exit button not responding
- [x] Implement Snap-to-Edge for chat window
- [x] Implement Resize Handle for chat window
- [x] Implement Window Memory (save position/size to localStorage)

## Presets & Multi-Window Features
- [x] Restore original Presets button behavior (rollback recent changes)
- [x] Implement Multiple Windows feature (independent chat windows)
- [x] Implement Window Presets (save/restore window layouts)
- [x] Implement Minimize to Tray (dock at bottom for minimized windows)

## Critical Bug Fixes (User Reported)
- [x] Fix Models button causing React error #185 (fixed infinite loop in useEffect)
- [x] Fix Presets button - now shows Quick Presets panel correctly

## Presets Button Fix (User Clarification)
- [x] Fix Presets button to show presets from Settings → Presets Setting
- [x] Now shows both built-in presets (Coding Team, Creative Writers, etc.) AND custom presets
- [x] Clicking a preset applies the models correctly (verified: Coding Team applies GPT-4, DeepSeek Coder, Codestral)

## Quick Presets "+ New" Button Fix
- [x] Change "+ New" button to a dropdown selector instead of opening preset editor
- [x] Dropdown shows available presets from Settings → Presets Setting (both built-in and custom)
- [x] Selecting a preset from dropdown adds it to Quick Presets list
- [x] Only shows presets not already in Quick Presets list (already-added presets are disabled)
- [x] Remove button (trash icon) allows removing presets from Quick Presets

## Quick Presets Panel Enhancements
- [x] Add edit functionality - Allow editing preset names directly in Quick Presets panel
  - Pencil icon button to enter edit mode
  - Double-click on preset name to edit
  - Press Enter or click checkmark to save
  - Press Escape to cancel
  - Modified presets show asterisk (*) indicator
- [x] Add drag-and-drop reordering - Let users arrange presets in preferred order
  - Drag handle (grip icon) on left side of each preset
  - Drag and drop to reorder presets
  - Order persists to localStorage

## Bug Fix: "+ New" Dropdown Not Responding
- [x] Fix "+ New" dropdown not opening on mobile/published version
  - Fixed z-index from z-50 to z-[9999] in DropdownMenuContent component


## Quick Presets "+ New" Modal Dialog Enhancement
- [x] Replace dropdown menu with modal dialog for "+ New" button
- [x] Add dropdown selector inside modal to select presets
- [x] Show selected presets list below dropdown
- [x] Add search/filter in the dropdown
- [x] Add preset categories (coding, writing, research) with collapsible sections
- [x] Add "Create New Preset" option at the bottom of modal


## Preset Enhancements (6 Features)
- [x] Add preset descriptions - Show brief description for each preset explaining use case
- [x] Add favorite/pin presets - Star frequently used presets to appear at top
- [x] Add preset import/export - Share presets via JSON export/import
- [x] Add JSDoc comments to PresetSelectionDialog.tsx
- [x] Create Vitest tests for preset selection logic (26 tests passing)
- [x] Add keyboard navigation in modal (arrow keys)


## Preset Features (3 New Features)
- [x] Add preset usage analytics - Track usage counts and display most used presets
- [x] Add preset sharing via URL - Generate shareable links for one-click import
- [x] Add preset templates - Create starter templates (customer support, technical writing, brainstorming)


## Preset Features (3 New Features - Round 2)
- [x] Add preset sorting - Sort by usage count, name, or date added
- [x] Add preset versioning - Track changes over time with restore capability
- [x] Add preset recommendations - Suggest presets based on usage patterns


## Preset Features (3 New Features - Round 3)
- [x] Add preset search - Search bar to filter presets by name or description
- [x] Add preset categories/tags - Organize presets into custom categories
- [x] Add preset duplication - Duplicate button to copy existing presets


## Bug Fixes & New Features (Round 4)
- [x] Fix horizontal floating - Chat window only floats vertically, not horizontally
- [x] Add custom categories - Allow users to create their own category names
- [x] Add bulk operations - Select multiple presets to delete, duplicate, or change category
- [x] Add preset statistics dashboard - Show overview of presets, usage trends, category distribution

## Edge-Based Resizing
- [x] Manual resizing by dragging chat window edges (all 4 edges + corners)

## Full Component Rewrite
- [x] Rewrite FloatingChatWindow with optimized code
- [x] Fix duplicate menu items in ChatFooter
- [x] Fix window position persistence for multi-window support (using refs to avoid infinite loops)
- [ ] Fix drag-and-drop with filters
- [ ] Implement proper file attachment handling
- [x] Fix state synchronization issues (fixed infinite loop in useEffect)
- [x] Remove duplicate AI_PROVIDERS from Home.tsx
- [ ] Clean up unused framer-motion code

## Critical Bug Fix - Page Freeze
- [x] Fix page freeze when Presets panel is opened
- [x] Investigate infinite loop or heavy re-rendering in PresetsPanel
- [x] Optimize preset-related components for performance (simplified UI with single action menu per preset)
- [x] Fix page freeze on mobile devices (simplified dropdown menu, disabled recommendations by default, added useMemo)
- [x] Fix page freeze when tapping +New button (replaced Radix Dialog with custom modal)
- [x] Fix layout issue with Quick Presets title cut off on mobile (added flex-wrap)
- [x] Fix dialog z-index (opens behind FloatingChatWindow) - increased z-index to 100
- [x] Fix freezing icons (Sort dropdown and Templates button) - replaced Radix components with custom ones
- [x] Fix floating window drag behavior (snaps back to left) - removed left edge snapping
- [x] Implement centralized z-index management system to permanently fix layering issues
- [x] Fix Sort dropdown menu going off-screen on mobile (should open to the right)
- [x] Fix floating window snapping back to left side on mobile (magnet behavior)

## Empty Mode Fix
- [x] Fix Mode menu navigation - Empty mode now properly routes to `/` (EmptyPage)
- [x] Chat mode properly shows current page indicator

## Mode Navigation Fix (Round 2)
- [ ] Fix navigation from ChatPage back to EmptyPage - setLocation('/') not working
- [ ] Ensure all Mode menu options navigate correctly across all pages

## Independent Mode Pages
- [x] Create AgentsPage component at /agents route
- [x] Create shared ModeMenu component for consistent navigation across all pages
- [x] Update App.tsx with all mode routes (/empty, /chat, /conversation, /agents)
- [x] Integrate ModeMenu in EmptyPage, ChatPage, ConversationPage, AgentsPage
- [x] Update ConversationPage to show "coming soon" message

## Presets Bug Fix
- [x] Remove ChatPage completely - use FloatingChatWindow on EmptyPage instead
- [x] Update routing so Chat mode opens a new floating window on EmptyPage
- [x] Ensure consistency across mobile and desktop versions


## Bug Fixes - Dropdown Issues (User Reported)
- [x] Fix Presets Management modal dropdown (provider/model selector disappeared)
- [x] Fix Models panel dropdown freezing on mobile


## App.tsx Refactoring (Safe Improvements)
- [x] Remove redundant /404 route (catch-all already handles it)
- [x] Add JSDoc comments for better code documentation
- [x] Clean up code formatting and organization
- [x] Verify all routes still work after changes


## Categories System Implementation
- [x] Create Category types and constants with design documentation
- [x] Create useCategories hook for centralized state management
- [x] Create CategoriesSettingsModal component with CRUD operations
- [x] Add "Categories Setting" option to Settings menu
- [x] Update Preset creation form with Category dropdown
- [x] Update Preset types to include categoryId field
- [x] Implement delete category dialog with reassignment options
- [x] Test complete Categories flow

## Categories UI Fix
- [x] Move "Add New Category" button from bottom to top of Categories Settings modal

- [x] Move Create New Category form to appear above the category list (not below)

## Responsiveness Framework Implementation
- [x] Create useResponsive hook with viewport detection and breakpoint utilities
- [x] Audit all components for z-index consistency (dropdowns z-200, modals z-400, toasts z-500)
- [x] Create CHECKPOINT_CHECKLIST.md for workflow integration
