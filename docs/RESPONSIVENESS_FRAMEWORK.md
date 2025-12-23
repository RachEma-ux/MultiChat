# Responsiveness Framework

This document describes the complete responsiveness framework for the Multi-AI Chat application, including the centralized z-index management system, responsive design utilities, and component templates.

## Table of Contents

1. [Z-Index Management System](#z-index-management-system)
2. [Responsive Design Utilities](#responsive-design-utilities)
3. [Component Templates](#component-templates)
4. [ESLint Rules](#eslint-rules)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Z-Index Management System

### Why Centralized Z-Index?

Without a centralized system, z-index values become scattered across components, leading to overlapping elements, dropdowns appearing behind modals, tooltips hidden by other elements, and difficult debugging of layering issues.

### The Z-Index Scale

All z-index values are defined in `/client/src/lib/z-index.ts`:

| Layer | Value | Use Case |
|-------|-------|----------|
| `BELOW` | -1 | Background elements, decorations |
| `BASE` | 0 | Normal document flow |
| `ABOVE` | 50 | Elements slightly above normal flow |
| `ELEVATED` | 100 | Cards with elevation, raised elements |
| `STICKY` | 150 | Sticky headers, floating action buttons |
| `FLOATING` | 200 | Floating windows, chat windows |
| `DROPDOWN` | 250 | Dropdown menus, select menus |
| `POPOVER` | 300 | Popovers, tooltips |
| `MODAL_BACKDROP` | 350 | Dark backdrop behind modals |
| `MODAL` | 400 | Modal dialogs, full-screen overlays |
| `NESTED_MODAL` | 450 | Modals inside modals, confirmation dialogs |
| `TOAST` | 500 | Toast notifications, snackbars |
| `CRITICAL` | 9999 | System-level overlays, loading screens |

### How to Use

#### Option 1: Z_CLASS Constants (Recommended)

```tsx
import { Z_CLASS } from '@/lib/z-index';

<div className={`fixed inset-0 ${Z_CLASS.MODAL_BACKDROP}`}>
  <div className={`bg-card rounded-lg ${Z_CLASS.MODAL}`}>
    Modal content
  </div>
</div>
```

#### Option 2: Z_INDEX Values

```tsx
import { Z_INDEX } from '@/lib/z-index';

<div className={`z-[${Z_INDEX.MODAL}]`}>
  Modal content
</div>
```

#### Option 3: Inline Styles

```tsx
import { getZIndexStyle } from '@/lib/z-index';

<div style={getZIndexStyle('MODAL')}>
  Modal content
</div>
```

### Component-Specific Mappings

The `COMPONENT_Z_INDEX` object provides recommended z-index layers for common component types:

```tsx
import { COMPONENT_Z_INDEX } from '@/lib/z-index';

const modalZ = COMPONENT_Z_INDEX.modal; // 400
const dropdownZ = COMPONENT_Z_INDEX.dropdownMenu; // 250
const toastZ = COMPONENT_Z_INDEX.toast; // 500
```

---

## Responsive Design Utilities

### The useResponsive Hook

Located at `/client/src/hooks/useResponsive.ts`, this hook provides all responsive design utilities:

```tsx
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop,
    isAbove,
    isBelow,
    viewport,
    isTouch,
    isPortrait,
    isLandscape,
  } = useResponsive();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
      {isAbove('lg') && <Sidebar />}
      <p>Viewport: {viewport.width}x{viewport.height}</p>
    </div>
  );
}
```

### Breakpoints

The hook uses Tailwind CSS default breakpoints:

| Breakpoint | Width | Description |
|------------|-------|-------------|
| `sm` | 640px | Small devices (landscape phones) |
| `md` | 768px | Medium devices (tablets) |
| `lg` | 1024px | Large devices (desktops) |
| `xl` | 1280px | Extra large devices |
| `2xl` | 1536px | 2X large devices |

### Single Breakpoint Check

For better performance when you only need one check:

```tsx
import { useBreakpoint } from '@/hooks/useResponsive';

function MyComponent() {
  const isLargeScreen = useBreakpoint('lg', 'above');
  const isMobileOnly = useBreakpoint('md', 'below');
  
  return isLargeScreen ? <DesktopView /> : <MobileView />;
}
```

### Touch Handlers

For touch-friendly interactions:

```tsx
import { useTouchHandlers } from '@/hooks/useResponsive';

function MyButton() {
  const { handlers, isPressed } = useTouchHandlers({
    onPress: () => console.log('pressed'),
    onRelease: () => console.log('released'),
    onLongPress: () => console.log('long press'),
  });

  return (
    <button {...handlers} className={isPressed ? 'bg-blue-600' : 'bg-blue-500'}>
      Press me
    </button>
  );
}
```

---

## Component Templates

### Modal Template

Located at `/client/src/components/templates/ModalTemplate.tsx`:

```tsx
import { ModalTemplate } from '@/components/templates';

function MyModal({ isOpen, onClose }) {
  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="My Modal"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </>
      }
    >
      <p>Modal content goes here</p>
    </ModalTemplate>
  );
}
```

For nested modals (e.g., confirmation dialogs inside modals):

```tsx
<ModalTemplate
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Confirm Delete"
  isNested={true}
  maxWidth="sm"
>
  <p>Are you sure?</p>
</ModalTemplate>
```

### Dropdown Template

Located at `/client/src/components/templates/DropdownTemplate.tsx`:

```tsx
import { DropdownTemplate } from '@/components/templates';

function MyDropdown() {
  return (
    <DropdownTemplate
      trigger={<Button>Options</Button>}
      items={[
        { id: 'edit', label: 'Edit', onClick: handleEdit },
        { id: 'delete', label: 'Delete', onClick: handleDelete },
      ]}
      align="left"
    />
  );
}
```

For dropdowns inside modals:

```tsx
<DropdownTemplate
  trigger={<Button>Select</Button>}
  items={options}
  inModal={true}
/>
```

---

## ESLint Rules

The project includes ESLint rules to catch arbitrary z-index usage.

### What Gets Flagged

1. Arbitrary z-index values: `z-[999]`, `z-[50]`, etc.
2. Numeric z-index classes: `z-50`, `z-100`, etc.
3. Inline zIndex styles: `style={{ zIndex: 999 }}`

### Running the Lint Check

```bash
# Standard lint check (warnings)
pnpm lint

# Strict z-index check (errors)
pnpm lint:z-index
```

### Fixing Violations

Replace arbitrary values with centralized constants:

```tsx
// ❌ Bad
<div className="z-[999]">...</div>
<div className="z-50">...</div>
<div style={{ zIndex: 100 }}>...</div>

// ✅ Good
import { Z_CLASS, getZIndexStyle } from '@/lib/z-index';

<div className={Z_CLASS.MODAL}>...</div>
<div className={Z_CLASS.ABOVE}>...</div>
<div style={getZIndexStyle('ELEVATED')}>...</div>
```

---

## Best Practices

### 1. Always Use the Centralized System

Never use arbitrary z-index values. Always import from `@/lib/z-index`.

### 2. Choose the Right Layer

| Component Type | Layer to Use |
|----------------|--------------|
| Floating windows | `FLOATING` (200) |
| Dropdowns/Selects | `DROPDOWN` (250) |
| Tooltips/Popovers | `POPOVER` (300) |
| Modals | `MODAL` (400) with `MODAL_BACKDROP` (350) |
| Nested modals | `NESTED_MODAL` (450) |
| Toasts | `TOAST` (500) |

### 3. Test Layering

When adding new components, test that they layer correctly by opening a floating window, then a dropdown inside it, then a modal, then a nested confirmation dialog, and verify toasts appear above everything.

### 4. Document New Layers

If you need a new z-index layer, add it to `z-index.ts` with documentation explaining its purpose.

### 5. Use Templates for New Components

When creating new modals or dropdowns, start with the templates in `/client/src/components/templates/`.

---

## Anti-Patterns (Common Mistakes)

This section documents common mistakes that can cause bugs. Learn from these to avoid repeating them.

### 1. Template Literal Inside Regular String (CRITICAL)

**The Bug:**
```tsx
// ❌ BROKEN - Template literal syntax inside a regular string
className="z-[${Z_INDEX.MODAL}]"

// This literally renders as: class="z-[${Z_INDEX.MODAL}]"
// The ${} is NOT interpolated because it's not a template literal!
```

**The Fix:**
```tsx
// ✅ CORRECT - Use Z_CLASS constants (RECOMMENDED)
className={Z_CLASS.MODAL}

// ✅ CORRECT - Use template literal (backticks) if you must interpolate
className={`z-[${Z_INDEX.MODAL}]`}
```

**Why This Matters:**
- The broken code applies a literal CSS class `z-[${Z_INDEX.MODAL}]` which is invalid
- Tailwind doesn't recognize it, so no z-index is applied
- This can cause React Error #185 (Maximum update depth exceeded) when used with Radix UI components
- The dropdown/modal positioning logic fails, causing infinite re-renders

**Prevention:**
- Always use `Z_CLASS.*` constants for className props
- Never use `Z_INDEX.*` directly in className strings
- The `Z_INDEX` export is deprecated - use `Z_VALUES` for numeric access

### 2. setState During Render Phase

**The Bug:**
```tsx
// ❌ BROKEN - Calling parent's setState during render
function ChildComponent({ onTitleChange }) {
  const title = computeTitle();
  onTitleChange(title); // This calls parent's setState during render!
  return <div>{title}</div>;
}
```

**The Fix:**
```tsx
// ✅ CORRECT - Use useEffect to notify parent after render
function ChildComponent({ onTitleChange }) {
  const title = computeTitle();
  const prevTitleRef = useRef(title);
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    // Skip first render to avoid calling during initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (prevTitleRef.current !== title) {
      prevTitleRef.current = title;
      onTitleChange(title);
    }
  }, [title, onTitleChange]);
  
  return <div>{title}</div>;
}
```

**Why This Matters:**
- React Error: "Cannot update a component while rendering a different component"
- Can cause infinite render loops
- Breaks React's rendering model

### 3. Unstable References in useEffect Dependencies

**The Bug:**
```tsx
// ❌ BROKEN - context.version changes on every render
const context = useContext(ZIndexContext);
useEffect(() => {
  // This runs on every render because context.version is always new
  doSomething();
}, [context?.version]);
```

**The Fix:**
```tsx
// ✅ CORRECT - Use stable references or callbacks
const { getZIndex } = useContext(ZIndexContext);
// getZIndex is a stable callback that doesn't change
```

### 4. forceUpdate Anti-Pattern

**The Bug:**
```tsx
// ❌ BROKEN - Using forceUpdate to trigger re-renders
const [, forceUpdate] = useState({});
useEffect(() => {
  forceUpdate({}); // Creates new object, triggers re-render
}, [someDependency]);
```

**The Fix:**
```tsx
// ✅ CORRECT - Use proper state management
const [state, setState] = useState(initialState);
// Update state meaningfully instead of forcing re-renders
```

---

## Troubleshooting

### Element Hidden Behind Another

1. Check the z-index values of both elements
2. Verify they're using the centralized system
3. Ensure the correct layer is being used

### Dropdown Not Visible in Modal

Use `inModal={true}` prop or manually use `Z_CLASS.POPOVER` instead of `Z_CLASS.DROPDOWN`.

### Toast Hidden Behind Modal

Toasts should use `Z_CLASS.TOAST` (500), which is above modals (400).

### ESLint Warning on Valid Code

If you're using a z-index value correctly but getting a warning, ensure you're importing from the centralized system, not using arbitrary values.

---

## File Reference

| File | Purpose |
|------|---------|
| `/client/src/lib/z-index.ts` | Centralized z-index constants and utilities |
| `/client/src/hooks/useResponsive.ts` | Responsive design hook with z-index re-exports |
| `/client/src/components/templates/ModalTemplate.tsx` | Modal component template |
| `/client/src/components/templates/DropdownTemplate.tsx` | Dropdown component template |
| `/eslint.config.js` | ESLint rules including z-index checks |

---

## Migration Guide

If you're updating existing components to use the centralized system:

1. Import the z-index utilities:
   ```tsx
   import { Z_CLASS, Z_INDEX } from '@/lib/z-index';
   ```

2. Replace arbitrary values:
   ```tsx
   // Before
   className="z-[400]"
   
   // After
   className={Z_CLASS.MODAL}
   // or
   className={`z-[${Z_INDEX.MODAL}]`}
   ```

3. Run the lint check to find remaining issues:
   ```bash
   pnpm lint:z-index
   ```

4. Test the component to ensure correct layering.

---

## Visual Layer Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ z-9999  CRITICAL    │ System-level overlays, loading screens │
│ z-500   TOAST       │ Toast notifications, snackbars          │
│ z-450   NESTED_MODAL│ Modals inside modals                    │
│ z-400   MODAL       │ Modal dialogs, full-screen overlays     │
│ z-350   MODAL_BACKDROP │ Dark backdrop behind modals          │
│ z-300   POPOVER     │ Popovers, tooltips                      │
│ z-250   DROPDOWN    │ Dropdown menus, select menus            │
│ z-200   FLOATING    │ Floating windows, chat windows          │
│ z-150   STICKY      │ Sticky headers, floating action buttons │
│ z-100   ELEVATED    │ Cards with elevation, raised elements   │
│ z-50    ABOVE       │ Elements slightly above normal flow     │
│ z-0     BASE        │ Normal document flow                    │
│ z-(-1)  BELOW       │ Background elements, decorations        │
└─────────────────────────────────────────────────────────────┘
```

---

*Last Updated: December 2024*
