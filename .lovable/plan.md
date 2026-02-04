

# Enhanced Search Functionality

## Overview

Three changes needed to improve the search experience:

1. **Solid background** - Replace transparent/blurred background with a fully opaque solid background
2. **Permanently expanded sidebar** - The sidebar should remain expanded (not minimized) while search is open
3. **Actor/actress search** - Add the ability to search by person name and display their movies/series

## Visual Layout

The search interface will consist of:
- Left side: Permanently expanded sidebar (showing full labels + icons)
- Right side: Search area with solid background
  - Search input with on-screen keyboard
  - Results grid below

```text
+------------+----------------------------------------+
|            |  [Search Input]        [Close Button] |
|  SIDEBAR   +----------------------------------------+
|  (expanded)|                                        |
|            |  [On-Screen Keyboard]                  |
|  Search    |                                        |
|  Home      +----------------------------------------+
|  Popular   |                                        |
|  On Cinema |  Search Results                        |
|  Categories|  (Movies / Series / Person Results)    |
|    > Action|                                        |
|    > Comedy|  When person selected: Shows their     |
|    ...     |  filmography as grid                   |
+------------+----------------------------------------+
```

## Technical Changes

### 1. Solid Background (SearchOverlay.tsx)

**Current:**
```tsx
<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md ...">
```

**New:**
```tsx
<div className="fixed inset-0 z-50 bg-background ...">
```

Remove the `/95` opacity and `backdrop-blur-md` to make it fully solid.

### 2. Add Sidebar Expansion State (FocusContext.tsx)

Add a new state `isSearchMode` to the FocusContext that:
- Gets set to `true` when search opens
- Forces `isSidebarExpanded` to `true` regardless of active zone
- Gets set to `false` when search closes

**Changes:**
- Add `isSearchMode: boolean` to context value
- Add `setSearchMode: (value: boolean) => void` setter
- Modify `isSidebarExpanded` logic: `activeZone === "sidebar" || isSearchMode`

### 3. Adjust Search Overlay Layout (SearchOverlay.tsx)

Update the search overlay to:
- Account for the expanded sidebar width (`pl-52` or similar left padding)
- Remove the max-width constraint so it fills the remaining space
- Use the full right side of the screen

**Current structure:**
```tsx
<div className="h-full flex flex-col p-8 max-w-6xl mx-auto">
```

**New structure:**
```tsx
<div className="h-full flex flex-col p-8 ml-52">
```

### 4. Add Person Search to Edge Function (tmdb/index.ts)

Add two new TMDB endpoints:
- `search-person`: Search for actors/actresses by name
- `person-credits`: Get a person's movie and TV credits

```typescript
case "search-person":
  if (!query) {
    return error response
  }
  tmdbUrl = `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&page=${page}`;
  break;

case "person-credits":
  if (!id) {
    return error response
  }
  tmdbUrl = `${TMDB_BASE_URL}/person/${id}/combined_credits`;
  break;
```

### 5. Add Person Search to TMDB Service (tmdbService.ts)

Add new types and methods:

```typescript
export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: TMDBSearchResult[];
}

export interface TMDBPersonCredits {
  id: number;
  cast: (TMDBMovie | TMDBSeries)[];
  crew: (TMDBMovie | TMDBSeries)[];
}

// In tmdbService object:
searchPerson: async (query: string, page = 1) => {
  return callTMDB('search-person', { query, page: String(page) });
},

getPersonCredits: async (id: number) => {
  return callTMDB('person-credits', { id: String(id) });
},
```

### 6. Update useTMDB Hook (useTMDB.ts)

Add new hooks:

```typescript
export const useTMDBPersonSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search-person", query, page],
    queryFn: async () => {
      if (!query.trim()) return [];
      return tmdbService.searchPerson(query, page);
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
  });
};

export const usePersonCredits = (personId: number | undefined) => {
  return useQuery({
    queryKey: ["tmdb", "person-credits", personId],
    queryFn: async () => {
      if (!personId) throw new Error("Person ID required");
      return tmdbService.getPersonCredits(personId);
    },
    enabled: !!personId,
    staleTime: STALE_TIME,
  });
};
```

### 7. Enhance SearchOverlay Component (SearchOverlay.tsx)

Major UI/UX changes:

**State additions:**
- `searchType: 'content' | 'person'` - Toggle between searching titles or people
- `selectedPerson: TMDBPerson | null` - Currently selected person (to show their filmography)
- Use both `useTMDBSearch` and `useTMDBPersonSearch` hooks

**Layout:**
- Add a search type toggle: "Titles" vs "People" (keyboard navigable)
- When person is selected, display a "Back" button and person header with their filmography below
- Results grid shows:
  - For content search: movies and series matching query
  - For person search: list of actors/actresses matching query
  - After selecting person: their movie and TV credits as a grid

**Keyboard navigation:**
- Add new focus area for search type toggle
- Add focus area for person selection
- When viewing person's filmography, navigation works like current content results

### 8. Integrate Search Mode with Content Components

Both MoviesContent.tsx and SeriesContent.tsx need to:
- Import `setSearchMode` from `useFocus`
- Call `setSearchMode(true)` when `isSearchOpen` becomes true
- Call `setSearchMode(false)` when search closes

**Changes in useEffect:**
```typescript
const { setSearchMode } = useFocus();

useEffect(() => {
  setSearchMode(isSearchOpen);
}, [isSearchOpen, setSearchMode]);
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/FocusContext.tsx` | Add `isSearchMode` state and setter |
| `supabase/functions/tmdb/index.ts` | Add `search-person` and `person-credits` endpoints |
| `src/services/tmdbService.ts` | Add person types and API methods |
| `src/hooks/useTMDB.ts` | Add `useTMDBPersonSearch` and `usePersonCredits` hooks |
| `src/components/watch/SearchOverlay.tsx` | Solid background, sidebar offset, person search UI |
| `src/components/content/MoviesContent.tsx` | Set search mode state |
| `src/components/content/SeriesContent.tsx` | Set search mode state |

## User Experience

1. **Opening search**: Press "S" or click the search sidebar item
2. **Solid interface**: Full opaque background appears, sidebar stays expanded on the left
3. **Search type toggle**: User can switch between "Titles" and "People" search
4. **Content search**: Type to search movies/series by title (current behavior)
5. **Person search**: Type to find actors/actresses, select one to see their filmography
6. **Filmography view**: Shows all movies and TV shows featuring the selected person
7. **Navigation**: Full TV remote support with arrow keys for all interactions

