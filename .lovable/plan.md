
# Fix Navigation: ArrowUp Should Go Straight to Header

## Problem
Currently, pressing ArrowUp from the content area navigates to the sidebar before reaching the header. The user wants:
- **ArrowUp** = Move vertically (content rows → hero → header)
- **ArrowLeft** = The only way to reach the sidebar (from content's first column)

## Current Navigation Flow (Incorrect)
```
        Header
           ↑
      ┌────┴────┐
      ↓         ↓
   Sidebar ← Content
      ↑
    (stuck path via ArrowUp)
```

## Desired Navigation Flow
```
        Header
           ↑↓
         Content (hero + rows)
           ↑↓ within content
           
   Sidebar ← Content (ArrowLeft from col 0)
```

## Changes Required

### 1. MoviesContent.tsx
**Current (lines 107-117):**
```typescript
case "ArrowUp":
  if (row === -1) {
    focusSidebar();  // ← Goes to sidebar from hero
  } else if (row === 0) {
    setContentIndex({ row: -1, col: 0 }); // ← Goes to hero
  } else {
    setContentIndex({ row: row - 1, col });
  }
```

**New behavior:**
```typescript
case "ArrowUp":
  if (row === -1) {
    focusHeader();  // ← Go directly to header from hero
  } else if (row === 0) {
    setContentIndex({ row: -1, col: 0 }); // ← Go to hero
  } else {
    setContentIndex({ row: row - 1, col });
  }
```

### 2. TVContent.tsx
**For "All Channels" grid (lines 94-102):**
```typescript
case "ArrowUp":
  if (row === 0) {
    focusSidebar();  // ← Change to focusHeader()
  }
```

**For home channels single row (lines 137-139):**
```typescript
case "ArrowUp":
  focusSidebar();  // ← Change to focusHeader()
```

### 3. ModeHeader.tsx
**Current ArrowDown behavior (lines 91-98):**
```typescript
else if (e.key === "ArrowDown") {
  focusSidebar();
  if (activeZone === "header") {
    focusContent();  // This logic is confusing
  }
}
```

**New behavior:**
ArrowDown from header should go directly to content (not sidebar).

### 4. ModeSidebar.tsx
Keep current behavior - ArrowUp at top goes to header, ArrowRight goes to content. This is correct since you explicitly navigate to the sidebar via ArrowLeft.

## Updated Navigation Map

| From | Key | To |
|------|-----|-----|
| Content row 0 | ArrowUp | Hero (row -1) |
| Content hero | ArrowUp | Header |
| Content any col 0 | ArrowLeft | Sidebar |
| Header | ArrowDown | Content |
| Sidebar | ArrowUp (at top) | Header |
| Sidebar | ArrowRight | Content |

## Files to Modify

1. **`src/components/content/MoviesContent.tsx`**
   - Line 111: Change `focusSidebar()` to `focusHeader()`

2. **`src/components/content/TVContent.tsx`**
   - Line 96: Change `focusSidebar()` to `focusHeader()`
   - Line 139: Change `focusSidebar()` to `focusHeader()`

3. **`src/components/ModeHeader.tsx`**
   - Lines 91-98: Simplify ArrowDown to always go to `focusContent()`

## Visual Diagram After Fix

```
┌────────────────────────────────────────────┐
│              [Header Tabs]                 │  ← ArrowUp from hero lands here
│                 ↑   ↓                      │  ← ArrowDown goes to content
├────────────────┬───────────────────────────┤
│                │                           │
│   Sidebar      │      Content              │
│    ↑ ↓         │   ↑ ↓ (vertical nav)      │
│                │                           │
│       ←────────┤   (ArrowLeft from col 0)  │
│                │                           │
│   → ───────────→   (ArrowRight exits)      │
│                │                           │
└────────────────┴───────────────────────────┘
```

This creates a more intuitive TV remote experience where:
- Up/Down naturally moves through content vertically, all the way to the header
- Left brings up the sidebar menu when you're at the edge
- The sidebar is a "slide-out" menu, not part of the main vertical flow
