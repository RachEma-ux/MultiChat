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


---

# Quick Presets Panel Enhancement Tasks

## Phase 1: Locate and analyze the Quick Presets component code
- [x] Find Quick Presets component (PresetsPanel.tsx)
- [x] Understand current structure and props

## Phase 2: Add New button to import presets from Presets Management modal
- [x] Add "+ New" button in top-right of Quick Presets header
- [x] Implement handler to open Presets Management modal
- [x] Pass modal open handler as prop to PresetsPanel

## Phase 3: Add Edit and Delete icons with functionality to each preset
- [x] Add Edit (pencil) icon button on each preset
- [x] Add Delete (trash) icon button on each preset
- [x] Implement quick edit modal/dialog for adding/removing models
- [x] Implement delete confirmation dialog
- [x] Add handlers for edit and delete operations
- [x] Update localStorage when presets are modified

## Phase 4: Implement inline rename functionality for preset names
- [x] Make preset name clickable/editable
- [x] Add inline editing state
- [x] Implement rename handler
- [x] Update localStorage when preset is renamed
- [x] Show visual feedback during rename

## Phase 5: Test all features and create checkpoint
- [x] Test "+ New" button opens Presets Management modal
- [x] Test Edit icon opens quick edit dialog
- [x] Test Delete icon with confirmation
- [x] Test inline rename functionality
- [x] Verify all changes persist to localStorage
- [ ] Create final checkpoint


---

# Quick Presets Refactoring - Separate Favorites System

## Requirements:
1. Quick Presets should be a separate "favorites/shortcuts" list
2. Changes in Quick Presets should NOT affect original presets in Presets Management
3. "+ New" button should open a selection dialog to add presets from Presets Management
4. Edit/Delete icons should appear on ALL presets in Quick Presets (including built-in)
5. Editing a preset in Quick Presets creates a local copy without modifying the original

## Phase 1: Design and implement separate Quick Presets storage system
- [ ] Create new localStorage key for Quick Presets (e.g., 'quickPresets')
- [ ] Design QuickPreset interface with reference to original preset
- [ ] Implement initialization: populate Quick Presets from original presets on first load
- [ ] Update FloatingChatWindow to use separate Quick Presets state
- [ ] Ensure Quick Presets can store local modifications without affecting originals

## Phase 2: Create preset selection dialog for New button
- [ ] Create PresetSelectionDialog component
- [ ] Show all available presets (built-in + custom) from Presets Management
- [ ] Allow multi-select or single-select to add to Quick Presets
- [ ] Filter out presets already in Quick Presets
- [ ] Add selected presets to Quick Presets list

## Phase 3: Update Edit/Delete to work on all presets in Quick Presets
- [ ] Show Edit/Delete icons on ALL presets in Quick Presets panel
- [ ] Update Edit handler to create local copy when editing built-in presets
- [ ] Update Delete handler to remove from Quick Presets only (not from originals)
- [ ] Update Rename handler to modify Quick Presets only

## Phase 4: Ensure Presets Management remains unchanged
- [ ] Verify Presets Management modal uses original presets storage
- [ ] Verify changes in Quick Presets don't affect Presets Management
- [ ] Verify changes in Presets Management are reflected in Quick Presets (for unmodified presets)
- [ ] Test edge cases: delete original preset that's in Quick Presets

## Phase 5: Test complete separation and create checkpoint
- [ ] Test adding presets via "+ New" button
- [ ] Test editing built-in presets in Quick Presets
- [ ] Test deleting presets from Quick Presets
- [ ] Test renaming presets in Quick Presets
- [ ] Verify Presets Management remains unchanged
- [ ] Verify Quick Presets persists across page reloads
- [ ] Create final checkpoint
