
# Center Content Detail Modal and Fix Runtime Display

## Overview

Two fixes are needed:
1. Center the content detail popup modal vertically on the screen
2. Fix the runtime display - show formatted hours/minutes when available, hide when not available (0 or undefined)

## Current Issues

### Modal Positioning
The modal container uses `items-start` which aligns the modal to the top of the viewport. This causes it to appear at the top instead of vertically centered.

### Runtime Display
The TMDB list endpoints (popular, trending, etc.) don't include `runtime` data - only the detail endpoints do. The transformer sets `runtime: 0` as a placeholder for list items. This means most content shows "0m" in the metadata section.

## Implementation Details

### 1. Center the Modal (ContentDetail.tsx)

Change the outer container from:
```css
flex items-start justify-center pt-8 pb-8
```

To:
```css
flex items-center justify-center py-8
```

This centers the modal both horizontally and vertically within the viewport.

### 2. Conditional Runtime Display (ContentDetail.tsx)

In the metadata section, only render the runtime if it exists and is greater than 0:

**Current code:**
```tsx
<span className="text-muted-foreground">{formatRuntime(content.runtime)}</span>
```

**New code:**
```tsx
{content.runtime && content.runtime > 0 && (
  <span className="text-muted-foreground">{formatRuntime(content.runtime)}</span>
)}
```

Also update the progress bar section that references runtime - only show it when runtime exists:

**Current code (line 106-108):**
```tsx
<span className="text-sm text-muted-foreground">
  {Math.round((content.progress / 100) * content.runtime)}m of {formatRuntime(content.runtime)}
</span>
```

**New code:**
```tsx
{content.runtime && content.runtime > 0 && (
  <span className="text-sm text-muted-foreground">
    {Math.round((content.progress / 100) * content.runtime)}m of {formatRuntime(content.runtime)}
  </span>
)}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/watch/ContentDetail.tsx` | Center modal, conditionally render runtime |

## Visual Result

**Before:**
- Modal appears at top of screen with padding
- Shows "0m" for runtime on most content

**After:**
- Modal centered vertically and horizontally
- Runtime only appears when the data is available (e.g., for detailed content or locally-defined content with runtime values)
- Clean metadata row without empty/zero runtime values
