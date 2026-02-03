
# Unified Streaming Interface Redesign

## Overview
Transform the app to launch directly into a unified main interface with three modes (Movies, TV, Games) accessible via top header tabs. The left sidebar will adapt dynamically based on the selected mode, and we'll remove all music-related content.

## New Architecture

```text
+------------------------------------------+
|  [Movies]  [TV]  [Games]      hafo  12:30|
+--------+---------------------------------+
|  SIDE  |                                 |
|  BAR   |    MAIN CONTENT AREA            |
|        |    (adapts per mode)            |
| Search |                                 |
| Home   |    [Featured Hero]              |
| ...    |                                 |
|        |    [Content Rows]               |
+--------+---------------------------------+
```

## Changes Summary

### 1. Remove Welcome/Profile System
- **File**: `src/pages/Index.tsx`
- Remove WelcomeScreen and ProfileSelection flow
- Launch directly into new unified home component
- Remove sessionStorage profile logic

### 2. Create New Unified Home Component
- **New File**: `src/components/UnifiedHome.tsx`
- Three-mode state: `movies` | `tv` | `games`
- Top header with mode toggle tabs (styled as premium pills)
- Dynamic sidebar that changes based on mode
- Content area that renders mode-specific content

### 3. Create Mode-Aware Sidebar
- **New File**: `src/components/ModeSidebar.tsx`
- Movies mode: Search, Home, Trending, Movies, Series, On Cinema
- TV mode: Search, Home, Favorites
- Games mode: No sidebar (hidden)
- Smooth transition animations between modes

### 4. Mode-Specific Content Areas
- **Movies Mode**: Reuse existing Watch page components (FeaturedHero, ContentRow, etc.)
- **TV Mode**: Embed the existing LiveTVHome content
- **Games Mode**: Show the Gaming page content (Retro/Steam buttons)

### 5. Cleanup
- Remove `src/components/WelcomeScreen.tsx` (no longer used)
- Remove `src/components/ProfileSelection.tsx` (no longer used)
- Update `src/components/HomeScreen.tsx` - remove music content from featured items
- Remove Spotify/music references from theme and components

### 6. Route Updates
- **File**: `src/App.tsx`
- Keep existing routes but they may become less used
- Main experience is now on `/`

---

## Technical Details

### Mode State Structure
```typescript
type AppMode = 'movies' | 'tv' | 'games';

// Sidebar items per mode
const sidebarConfig = {
  movies: [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'movies', icon: Film, label: 'Movies' },
    { id: 'series', icon: Tv, label: 'Series' },
    { id: 'cinema', icon: Clapperboard, label: 'On Cinema' },
  ],
  tv: [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
  ],
  games: [] // Empty = hidden sidebar
};
```

### Top Header Mode Tabs
- Three premium-styled pill buttons: Movies / TV / Games
- Active state with accent color glow
- Keyboard navigable (left/right arrows)
- hafo logo and time display remain on right side

### Accent Colors Per Mode
- Movies: `--nipflix` (red)
- TV: `--tv` (blue)
- Games: `--retro` (purple)

### Content Integration

**Movies Mode:**
- Use `watchContent` data from existing Watch page
- Display FeaturedHero with movie/series content
- ContentRows for categories (Trending, Continue Watching, etc.)

**TV Mode:**
- Show favorites section with channel cards
- "All Channels" quick access
- Player integration when channel selected

**Games Mode:**
- Show the two large buttons (Retro Games, Steam Link)
- No sidebar - full width content
- Keep existing navigation to `/retro` and `/steam`

---

## Files to Create
1. `src/components/UnifiedHome.tsx` - Main unified interface
2. `src/components/ModeSidebar.tsx` - Dynamic sidebar component
3. `src/components/ModeHeader.tsx` - Top header with mode tabs

## Files to Modify
1. `src/pages/Index.tsx` - Simplify to render UnifiedHome directly
2. `src/components/HomeScreen.tsx` - Remove music from featured content
3. `src/index.css` - Add any new transition animations

## Files to Delete (Optional)
- `src/components/WelcomeScreen.tsx`
- `src/components/ProfileSelection.tsx`
- `src/components/AppSidebar.tsx` (replaced by ModeSidebar)

---

## Keyboard Navigation
- **Tab/Arrow keys** between mode tabs in header
- **Arrow keys** navigate sidebar items
- **Enter** to select/activate
- **Escape** to close overlays
- Mode-specific shortcuts (e.g., 'S' for search in Movies mode)

## Visual Design Notes
- Dark theme maintained throughout
- Glassmorphism for sidebar and header elements
- Smooth 300ms transitions between modes
- Active mode tab has subtle glow matching mode's accent color
- Sidebar width: ~200px expanded, hidden in Games mode
- Content area adjusts padding based on sidebar presence
