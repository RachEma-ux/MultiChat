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
