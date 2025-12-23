# Z-Index Audit Report

**Multi-AI Chat Project**

*Audit Date: December 2024*

---

## Standard Z-Index Scale

| Layer | Z-Index | Purpose |
|-------|---------|---------|
| Base | 0-10 | Normal content, relative positioning |
| Tooltip | 50 | Tooltips, small popovers |
| Sticky | 100 | Sticky headers, navigation |
| Dropdown | 200 | Dropdown menus, select popups |
| Modal Backdrop | 300 | Modal overlay backgrounds |
| Modal Content | 400 | Modal dialog content |
| Nested Modal | 450 | Modals within modals |
| Toast | 500 | Notifications, alerts |
| Critical | 9999 | Emergency overlays only |

---

## Current State Analysis

### Components Using Correct Z-Index

| Component | Current Z-Index | Status |
|-----------|-----------------|--------|
| FloatingChatWindow | z-[200] | ✅ Correct (floating element) |
| AnalyticsPanel | z-[400] | ✅ Correct (modal) |
| RenameChatDialog | z-[400] | ✅ Correct (modal) |
| KeyboardShortcutsHelp | z-[400] | ✅ Correct (modal) |
| SavedConversationsModal | z-[400] | ✅ Correct (modal) |
| PresetSelectionDialog | z-[400] | ✅ Correct (modal) |
| ConnectorsStore | z-[400] | ✅ Correct (modal) |
| PresetStatsDashboard | z-[400] | ✅ Correct (modal) |
| CustomCategoryModal | z-[400] | ✅ Correct (modal) |
| CategoriesSettingsModal | z-[400] | ✅ Correct (modal) |
| WindowDock | z-[230] | ✅ Correct (above dropdowns, below modals) |
| dialog.tsx (UI) | z-[400]/z-[410] | ✅ Correct |
| PresetsManagementModal | z-[400] | ✅ Correct (modal) |
| PresetEditorModal | z-[400]/z-[410] | ✅ Correct |
| WindowLayoutPresets | z-[400]/z-[410] | ✅ Correct |
| PresetTemplatesModal | z-[400] | ✅ Correct |
| Delete confirmation dialogs | z-[450] | ✅ Correct (nested modal) |

### Components Needing Adjustment

| Component | Current | Should Be | Issue |
|-----------|---------|-----------|-------|
| ChatFooter menu backdrop | z-[299] | z-[199] | Backdrop should be below dropdown |
| ChatFooter menu content | z-[300] | z-[200] | Should use dropdown level |
| SettingsMenu backdrop | z-[299] | z-[199] | Backdrop should be below dropdown |
| SettingsMenu content | z-[300] | z-[200] | Should use dropdown level |
| ModelSelector backdrop | z-[400] | z-[199] | Too high for dropdown backdrop |
| ModelSelector dropdown | z-[500] | z-[200] | Too high for dropdown |
| PresetsManagement dropdowns | z-[500] | z-[200] | Too high for dropdown |
| ModeMenu backdrop | z-40 | z-[199] | Using Tailwind default, inconsistent |
| ModeMenu content | z-50 | z-[200] | Using Tailwind default, inconsistent |
| Home.tsx menus | z-40/z-50 | z-[199]/z-[200] | Using Tailwind defaults |
| BulkOperationsBar menu | z-[300] | z-[200] | Should use dropdown level |
| PresetSortDropdown | z-[300] | z-[200] | Should use dropdown level |
| select.tsx (UI) | z-[500] | z-[200] | Too high for select |
| dropdown-menu.tsx (UI) | z-[300] | z-[200] | Should use dropdown level |

### UI Components (shadcn/ui) - Reference Only

These are base UI components that may need context-specific overrides:

| Component | Current | Notes |
|-----------|---------|-------|
| alert-dialog | z-50 | Default shadcn, OK for most uses |
| drawer | z-50 | Default shadcn |
| sheet | z-50 | Default shadcn |
| tooltip | z-50 | Correct for tooltips |
| popover | z-50 | May need override in modals |
| context-menu | z-50 | Default shadcn |
| hover-card | z-50 | Default shadcn |
| menubar | z-50 | Default shadcn |

---

## Fixes Applied

The following files have been updated to use the standard z-index scale:

### 1. ChatFooter.tsx
- Backdrop: z-[299] → z-[199]
- Menu content: z-[300] → z-[200]

### 2. SettingsMenu.tsx
- Backdrop: z-[299] → z-[199]
- Menu content: z-[300] → z-[200]

### 3. ModelSelector.tsx
- Backdrop: z-[400] → z-[199]
- Dropdown: z-[500] → z-[200]

### 4. PresetsManagementModal.tsx
- Dropdowns inside modal: z-[500] → z-[450] (higher than modal content)

### 5. ModeMenu.tsx
- Backdrop: z-40 → z-[199]
- Menu content: z-50 → z-[200]

### 6. BulkOperationsBar.tsx
- Menu: z-[300] → z-[200]

### 7. PresetSortDropdown.tsx
- Dropdown: z-[300] → z-[200]

### 8. UI Components
- dropdown-menu.tsx: z-[300] → z-[200]
- select.tsx: z-[500] → z-[200]

---

## Special Cases

### Dropdowns Inside Modals

When a dropdown appears inside a modal (z-[400]), the dropdown needs to be higher:
- Modal content: z-[400]
- Dropdown backdrop inside modal: z-[449]
- Dropdown content inside modal: z-[450]

### Nested Modals

When a modal opens another modal:
- First modal: z-[400]
- Second modal backdrop: z-[449]
- Second modal content: z-[450]

---

## Recommendations

1. **Import Z_INDEX constants** from `useResponsive.ts` instead of hardcoding values
2. **Use relative z-index** for elements within a stacking context
3. **Document any exceptions** in component comments
4. **Test layering** on mobile where touch interactions are more sensitive

---

*This audit should be re-run after major UI changes.*
