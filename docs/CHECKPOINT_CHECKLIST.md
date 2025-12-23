# Pre-Checkpoint Checklist

**Run this checklist before every `webdev_save_checkpoint` call.**

---

## Quick Checklist (5 minutes)

Use this for minor changes or bug fixes.

### Mobile Responsiveness
- [ ] Test on 375px width (iPhone SE)
- [ ] Test on 768px width (iPad)
- [ ] Verify touch targets are at least 44x44px
- [ ] Check that dropdowns/menus open correctly on mobile

### Visual Verification
- [ ] No text is invisible (check contrast)
- [ ] No elements overflow their containers
- [ ] Scrolling works smoothly
- [ ] Animations don't cause jank

### Functionality
- [ ] Primary user flow works end-to-end
- [ ] Error states display correctly
- [ ] Loading states are visible

---

## Full Checklist (15 minutes)

Use this for new features or major changes.

### Mobile-First Testing

| Viewport | Width | Test |
|----------|-------|------|
| Mobile S | 320px | [ ] Layout intact |
| Mobile M | 375px | [ ] Layout intact |
| Mobile L | 425px | [ ] Layout intact |
| Tablet | 768px | [ ] Layout intact |
| Laptop | 1024px | [ ] Layout intact |
| Desktop | 1440px | [ ] Layout intact |

### Touch Interactions
- [ ] All buttons have min 44x44px touch area
- [ ] Dropdown menus work with touch
- [ ] Modals can be closed by tapping backdrop
- [ ] Swipe gestures (if any) work correctly
- [ ] No hover-only interactions on mobile

### Z-Index Verification
- [ ] Dropdowns appear above content (z-200)
- [ ] Modals appear above dropdowns (z-400)
- [ ] Nested modals appear above parent (z-450)
- [ ] Toasts appear above everything (z-500)
- [ ] No z-index conflicts between layers

### Performance
- [ ] Page loads in < 3 seconds on 3G
- [ ] Scroll FPS stays at 60fps
- [ ] No layout shifts during load
- [ ] Images are optimized

### Accessibility
- [ ] Focus states are visible
- [ ] Tab order is logical
- [ ] Screen reader can navigate
- [ ] Color contrast meets WCAG AA

### Cross-Browser (if time permits)
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Common Failure Points

Quick reference for issues that frequently occur:

| Issue | Check | Fix Reference |
|-------|-------|---------------|
| Dropdown hidden behind modal | z-index | Use z-450 for dropdowns inside modals |
| Touch not working | Event handlers | Add both onClick and onTouchEnd |
| Text invisible | Theme mismatch | Pair bg-* with text-*-foreground |
| Menu won't close | Backdrop missing | Add fixed backdrop with onClick |
| Scroll locked | Body overflow | Remove overflow-hidden on close |
| Input zoom on iOS | Font size | Use min 16px font-size |

---

## How to Use

### Before Minor Changes
```
1. Make your code changes
2. Run Quick Checklist
3. Fix any issues found
4. Save checkpoint
```

### Before Major Changes
```
1. Make your code changes
2. Run Full Checklist
3. Document any known issues
4. Fix critical issues
5. Save checkpoint
```

### When Issues Are Found
```
1. Note the issue in todo.md
2. Fix immediately if < 5 minutes
3. Otherwise, document for next iteration
4. Never ship with broken mobile experience
```

---

## Automated Checks (Future)

These checks could be automated with scripts:

```bash
# Lighthouse mobile audit
pnpm lighthouse --mobile

# Bundle size check
pnpm build && du -sh dist/

# TypeScript errors
pnpm tsc --noEmit

# Lint check
pnpm lint
```

---

*Last updated: December 2024*
