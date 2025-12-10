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
