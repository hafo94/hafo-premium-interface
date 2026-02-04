
# Fix Content Detail Modal Centering for TV Remote

## Problem

The current modal can grow taller than the screen (especially for series with episodes). The `overflow-y-auto` on the outer container allows mouse scrolling, but TV remotes cannot scroll the page. The modal needs to:
1. Always be centered on screen
2. Have a maximum height that fits within the viewport
3. Make internal content scrollable with keyboard navigation

## Solution

Restructure the modal to have a fixed maximum height with internal scrolling:

**Current structure:**
```text
fixed container (overflow-y-auto) -> centers modal
  modal (no height constraint) -> can grow infinitely
    hero image
    content sections
```

**New structure:**
```text
fixed container -> centers modal
  modal (max-h-[90vh], flex column)
    hero image (flex-shrink-0)
    scrollable content area (flex-1, overflow-y-auto)
```

## Implementation Details

### File: `src/components/watch/ContentDetail.tsx`

1. **Remove scroll from outer container**
   - Change: `overflow-y-auto` -> no overflow (just centering)
   
2. **Add height constraint to modal**
   - Add: `max-h-[90vh] flex flex-col` to the modal container
   
3. **Keep hero section fixed**
   - Add: `flex-shrink-0` to the hero backdrop section so it doesn't compress
   
4. **Make content section scrollable**
   - Add: `flex-1 overflow-y-auto` to the `p-6` content section
   - This allows the metadata, episodes, and "More Like This" to scroll independently

### Keyboard Navigation Enhancement

Add arrow up/down handling for scrolling the content area when focused:
- When focused on the content (not buttons), ArrowUp/Down scrolls the internal scroll area
- This enables TV remote users to navigate through episodes and related content

## Visual Result

```text
+----------------------------------+
|  [Backdrop Image - Fixed Size]  |
|  Title + Action Buttons          |
+----------------------------------+
|  Metadata / Plot                 |  <-- This area scrolls
|  Episodes (Season 1, 2...)       |      with arrow keys
|  More Like This                  |
+----------------------------------+
```

The modal will always be perfectly centered regardless of content length, and the internal scroll ensures all content is accessible via keyboard/remote.

## Technical Summary

| Change | Current | New |
|--------|---------|-----|
| Outer container | `overflow-y-auto` | No overflow |
| Modal | No height limit | `max-h-[90vh] flex flex-col` |
| Hero section | Default | `flex-shrink-0` |
| Content section | `p-6` | `p-6 flex-1 overflow-y-auto` |
