
# Add Categories to Movies and Series Sidebar

## Overview

Update the sidebar for Movies and Series modes to display categories with all genres permanently visible as sub-items. The sidebar structure will be reorganized and Categories will show genre options without icons, making them visually subordinated to the Categories header.

## Sidebar Structure Changes

**Movies Mode - New Sidebar:**
```text
+------------------------+
| [icon] Search          |
| [icon] Home            |
| [icon] Popular         |  <- renamed from Trending
| [icon] On Cinema       |
| [icon] Categories      |
|    Action              |  <- no icon, indented
|    Animation           |
|    Comedy              |
|    Documentary         |
|    Drama               |
|    Fantasy             |
|    Horror              |
|    Romance             |
|    Sci-Fi              |
|    Thriller            |
+------------------------+
```

**Series Mode - Same Pattern:**
- Search, Home, Popular, On Air, Categories
- Genre sub-items: Action & Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Mystery, Sci-Fi & Fantasy

## Implementation Steps

### 1. Update Sidebar Configuration (ModeSidebar.tsx)

- Change sidebar item structure to support nested items (categories as children)
- Rename "Trending" to "Popular" for both modes
- Remove Movies/Series/Drama/Comedy/Sci-Fi items and replace with Categories + genre children
- Add new interface for sidebar items with optional `children` property
- Render category items with different styling (no icons, smaller text, indented)

### 2. Update Sidebar Keyboard Navigation

- Handle navigating through category sub-items with arrow keys
- When entering Categories section, continue down through genre items
- Track both main item index and sub-item index for navigation
- Enter key on genre item selects that category

### 3. Add Genre-Filtered Content Support

**Add to tmdbService.ts:**
- New `discoverMovies(genreId)` endpoint function
- New `discoverSeries(genreId)` endpoint function

**Update Edge Function (tmdb/index.ts):**
- Add `discover-movies` endpoint with genre filter
- Add `discover-series` endpoint with genre filter
- These use TMDB's discover API: `/discover/movie?with_genres={id}`

**Add to useTMDB.ts:**
- `useMoviesByGenre(genreId)` hook
- `useSeriesByGenre(genreId)` hook

### 4. Update Content Components

**MoviesContent.tsx:**
- Accept `selectedGenre` prop (genre ID string like "action", "comedy")
- When a genre is selected, show filtered content for that genre
- Display genre-specific hero and content rows
- Map genre IDs: "action" -> 28, "comedy" -> 35, etc.

**SeriesContent.tsx:**
- Same pattern as MoviesContent for genre filtering

### 5. Wire Up Navigation Flow

**UnifiedHome.tsx:**
- Track selected genre alongside activeNavItem
- Pass genre to content components
- When a genre sub-item is selected from sidebar, update content view

## Technical Details

**Genre ID Mappings (from TMDB):**

Movies:
- Action: 28
- Animation: 16
- Comedy: 35
- Documentary: 99
- Drama: 18
- Fantasy: 14
- Horror: 27
- Romance: 10749
- Sci-Fi: 878
- Thriller: 53

Series:
- Action & Adventure: 10759
- Animation: 16
- Comedy: 35
- Crime: 80
- Documentary: 99
- Drama: 18
- Family: 10751
- Mystery: 9648
- Sci-Fi & Fantasy: 10765

**New Sidebar Item Interface:**
```typescript
interface SidebarItem {
  id: string;
  icon?: LucideIcon;  // optional - genres won't have icons
  label: string;
  isCategory?: boolean;  // marks Categories header
  children?: SidebarItem[];  // genre sub-items
}
```

**Visual Styling for Genre Items:**
- No icon
- Smaller font size (text-xs)
- Left indent (pl-8 when expanded, centered dot when collapsed)
- Slightly muted color until focused/active

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ModeSidebar.tsx` | New item structure, nested items rendering, keyboard nav for sub-items |
| `supabase/functions/tmdb/index.ts` | Add discover-movies and discover-series endpoints |
| `src/services/tmdbService.ts` | Add discoverMovies/discoverSeries functions |
| `src/hooks/useTMDB.ts` | Add useMoviesByGenre/useSeriesByGenre hooks |
| `src/components/content/MoviesContent.tsx` | Handle genre filtering, genre-specific view |
| `src/components/content/SeriesContent.tsx` | Handle genre filtering, genre-specific view |
| `src/components/UnifiedHome.tsx` | Track and pass selected genre to content |

## New File

| File | Purpose |
|------|---------|
| `src/data/genreConfig.ts` | Centralized genre definitions, ID mappings, and sidebar config |
