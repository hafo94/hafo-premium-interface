
# Search Layout Redesign + White Lotus Search Fix

## Overview

This plan addresses two issues:
1. **Layout Change**: Move the keyboard to the left side and add a dedicated suggested search results area on the right that is clickable
2. **Search Relevance**: Fix the issue where popular shows like "The White Lotus" don't appear when searching "White"

---

## Problem Analysis

### Layout Issue
Currently, the search overlay has this structure:
- Search type toggle (top)
- Search input (top)
- Full-width keyboard (center)
- Full-width results (below keyboard)

### White Lotus Search Issue
The TMDB `/search/multi` endpoint returns results by **text relevance**, not popularity. When you search "White":
- TMDB returns movies/shows with "White" in the title, ordered by relevance
- Even with client-side popularity sorting, "The White Lotus" may not be on page 1 of TMDB's results
- Solution: Use **TV-specific search** (`/search/tv`) in parallel with multi-search to ensure TV shows like "The White Lotus" are found

---

## Solution

### 1. New Layout Structure

```text
+------------------------------------------+
| [Titles] [People]    Search input      X |
+------------------------------------------+
|                  |                       |
|   ON-SCREEN      |   SUGGESTED RESULTS   |
|   KEYBOARD       |   (Live updating)     |
|                  |                       |
|  [1][2][3]...    |  +-------+  +-------+ |
|  [Q][W][E]...    |  | Movie |  | Movie | |
|  [A][S][D]...    |  +-------+  +-------+ |
|  [Z][X]...[DEL]  |  +-------+  +-------+ |
|                  |  | Show  |  | Show  | |
|                  |  +-------+  +-------+ |
|                  |          ...          |
+------------------------------------------+
```

- **Left side (40%)**: Compact on-screen keyboard
- **Right side (60%)**: Scrollable results grid that updates as you type

### 2. Search API Enhancement

Add parallel TV-specific search to ensure popular TV shows appear:

**File: `src/services/tmdbService.ts`**
Add new endpoint:
```typescript
searchTV: async (query: string, page = 1): Promise<TMDBResponse<TMDBSeries>> => {
  return callTMDB('search-tv', { query, page: String(page) });
}
```

**File: `supabase/functions/tmdb/index.ts`**
Add case for TV search:
```typescript
case "search-tv":
  if (!query) {
    return new Response(
      JSON.stringify({ error: "Search query required" }),
      { status: 400, ... }
    );
  }
  tmdbUrl = `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`;
  break;
```

### 3. Merge and Deduplicate Results

**File: `src/hooks/useTMDB.ts`**

Update `useTMDBSearch` to:
1. Call both `/search/multi` AND `/search/tv` in parallel
2. Merge results, removing duplicates by ID
3. Sort by popularity

```typescript
export const useTMDBSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search", query, page],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // Fetch multi-search and TV-specific search in parallel
      const [multiResponse, tvResponse] = await Promise.all([
        tmdbService.searchContent(query, page),
        tmdbService.searchTV(query, page),
      ]);
      
      // Transform TV results with media_type added
      const tvResults = tvResponse.results.map(tv => ({
        ...tv,
        media_type: 'tv' as const,
      }));
      
      // Merge and deduplicate
      const allResults = [...multiResponse.results, ...tvResults];
      const seen = new Set<string>();
      const uniqueResults = allResults.filter(item => {
        const key = `${item.media_type || 'unknown'}-${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      // Sort by popularity
      const sortedResults = uniqueResults.sort(
        (a, b) => b.popularity - a.popularity
      );
      
      return sortedResults
        .map(transformTMDBSearchResult)
        .filter((item): item is WatchContent => item !== null);
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/watch/SearchOverlay.tsx` | Reorganize layout: keyboard on left (40%), results grid on right (60%); update keyboard navigation for horizontal movement between zones |
| `supabase/functions/tmdb/index.ts` | Add `search-tv` endpoint for TV-specific search |
| `src/services/tmdbService.ts` | Add `searchTV` method to call the new endpoint |
| `src/hooks/useTMDB.ts` | Update `useTMDBSearch` to fetch both multi and TV search, merge and deduplicate results |

---

## Navigation Changes

With the new side-by-side layout, keyboard navigation updates:

- **ArrowRight from keyboard**: Jump to results
- **ArrowLeft from results**: Jump back to keyboard
- **ArrowUp/Down in keyboard**: Move through keyboard rows
- **ArrowUp/Down in results**: Move through results grid

---

## Expected Results

### Layout
- Keyboard stays visible on the left while browsing results
- Can immediately click/select results without scrolling past keyboard
- More efficient use of screen space

### Search "White"
**Before:**
- Random obscure movies with "White" in title
- "The White Lotus" buried or missing

**After:**
- "The White Lotus" appears near the top (high popularity)
- Better coverage of both movies AND TV shows matching the query
