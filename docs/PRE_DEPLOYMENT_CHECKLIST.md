# Pre-Deployment Checklist

**Multi-AI Chat Project - Quality Gate**

*Run through this checklist before every checkpoint to ensure responsiveness quality.*

---

## Quick Checklist (5-Minute Version)

Use this for minor changes:

- [ ] No console errors
- [ ] Works at 375px width (iPhone)
- [ ] All buttons/links clickable
- [ ] No horizontal scroll
- [ ] Modals/dropdowns open correctly

---

## Full Checklist (15-Minute Version)

Use this for new features or significant changes:

### 1. Visual Layout Testing

**Mobile (320px - 767px)**
- [ ] Content readable without zooming
- [ ] No horizontal scrollbar
- [ ] Text minimum 14px font size
- [ ] Adequate spacing between elements
- [ ] Images scale without distortion

**Tablet (768px - 1023px)**
- [ ] Layout transitions smoothly from mobile
- [ ] No awkward empty spaces
- [ ] Navigation remains usable

**Desktop (1024px+)**
- [ ] Content doesn't stretch too wide
- [ ] Proper use of available space
- [ ] No unnecessary scrolling

### 2. Interactive Elements

**Touch Targets**
- [ ] All buttons minimum 44×44px
- [ ] Adequate spacing between clickable items (8px+)
- [ ] No overlapping touch areas

**Buttons & Links**
- [ ] All have visible hover states
- [ ] All have visible focus states (keyboard)
- [ ] Disabled states are clear

**Forms**
- [ ] Input fields properly sized
- [ ] Labels visible and associated
- [ ] Error messages display correctly
- [ ] Keyboard doesn't cover inputs on mobile

### 3. Navigation & Menus

**Dropdowns**
- [ ] Open in correct direction (not off-screen)
- [ ] Close on outside click
- [ ] Close on outside touch
- [ ] Items have adequate height (44px+)

**Modals**
- [ ] Centered on all viewports
- [ ] Scrollable if content exceeds viewport
- [ ] Close button accessible
- [ ] Backdrop click closes modal
- [ ] Escape key closes modal

**Navigation Menus**
- [ ] All links functional
- [ ] Current page indicated
- [ ] Mobile menu opens/closes properly

### 4. Performance

**Loading**
- [ ] No visible layout shift on load
- [ ] Loading states for async content
- [ ] Images don't cause reflow

**Interactions**
- [ ] Button clicks respond immediately
- [ ] No lag on scroll
- [ ] Animations smooth (no jank)

**Memory**
- [ ] No console memory warnings
- [ ] Page doesn't slow down over time

### 5. Functionality

**Core Features**
- [ ] Primary user flow works end-to-end
- [ ] Data saves/loads correctly
- [ ] Error states handled gracefully

**Edge Cases**
- [ ] Empty states display properly
- [ ] Long text truncates or wraps correctly
- [ ] Special characters handled

### 6. Browser Console

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No failed network requests
- [ ] No deprecation warnings

---

## Testing Procedure

### Step 1: Desktop First Pass (2 min)
1. Open Chrome DevTools
2. Check console for errors
3. Click through main features
4. Verify basic functionality

### Step 2: Mobile Simulation (3 min)
1. Toggle device toolbar (Ctrl+Shift+M)
2. Select "iPhone 12 Pro" (390px)
3. Repeat main feature clicks
4. Check for touch target issues

### Step 3: Responsive Sweep (3 min)
1. Drag viewport from 320px to 1920px
2. Watch for layout breaks
3. Note any horizontal scroll
4. Check text readability at each size

### Step 4: Interaction Testing (3 min)
1. Test all dropdowns (open direction)
2. Test all modals (scroll, close)
3. Test form submissions
4. Test drag operations (if applicable)

### Step 5: Touch Device (if available) (2 min)
1. Open on actual phone/tablet
2. Test touch interactions
3. Verify no hover-dependent features
4. Check keyboard appearance on inputs

---

## Viewport Testing Matrix

| Width | Test Priority | Key Checks |
|-------|---------------|------------|
| 320px | Critical | Minimum viable layout |
| 375px | Critical | Most common phone |
| 414px | High | Large phones |
| 768px | High | Tablet breakpoint |
| 1024px | Medium | Laptop breakpoint |
| 1280px | Medium | Desktop |
| 1920px | Low | Large desktop |

---

## Common Failure Points

Check these areas first when issues arise:

| Component Type | Common Issue | Quick Fix |
|----------------|--------------|-----------|
| Dropdown | Opens off-screen | Check positioning logic |
| Modal | Behind other content | Verify z-index (should be 400) |
| Button | Not clickable on mobile | Check z-index, touch target size |
| Text | Invisible | Check color contrast, theme |
| Layout | Horizontal scroll | Find fixed-width element |
| Form | Keyboard covers input | Add scroll-into-view |

---

## Sign-Off

Before creating checkpoint:

```
Date: _______________
Tester: _______________

[ ] Quick checklist passed
[ ] Full checklist passed (if applicable)
[ ] All critical viewports tested
[ ] No blocking issues found

Notes:
_________________________________
_________________________________
```

---

## Issue Escalation

If you find an issue:

1. **Blocking** - Fix before checkpoint
   - App crashes
   - Core feature broken
   - Data loss possible

2. **High** - Fix before checkpoint if time permits
   - Feature partially broken
   - Poor UX on common viewport
   - Console errors

3. **Medium** - Document for next iteration
   - Minor visual issues
   - Edge case failures
   - Performance not optimal

4. **Low** - Add to backlog
   - Polish items
   - Nice-to-have improvements

---

*Use this checklist consistently to catch issues before they reach users.*
