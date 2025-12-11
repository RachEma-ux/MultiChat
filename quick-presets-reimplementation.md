# Quick Presets Re-implementation Plan

## Goal
Re-implement Quick Presets enhancements with mobile-first approach to avoid keyboard popup issues.

## Phase 1: Create separate Quick Presets storage and utility functions
- [ ] Create `/home/ubuntu/multi-ai-chat/client/src/lib/quick-presets.ts`
- [ ] Define QuickPreset interface with sourceId, sourceType, name, models
- [ ] Implement localStorage functions: load, save, add, update, remove
- [ ] Implement initialization function to populate from built-in presets

## Phase 2: Create mobile-friendly Preset Selection Dialog
- [ ] Create `/home/ubuntu/multi-ai-chat/client/src/components/PresetSelectionDialog.tsx`
- [ ] Use Dialog component from shadcn/ui
- [ ] Add search input with **autoFocus={false}** and **readOnly initially**
- [ ] Show available presets (not already in Quick Presets)
- [ ] Multi-select with checkboxes
- [ ] "Add to Quick Presets" button at bottom

## Phase 3: Update PresetsPanel with Edit/Delete on all presets
- [ ] Update `/home/ubuntu/multi-ai-chat/client/src/components/PresetsPanel.tsx`
- [ ] Change props to accept QuickPreset[] instead of mixing built-in and custom
- [ ] Add Edit/Delete icons on ALL preset buttons
- [ ] Implement inline rename with controlled input (no auto-focus)
- [ ] Add "+ New" button in header

## Phase 4: Integrate all components
- [ ] Update `/home/ubuntu/multi-ai-chat/client/src/components/FloatingChatWindow.tsx`
- [ ] Replace customPresets state with quickPresets state
- [ ] Initialize quickPresets from localStorage
- [ ] Add handlers: handleAddQuickPresets, handleEditQuickPreset, handleDeleteQuickPreset, handleRenameQuickPreset
- [ ] Pass handlers to PresetsPanel
- [ ] Add PresetSelectionDialog component

## Phase 5: Test thoroughly on mobile
- [ ] Test "+ New" button - should NOT trigger keyboard
- [ ] Test Edit button - opens PresetEditorModal
- [ ] Test Delete button - shows confirmation dialog
- [ ] Test inline rename - only triggers keyboard when user clicks input
- [ ] Verify Quick Presets changes don't affect Presets Management
- [ ] Create final checkpoint

## Key Mobile-First Principles
1. **No auto-focus on any input fields**
2. **Use `readOnly` initially, remove on user interaction**
3. **Prevent default on button clicks that might trigger focus**
4. **Test on actual mobile device, not just desktop browser**
