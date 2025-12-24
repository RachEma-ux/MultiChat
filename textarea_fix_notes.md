# Textarea Auto-Grow Fix Notes

## Issue
The textarea in ChatControlBox is not auto-growing when multi-line text is entered.

## Root Cause
The `adjustTextareaHeight` function is using `requestAnimationFrame` internally, and then being called inside another `requestAnimationFrame` in the onChange handler. This creates a nested RAF situation that may not work correctly.

## ChatFooter Implementation (Working)
- Uses a simple `handleTextareaChange` that just calls `onInputChange`
- `adjustTextareaHeight` is called in a `useEffect` that watches `inputMessage`
- The `adjustTextareaHeight` function uses `requestAnimationFrame` internally

## ChatControlBox Implementation (Not Working)
- The onChange handler calls `setInputMessage` and then immediately calls `requestAnimationFrame(() => adjustTextareaHeight())`
- But `adjustTextareaHeight` already has `requestAnimationFrame` inside it
- This creates a nested RAF situation

## Fix
Remove the extra `requestAnimationFrame` wrapper in the onChange handler and just call `adjustTextareaHeight()` directly. The useEffect that watches `inputMessage` should handle the auto-grow.

Actually, looking more closely:
- ChatFooter: `handleTextareaChange` just calls `onInputChange`, and `adjustTextareaHeight` is called in a `useEffect` watching `inputMessage`
- ChatControlBox: The onChange handler calls `setInputMessage` and then `requestAnimationFrame(() => adjustTextareaHeight())`

The issue is that in ChatControlBox, we're calling `adjustTextareaHeight` before the state has actually updated. The `useEffect` should handle this, but we're also calling it in the onChange handler which may interfere.

Let me simplify the onChange handler to just call `setInputMessage` and let the `useEffect` handle the auto-grow.
