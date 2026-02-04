
# Add Series Page (Duplicate of Movies Page)

## Overview
Create a new "Series" page that mirrors the Movies page in layout and functionality, but only displays series content (TV shows with episodes/seasons). This involves:
1. Adding a new "series" mode to the app
2. Creating a SeriesContent component based on MoviesContent
3. Updating the header navigation to include the new mode
4. Filtering data to show only series content

## Architecture

The current mode structure uses `AppMode` type defined in ModeHeader:
```typescript
type AppMode = "movies" | "tv" | "games"
```

We need to add `"series"` as a fourth mode.

## Changes Required

### 1. Update ModeHeader.tsx - Add Series Mode
**File:** `src/components/ModeHeader.tsx`

Update the `AppMode` type and modes array:
```typescript
export type AppMode = "movies" | "series" | "tv" | "games";

const modes = [
  { id: "movies" as AppMode, label: "Movies", color: "nipflix" },
  { id: "series" as AppMode, label: "Series", color: "nipflix" },  // NEW
  { id: "tv" as AppMode, label: "TV", color: "tv" },
  { id: "games" as AppMode, label: "Games", color: "retro" },
];
```

### 2. Create SeriesContent.tsx
**New File:** `src/components/content/SeriesContent.tsx`

Duplicate `MoviesContent.tsx` with modifications to filter only series:
- Change featured items filter: `item.type === 'series' && (item.isHot || item.isRecommended)`
- Create series-specific categories that only include series content
- Rename component to `SeriesContent`

Key filter logic:
```typescript
// Only series content
const seriesContent = watchContent.filter(item => item.type === 'series');

// Featured items - only hot/recommended series
const featuredItems = seriesContent.filter(
  (item) => item.isHot || item.isRecommended
);

// Categories for series
const seriesCategories = [
  { id: 'continue', title: 'Continue Watching', filter: (items) => items.filter(i => i.progress > 0) },
  { id: 'trending', title: 'Trending Series', filter: (items) => items.filter(i => i.isHot) },
  { id: 'recommended', title: 'Recommended For You', filter: (items) => items.filter(i => i.isRecommended) },
  { id: 'all-series', title: 'All Series', filter: (items) => items },
  // Genre-specific categories...
];
```

### 3. Update ModeSidebar.tsx - Add Series Sidebar Config
**File:** `src/components/ModeSidebar.tsx`

Add sidebar configuration for series mode (same as movies):
```typescript
const sidebarConfig: Record<AppMode, SidebarItem[]> = {
  movies: [
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "movies", icon: Film, label: "Movies" },
    { id: "series", icon: Tv, label: "Series" },
    { id: "cinema", icon: Clapperboard, label: "On Cinema" },
  ],
  series: [  // NEW - same structure as movies
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "drama", icon: Film, label: "Drama" },
    { id: "comedy", icon: Tv, label: "Comedy" },
    { id: "scifi", icon: Clapperboard, label: "Sci-Fi" },
  ],
  tv: [...],
  games: [],
};

const modeColors: Record<AppMode, string> = {
  movies: "nipflix",
  series: "nipflix",  // Same color as movies
  tv: "tv",
  games: "retro",
};
```

### 4. Update UnifiedHome.tsx - Render SeriesContent
**File:** `src/components/UnifiedHome.tsx`

- Import SeriesContent
- Add accent color for series mode
- Render SeriesContent when mode is "series"

```typescript
import SeriesContent from "./content/SeriesContent";

const modeAccentColors: Record<AppMode, string> = {
  movies: "--nipflix",
  series: "--nipflix",  // Same as movies
  tv: "--tv",
  games: "--retro",
};

// In render:
{mode === "series" && (
  <SeriesContent activeSection={activeNavItem} />
)}
```

### 5. Update FocusContext.tsx - Support Series Mode
**File:** `src/contexts/FocusContext.tsx`

Update the AppMode import/type if needed, ensuring the focus provider works with the new mode.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/ModeHeader.tsx` | Modify | Add "series" to AppMode type and modes array |
| `src/components/content/SeriesContent.tsx` | Create | Duplicate of MoviesContent filtered for series |
| `src/components/ModeSidebar.tsx` | Modify | Add series sidebar config and color |
| `src/components/UnifiedHome.tsx` | Modify | Import and render SeriesContent |
| `src/contexts/FocusContext.tsx` | Modify | Ensure AppMode type supports series (if imported there) |

## Visual Result

Header will show: **Movies** | **Series** | **TV** | **Games**

When "Series" is selected:
- Same Netflix-style hero with featured series
- Rows of series content only (no movies)
- Categories like "Trending Series", "Drama Series", "Comedy Series"
- Same keyboard navigation as Movies page

## Data Filtering

From the existing `watchContent` data, these items are series:
- Breaking Bad
- Stranger Things  
- The Office
- Game of Thrones
- The Mandalorian

The SeriesContent will filter to only show these items, organized into relevant categories.
