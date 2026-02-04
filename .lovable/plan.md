
# Mode-Specific Search Results

## Overview

Filter search results based on the current mode:
- **Movies mode**: Only show movie results
- **Series mode**: Only show TV series results

## Current Behavior

The `SearchOverlay` component is used by both `MoviesContent` and `SeriesContent`, but it performs a unified search across all media types. When searching "White" in Series mode, movie results still appear alongside TV shows.

## Solution

### 1. Add Media Filter Prop to SearchOverlay

Pass the current mode context to the search overlay.

**File: `src/components/watch/SearchOverlay.tsx`**

```typescript
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: WatchContent) => void;
  mediaFilter?: 'movie' | 'tv' | 'all';  // NEW PROP
}
```

### 2. Update SearchOverlay to Pass Filter to Hook

Pass the filter to the search hook and adjust UI labels:

```typescript
const SearchOverlay = ({ isOpen, onClose, onSelect, mediaFilter = 'all' }: SearchOverlayProps) => {
  // ...
  
  // Use TMDB search hooks with media filter
  const { data: tmdbResults, isLoading: isSearchingContent } = useTMDBSearch(
    searchType === 'content' ? debouncedTerm : '',
    1,
    mediaFilter  // Pass filter to hook
  );
  
  // Dynamic placeholder text
  const placeholder = mediaFilter === 'movie' 
    ? 'Search movies...' 
    : mediaFilter === 'tv' 
    ? 'Search series...' 
    : 'Search titles, genres...';
```

### 3. Update useTMDBSearch Hook

Add `mediaFilter` parameter to filter results by type:

**File: `src/hooks/useTMDB.ts`**

```typescript
export const useTMDBSearch = (
  query: string, 
  page = 1, 
  mediaFilter: 'movie' | 'tv' | 'all' = 'all'
) => {
  return useQuery({
    queryKey: ["tmdb", "search", query, page, mediaFilter],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // Optimize: only fetch relevant data based on filter
      let multiResults: TMDBSearchResult[] = [];
      let tvResults: TMDBSeries[] = [];
      
      if (mediaFilter === 'movie') {
        // Only search movies
        const response = await tmdbService.searchContent(query, page);
        multiResults = response.results.filter(r => r.media_type === 'movie');
      } else if (mediaFilter === 'tv') {
        // Only search TV
        const response = await tmdbService.searchTV(query, page);
        tvResults = response.results;
      } else {
        // Search all (existing behavior)
        const [multiResponse, tvResponse] = await Promise.all([
          tmdbService.searchContent(query, page),
          tmdbService.searchTV(query, page),
        ]);
        multiResults = multiResponse.results;
        tvResults = tvResponse.results;
      }
      
      // Transform and merge...
    },
  });
};
```

### 4. Pass Filter from Content Components

**File: `src/components/content/MoviesContent.tsx`**

```tsx
<SearchOverlay
  isOpen={isSearchOpen}
  onClose={() => setIsSearchOpen(false)}
  onSelect={setSelectedContent}
  mediaFilter="movie"  // Only movies
/>
```

**File: `src/components/content/SeriesContent.tsx`**

```tsx
<SearchOverlay
  isOpen={isSearchOpen}
  onClose={() => setIsSearchOpen(false)}
  onSelect={setSelectedContent}
  mediaFilter="tv"  // Only series
/>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/watch/SearchOverlay.tsx` | Add `mediaFilter` prop, pass to hook, update placeholder text |
| `src/hooks/useTMDB.ts` | Add `mediaFilter` parameter to `useTMDBSearch`, filter results by media type |
| `src/components/content/MoviesContent.tsx` | Pass `mediaFilter="movie"` to SearchOverlay |
| `src/components/content/SeriesContent.tsx` | Pass `mediaFilter="tv"` to SearchOverlay |

## Expected Results

**Movies mode - searching "White":**
- Snow White and the Huntsman
- White House Down
- The White Tiger
- (Only movies - no TV shows)

**Series mode - searching "White":**
- The White Lotus
- White Collar
- Breaking Bad: White (if relevant)
- (Only TV series - no movies)

## Technical Notes

- The query key includes `mediaFilter` to ensure proper caching per mode
- When `mediaFilter` is `'movie'`, we skip the TV search entirely for efficiency
- When `mediaFilter` is `'tv'`, we only call the TV endpoint
- Placeholder text updates dynamically to reflect the search scope
