
# Fix Auto-Scroll When New Movies Load

## Problem

When new movies are loaded via infinite scroll, the page automatically scrolls the user downward. This happens because the `useEffect` in `ContentGrid.tsx` that scrolls the focused item into view fires whenever the component re-renders, not just when the user explicitly changes focus.

## Root Cause

In `ContentGrid.tsx`, this effect triggers scroll on every render where the grid is active:

```tsx
useEffect(() => {
  if (!isActive || focusedIndex < 0) return;
  // ... scrolls to focused item
}, [focusedIndex, isActive]);
```

When infinite scroll adds new items, the grid re-renders and this effect fires, scrolling to the focused item even though the user didn't navigate.

## Solution

Track whether the focus change was triggered by user interaction (keyboard/mouse) vs component re-render. Only scroll when focus was explicitly changed by the user.

**Approach**: Use a ref to track if the focus change was intentional

## Implementation Details

### File: `src/components/watch/ContentGrid.tsx`

1. **Add a ref to track user-initiated focus changes**:
   ```tsx
   const userInitiatedFocus = useRef(false);
   ```

2. **Update the scroll effect to check the ref**:
   ```tsx
   useEffect(() => {
     if (!isActive || focusedIndex < 0) return;
     if (!userInitiatedFocus.current) return; // Skip if not user-initiated
     
     userInitiatedFocus.current = false; // Reset after scrolling
     
     const grid = gridRef.current;
     if (!grid) return;

     const focusedElement = grid.children[focusedIndex] as HTMLElement;
     if (focusedElement) {
       focusedElement.scrollIntoView({
         behavior: "smooth",
         block: "center",
       });
     }
   }, [focusedIndex, isActive]);
   ```

3. **Set the ref when user interacts**:
   - In `handleMouseEnter`: Set `userInitiatedFocus.current = true` before calling `onFocusChange`
   - In `handleItemClick`: Set `userInitiatedFocus.current = true` before calling `onFocusChange`

4. **Parent keyboard navigation needs similar flag**:
   - Update `MoviesContent.tsx` and `SeriesContent.tsx` grid keyboard navigation to pass a signal that focus was user-initiated
   - Alternatively, modify `onFocusChange` to accept a second parameter indicating user intent

### Alternative (Simpler) Approach

Instead of prop drilling, track the previous `focusedIndex` and only scroll when it actually changes:

```tsx
const prevFocusIndex = useRef(focusedIndex);

useEffect(() => {
  if (!isActive || focusedIndex < 0) return;
  
  // Only scroll if focusedIndex actually changed
  if (prevFocusIndex.current === focusedIndex) return;
  prevFocusIndex.current = focusedIndex;
  
  const grid = gridRef.current;
  if (!grid) return;

  const focusedElement = grid.children[focusedIndex] as HTMLElement;
  if (focusedElement) {
    focusedElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [focusedIndex, isActive]);
```

This simpler approach works because:
- When the user navigates, `focusedIndex` changes → scrolls
- When infinite scroll loads more items, `focusedIndex` stays the same → no scroll

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/watch/ContentGrid.tsx` | Add `prevFocusIndex` ref, update scroll effect to only fire when focus actually changes |

## Visual Result

**Before:**
- Scroll to bottom of page
- New movies load (infinite scroll)
- Page jerks back to wherever the focused item is

**After:**
- Scroll to bottom of page
- New movies load smoothly
- Page stays exactly where you are
- Only scrolls when you press arrow keys to navigate
