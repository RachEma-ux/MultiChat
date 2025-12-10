# Multi-AI Chat - Knowledge Base

## Version History

### FloatingChatWindowBackup (Version: 8df1b42d)
**Date:** December 10, 2025  
**Git Tag:** `FloatingChatWindowBackup`  
**Checkpoint ID:** `8df1b42d`

#### Description
Backup version with fully functional floating chat windows and complete footer control implementation matching ChatPage version 680189c.

#### Key Features Implemented

**1. Floating Chat Windows**
- Draggable windows with smooth positioning
- Window controls: Pin, Minimize, Maximize, Close
- Multiple window support with unique IDs
- Empty state with conversation starter prompt

**2. Footer Controls (ChatFooter.tsx)**
All controls match the behavior documented from ChatPage 680189c:

- **Hamburger Menu (☰)** - 6 actions:
  - New Chat
  - Rename Chat
  - Save Chat
  - Clear Chat
  - Show Analytics
  - Delete Chat (red text)

- **Plus Button (+)** - Calls `onNewChat` handler

- **Models Button** - Shows "X Models" count, opens ModelSelector panel

- **Synthesizer Button (✨)** - Conditionally rendered (only shows when models selected)

- **Settings Button (⚙️)** - Opens settings menu with 3 options:
  - Theme (placeholder toast)
  - Language (placeholder toast)
  - Export Data (functional)

- **Save Button (💾)** - Disabled when no messages exist

- **Presets Button** - Opens PresetsPanel with 5 quick presets:
  - Coding Team
  - Creative Writers
  - Research Squad
  - General Purpose
  - Fast Responders

- **Paperclip Button (📎)** - File attachment (functional with file input)

- **Message Input** - Textarea with placeholder text

**3. Reusable Components**
- `ModelSelector.tsx` - Provider/model selection with color indicators
- `PresetsPanel.tsx` - Quick preset application
- `SettingsMenu.tsx` - Settings options (integrated into ChatFooter)
- `ChatFooter.tsx` - Complete footer with all controls

**4. Z-Index Fixes**
- All dropdowns and menus use `z-[9999]` to appear above floating windows
- Backdrop overlays use `z-[9998]`
- Select components (provider/model dropdowns) use `z-[9999]`

**5. Shared Constants**
- `ai-providers.ts` - AI_PROVIDERS array with 10 providers and their models
- MODEL_PRESETS with 5 preset configurations

#### Technical Details

**File Structure:**
```
client/src/
├── components/
│   ├── FloatingChatWindow.tsx
│   ├── ChatFooter.tsx
│   ├── ModelSelector.tsx
│   ├── PresetsPanel.tsx
│   └── ui/ (shadcn components)
├── lib/
│   └── ai-providers.ts
└── pages/
    └── Home.tsx
```

**State Management:**
- Local state for window position, size, and visibility
- Models selection state in FloatingChatWindow
- Panel visibility states (showModelSelector, showPresets)
- Menu visibility states (showFooterMenu, showSettings)

**Styling:**
- Tailwind CSS with dark theme
- Provider color indicators (orange, green, blue, purple, etc.)
- Consistent spacing and typography
- Hover states and transitions

#### Known Issues / Limitations
1. Message sending not yet implemented (placeholder textarea)
2. Conversation persistence not implemented (no localStorage)
3. Rename Chat, Clear Chat, Show Analytics are placeholder toasts
4. Theme and Language settings are placeholders
5. Synthesizer functionality not implemented
6. No actual AI integration yet

#### Reference Documentation
- Footer controls behavior documented in `/home/ubuntu/chat_footer_components_final.md`
- Original ChatPage version: `680189c`
- Starting checkpoint: `938303fc`

#### Next Steps (Recommended)
1. Implement message sending and display functionality
2. Add localStorage persistence for conversations
3. Implement functional handlers for Rename, Clear, Analytics
4. Add actual AI integration for message responses
5. Implement Synthesizer functionality
6. Add keyboard shortcuts (Ctrl+Enter to send, Esc to close)

---

## Development Guidelines

### Footer Control Behavior Pattern
When adding new footer controls, follow this pattern:
1. Add state for visibility/data in parent component
2. Pass handler functions as props to ChatFooter
3. Use z-[9999] for dropdowns/menus to appear above windows
4. Add backdrop overlay with z-[9998] for click-outside-to-close
5. Include proper disabled states and conditional rendering

### Component Communication
- Parent (FloatingChatWindow) manages all state
- Child components (ChatFooter, ModelSelector, PresetsPanel) receive props
- Handlers passed down to update parent state
- No prop drilling beyond 2 levels

### Styling Conventions
- Use Tailwind utility classes
- Provider colors defined in getProviderColor() function
- Consistent button sizes: 28×28px for controls, 40×40px for message row
- Shadow: shadow-2xl for dropdowns/menus
- Border: border-border for consistent borders
- Rounded: rounded-lg for cards/panels

---

## Troubleshooting

### Dropdown appears behind window
- Check z-index: dropdowns need `z-[9999]`
- Backdrop needs `z-[9998]`
- Select components in `ui/select.tsx` need `z-[9999]`

### Menu doesn't close when clicking outside
- Ensure backdrop div with `fixed inset-0` exists
- Backdrop needs onClick handler to close menu
- Check z-index of backdrop is lower than menu

### Button not responding
- Check if handler function is passed as prop
- Verify handler is called in onClick
- Check for disabled state preventing clicks

---

*Last Updated: December 10, 2025*
