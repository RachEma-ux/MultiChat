# Past Issues & Solutions Log

**Multi-AI Chat Project - Lessons Learned**

*This document captures specific issues encountered during development and their solutions for future reference.*

---

## Issue Categories

| Category | Count | Impact Level |
|----------|-------|--------------|
| Dropdown/Menu Issues | 5 | High |
| Modal/Dialog Issues | 4 | High |
| Touch/Mobile Issues | 6 | Critical |
| Layout/Overflow Issues | 3 | Medium |
| Performance Issues | 4 | High |
| Z-Index Conflicts | 3 | Medium |

---

## Detailed Issue Log

### 1. Dropdown Menu Not Responding on Mobile

**Symptoms:**
- "+ New" button dropdown wouldn't open on published mobile version
- Click/tap events not registering

**Root Cause:**
- Z-index too low (`z-50`), causing the dropdown to render behind other elements
- Radix UI components have complex event handling that can conflict with touch events

**Solution:**
```tsx
// Changed from z-50 to z-[9999] in DropdownMenuContent
<DropdownMenuContent className="z-[9999]">
```

**Prevention:**
- Always use z-index scale from framework (dropdowns = `z-[200]` minimum)
- Test dropdowns on mobile immediately after implementation

---

### 2. Page Freeze When Opening Presets Panel

**Symptoms:**
- Entire page becomes unresponsive
- High CPU usage
- Occurs specifically on mobile devices

**Root Cause:**
- Infinite re-render loop caused by unstable object references in useEffect dependencies
- Heavy component re-rendering without memoization
- Radix Dialog components causing performance issues on mobile

**Solution:**
```tsx
// 1. Replaced Radix Dialog with custom modal
// 2. Added useMemo for expensive computations
const sortedPresets = useMemo(() => {
  return [...presets].sort((a, b) => /* sorting logic */);
}, [presets, sortOrder]);

// 3. Disabled expensive features by default
const [showRecommendations, setShowRecommendations] = useState(false);
```

**Prevention:**
- Always memoize computed values in render
- Avoid Radix components for frequently-opened panels on mobile
- Profile performance on mobile before shipping

---

### 3. Floating Window Snapping Back to Left Side

**Symptoms:**
- After dragging, window would snap back to left edge
- Only occurred on mobile/touch devices

**Root Cause:**
- Left edge snapping logic was too aggressive
- Touch end coordinates were being misinterpreted

**Solution:**
```tsx
// Removed left edge snapping entirely
// Only snap to right edge if explicitly near it
const handleDragEnd = () => {
  const snapThreshold = 50;
  if (position.x > window.innerWidth - width - snapThreshold) {
    // Snap to right only
  }
  // No left snapping
};
```

**Prevention:**
- Test drag operations on actual touch devices
- Be conservative with "helpful" auto-positioning features

---

### 4. Modal Opens Behind FloatingChatWindow

**Symptoms:**
- Dialog content not visible
- Backdrop visible but content hidden

**Root Cause:**
- FloatingChatWindow had higher z-index than modal
- Inconsistent z-index values across components

**Solution:**
```tsx
// Established z-index hierarchy:
// FloatingChatWindow: z-[50]
// Modal backdrop: z-[300]
// Modal content: z-[400]
```

**Prevention:**
- Follow z-index scale strictly
- Never use arbitrary z-index values

---

### 5. Sort Dropdown Menu Going Off-Screen

**Symptoms:**
- Dropdown opens to the left, extending beyond viewport
- Content cut off or invisible

**Root Cause:**
- Fixed positioning without viewport boundary checks
- Default "left-aligned" opening direction

**Solution:**
```tsx
// Dynamic positioning based on available space
const openDirection = useMemo(() => {
  const rect = triggerRef.current?.getBoundingClientRect();
  if (!rect) return 'left';
  return rect.left < 200 ? 'right' : 'left';
}, [isOpen]);
```

**Prevention:**
- Always calculate available space before positioning
- Default to opening toward screen center

---

### 6. Text Invisible Due to Theme Mismatch

**Symptoms:**
- Text appears to be missing
- Elements exist but content not visible

**Root Cause:**
- Using `bg-background` without corresponding `text-foreground`
- Theme CSS variables not matching ThemeProvider setting

**Solution:**
```tsx
// Always pair semantic background with foreground
<div className="bg-card text-card-foreground">
<div className="bg-popover text-popover-foreground">
<div className="bg-accent text-accent-foreground">
```

**Prevention:**
- Never use `bg-{semantic}` without `text-{semantic}-foreground`
- Verify theme setting matches CSS variables

---

### 7. Infinite Loading Loop in Queries

**Symptoms:**
- Continuous network requests
- Component keeps re-rendering

**Root Cause:**
- Creating new object/array references in render that are used as query inputs
- `new Date()` or array literals in query parameters

**Solution:**
```tsx
// Bad: Creates new reference every render
const { data } = trpc.items.getByDate.useQuery({ date: new Date() });

// Good: Stable reference
const [date] = useState(() => new Date());
const { data } = trpc.items.getByDate.useQuery({ date });
```

**Prevention:**
- Use `useState` or `useMemo` for query input objects
- Never create objects/arrays inline in query calls

---

### 8. Touch Events Not Registering on Custom Components

**Symptoms:**
- Buttons work on desktop but not mobile
- No response to taps

**Root Cause:**
- Missing touch event handlers
- Event propagation being stopped incorrectly
- Touch target too small

**Solution:**
```tsx
// Ensure both mouse and touch handlers
<button
  onClick={handleClick}
  onTouchEnd={(e) => {
    e.preventDefault(); // Prevent ghost click
    handleClick();
  }}
  className="min-h-[44px] min-w-[44px] p-3"
>
```

**Prevention:**
- Always test on actual touch devices
- Ensure minimum 44×44px touch targets
- Handle both click and touch events

---

### 9. Horizontal Scroll on Mobile

**Symptoms:**
- Page scrolls horizontally
- Content extends beyond viewport

**Root Cause:**
- Fixed-width elements exceeding viewport
- Padding/margin causing overflow

**Solution:**
```tsx
// Add to root container
<div className="overflow-x-hidden w-full max-w-full">

// Use responsive widths
<div className="w-full max-w-[calc(100vw-2rem)]">
```

**Prevention:**
- Always use `w-full` with `max-w-*` constraints
- Test at 320px width minimum
- Add `overflow-x-hidden` to main containers

---

### 10. Drag-and-Drop Not Working with Filters

**Symptoms:**
- Drag operations fail when list is filtered
- Items jump to wrong positions

**Root Cause:**
- Index-based drag handling doesn't account for filtered items
- Original array indices don't match displayed indices

**Solution:**
```tsx
// Use item IDs instead of indices
const handleDragEnd = (result) => {
  const { source, destination } = result;
  const sourceItem = filteredItems[source.index];
  const destItem = filteredItems[destination.index];
  
  // Find actual indices in unfiltered array
  const sourceIndex = items.findIndex(i => i.id === sourceItem.id);
  const destIndex = items.findIndex(i => i.id === destItem.id);
  
  // Reorder using actual indices
};
```

**Prevention:**
- Always use unique IDs for drag operations
- Never rely on array indices when filtering is possible

---

## Quick Diagnosis Guide

| Symptom | First Check | Second Check | Third Check |
|---------|-------------|--------------|-------------|
| Element not clickable | Z-index | Touch target size | Event handlers |
| Content not visible | Text color vs background | Z-index | Display property |
| Page freezing | useEffect dependencies | Memoization | Infinite loops |
| Layout broken on mobile | Viewport width | Overflow settings | Fixed widths |
| Dropdown off-screen | Positioning logic | Available space | Opening direction |
| Drag not working | Event handlers | Index vs ID | Touch events |

---

## Adding New Issues

When encountering a new issue, document it with:

1. **Symptoms** - What the user sees/experiences
2. **Root Cause** - Technical reason for the issue
3. **Solution** - Code changes that fixed it
4. **Prevention** - How to avoid this in future

---

*Last Updated: December 2024*
