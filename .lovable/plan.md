

# UI Polish: Button Highlights, Content Row Overflow & Collapsible Sidebar

## Overview
Address three UI issues to improve the visual polish and usability of the app:
1. Add focus highlight to Play/Resume button in the hero section
2. Fix cropped selection outlines on content rows by using proper overflow handling
3. Make the sidebar minimized by default, expanding only when focused

## Issue 1: Play/Resume Button Highlight

**Current State:**
The FeaturedHero component already has focus highlight code (`ring-4 ring-nipflix scale-105`) on line 111, but it may not be visible enough or working correctly.

**Solution:**
Enhance the visual feedback on the focused Play/Resume button with:
- Stronger glow effect using box-shadow
- More prominent scale transform
- Ensure the ring is clearly visible against the button background

**File:** `src/components/watch/FeaturedHero.tsx`

**Changes:**
- Add a glowing shadow effect when focused
- Increase scale to 1.08 for more prominence
- Add text glow for better visibility

## Issue 2: Content Row Selection Outlines Getting Cropped

**Current State:**
In `ContentRow.tsx`, the container uses `overflow-x-auto` (line 50), but when items scale up with `scale-110` and add a `ring-4` outline, the ring gets cropped by the container's overflow boundaries.

**Problem Visualization:**
```text
Container with overflow-hidden/auto:
┌────────────────────────────────┐
│  [1] [2] [█3█] [4] [5]         │  ← Ring on [3] is cropped
│         ╔═══╗                  │     at top and bottom
│         ║   ║ (ring clipped)   │
└────────────────────────────────┘
```

**Solution:**
- Add padding to the scroll container to allow space for the scaled items and rings
- Use `overflow: visible` on the row wrapper with a parent that clips horizontally only
- Apply `z-index` to ensure focused items render above siblings

**File:** `src/components/watch/ContentRow.tsx`

**Changes:**
- Add vertical padding (`py-4`) to the scroll container to accommodate scale and ring
- Wrap in a container with `overflow-x-auto overflow-y-visible` or use clip-path
- Increase z-index on focused items

## Issue 3: Collapsible Sidebar (Minimized by Default)

**Current State:**
The sidebar is always expanded at 208px (`w-52`), taking up content space even when not in use.

**Desired Behavior:**
- Sidebar starts minimized (icons only, ~64px wide)
- When user navigates left (ArrowLeft from content), sidebar expands
- When user navigates right (ArrowRight from sidebar), sidebar collapses
- Show labels only when expanded
- Smooth transition animation

**Implementation:**

### FocusContext Changes
Add `isSidebarExpanded` state that:
- Defaults to `false` (collapsed)
- Becomes `true` when `activeZone === "sidebar"`
- Becomes `false` when navigating away from sidebar

### ModeSidebar Changes
- Accept `isExpanded` prop or derive from focus state
- Collapsed state: `w-16` with icons only centered
- Expanded state: `w-52` with icons + labels
- Animate width with CSS transition
- Show/hide labels based on expanded state
- Add hover effect to auto-expand on mouse hover

### UnifiedHome Changes
- Adjust content padding dynamically based on sidebar expansion state
- Collapsed: `pl-16`
- Expanded: `pl-52`

**Visual Design:**

```text
Collapsed (default):         Expanded (when focused):
┌────────┐                   ┌──────────────────────┐
│   🔍   │                   │   🔍   Search        │
│   🏠   │        →          │   🏠   Home          │
│   📈   │                   │   📈   Trending      │
│   🎬   │                   │   🎬   Movies        │
└────────┘                   └──────────────────────┘
   64px                              208px
```

## File Changes Summary

### `src/components/watch/FeaturedHero.tsx`
- Enhance button focus styles with stronger glow and scale

### `src/components/watch/ContentRow.tsx`
- Add vertical padding to scroll container for ring overflow
- Ensure proper z-index layering for focused items
- Adjust container overflow handling

### `src/contexts/FocusContext.tsx`
- Add `isSidebarExpanded` state
- Auto-expand when sidebar is focused
- Auto-collapse when leaving sidebar

### `src/components/ModeSidebar.tsx`
- Add collapsed/expanded visual states
- Animate width transition
- Show/hide labels based on state
- Add hover-to-expand behavior

### `src/components/UnifiedHome.tsx`
- Dynamic content padding based on sidebar expansion

## Technical Details

### Button Focus Enhancement
```tsx
// FeaturedHero.tsx - Play button
className={cn(
  'flex items-center gap-2 px-8 py-3 rounded-md font-semibold transition-all duration-200',
  'bg-foreground text-background hover:bg-foreground/90',
  isActive && focusedButton === 0 && 'scale-110 ring-4 ring-nipflix'
)}
style={{
  boxShadow: isActive && focusedButton === 0 
    ? '0 0 30px hsl(var(--nipflix) / 0.6), 0 0 60px hsl(var(--nipflix) / 0.3)'
    : undefined
}}
```

### Content Row Overflow Fix
```tsx
// ContentRow.tsx - Container structure
<div className="mb-8">
  <h2>...</h2>
  {/* Outer container clips X, allows Y overflow */}
  <div className="overflow-x-auto overflow-y-visible py-4 -my-4">
    <div className="flex gap-2 px-12 py-4">
      {/* Items with scale will have room to grow */}
    </div>
  </div>
</div>
```

### Sidebar Expansion Logic
```tsx
// In FocusContext
const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

useEffect(() => {
  setIsSidebarExpanded(activeZone === "sidebar");
}, [activeZone]);
```

