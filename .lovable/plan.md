
# Grid View for Categories with Infinite Scroll

## Overview

Two updates are needed:
1. **Hide subcategory dots in collapsed sidebar** - Remove the visual clutter of dots when the sidebar is minimized
2. **Grid layout for category views** - Replace horizontal rows with a scrollable grid when viewing Popular, On Cinema, or genre categories (same for Series)

## Changes

### 1. Remove Dots in Collapsed Sidebar

**File**: `src/components/ModeSidebar.tsx`

Current behavior: When the sidebar is collapsed, genre items show small dots as placeholders for icons.

Fix: Simply hide genre sub-items entirely when the sidebar is collapsed, or return `null` instead of rendering the dot.

The change is in the `renderItem` function around lines 225-238 - when `!isExpanded` and the item is a child (genre), don't render it at all.

### 2. Create ContentGrid Component

**New File**: `src/components/watch/ContentGrid.tsx`

A new grid component that displays items in a responsive grid layout instead of horizontal rows:
- Responsive grid: 2-6 columns based on screen width
- Displays poster images with title overlay on hover/focus
- Supports keyboard navigation (arrow keys navigate the grid)
- Accepts items array and handles item selection

### 3. Add Infinite Scroll Hook

**New File**: `src/hooks/useInfiniteContent.ts`

Create React Query infinite query hooks for pagination:
- `useInfiniteMoviesByGenre(genreId)` - Fetches movies by genre with pagination
- `useInfinitePopularMovies()` - Fetches popular movies with pagination  
- `useInfiniteNowPlayingMovies()` - Fetches now playing movies with pagination
- Similar hooks for series

Uses `useInfiniteQuery` from TanStack Query to:
- Track current page
- Fetch next page when requested
- Merge results from all pages

### 4. Update MoviesContent Component

**File**: `src/components/content/MoviesContent.tsx`

Logic changes:
- Detect if viewing a "grid view section" (popular, cinema, or any genre)
- For grid views:
  - Replace `visibleCategories` with flat item array
  - Use the new ContentGrid component
  - Implement scroll detection to load more pages
  - Update keyboard navigation for 2D grid (calculate row/col based on grid columns)
- For home view: Keep existing horizontal row layout

### 5. Update SeriesContent Component

**File**: `src/components/content/SeriesContent.tsx`

Same changes as MoviesContent but for series:
- Grid view for: popular, on-air, and genre categories
- Home view keeps horizontal rows

## Technical Details

**Grid Navigation Logic**:
```text
Grid with 5 columns:
+---+---+---+---+---+
| 0 | 1 | 2 | 3 | 4 |  <- Row 0
+---+---+---+---+---+
| 5 | 6 | 7 | 8 | 9 |  <- Row 1
+---+---+---+---+---+

Arrow Down from index 2 -> index 7 (2 + columns)
Arrow Up from index 7 -> index 2 (7 - columns)
Arrow Right from index 3 -> index 4
Arrow Left from index 5 -> focus sidebar
```

**Infinite Scroll Implementation**:
- Use Intersection Observer on a sentinel element at the bottom
- When sentinel is visible, call `fetchNextPage()`
- Show loading spinner while fetching
- Disable when `hasNextPage` is false

**View Mode Detection**:
```typescript
const isGridView = activeSection === "popular" 
  || activeSection === "cinema" 
  || activeSection === "on-air"
  || activeSection.startsWith("genre-");
```

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/ModeSidebar.tsx` | Modify | Hide genre items when sidebar collapsed |
| `src/components/watch/ContentGrid.tsx` | Create | Grid layout component with keyboard nav |
| `src/hooks/useInfiniteContent.ts` | Create | Infinite query hooks for pagination |
| `src/components/content/MoviesContent.tsx` | Modify | Switch to grid view for categories |
| `src/components/content/SeriesContent.tsx` | Modify | Switch to grid view for categories |

## User Experience

- **Home view**: Horizontal rows for browsing different categories (trending, popular, etc.)
- **Category view** (Popular, On Cinema, genres): Full-screen grid of content, scroll down to load more
- **Navigation**: Arrow keys work intuitively in both row and grid layouts
- **Sidebar**: Clean appearance when collapsed - only main menu items with icons visible
