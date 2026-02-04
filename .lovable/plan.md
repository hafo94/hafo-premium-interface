

# Faster Search with Popularity Sorting

## Problems Identified

1. **Slow Search Experience**
   - 300ms debounce delay before search starts
   - No feedback while typing (waiting for debounce)
   - Edge function cold start adds latency on first search

2. **Poor Result Ordering**
   - TMDB's `/search/multi` endpoint returns results by text relevance, not popularity
   - Obscure "Batman" titles appear before "The Dark Knight" or "Batman Begins"
   - The `popularity` field exists in the data but isn't being used to sort

## Solution

### 1. Reduce Debounce Time (Speed)

Change debounce from 300ms to 150ms for faster response:

**File: `src/components/watch/SearchOverlay.tsx`**

```typescript
// Before
const timer = setTimeout(() => {
  setDebouncedTerm(searchTerm);
}, 300);

// After  
const timer = setTimeout(() => {
  setDebouncedTerm(searchTerm);
}, 150);
```

### 2. Sort Results by Popularity (Better Ordering)

Sort search results client-side after receiving from TMDB. Since `TMDBSearchResult` includes a `popularity` field, we sort highest first.

**File: `src/hooks/useTMDB.ts`**

Update `useTMDBSearch` to sort results:

```typescript
export const useTMDBSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search", query, page],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await tmdbService.searchContent(query, page);
      return response.results
        .map(transformTMDBSearchResult)
        .filter((item): item is WatchContent => item !== null)
        .sort((a, b) => {
          // Sort by a combination of rating and popularity
          // Higher vote count items with good ratings should appear first
          const scoreA = (a.rating || 0) * (a.isRecommended ? 2 : 1);
          const scoreB = (b.rating || 0) * (b.isRecommended ? 2 : 1);
          return scoreB - scoreA;
        });
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
  });
};
```

**Better approach**: Access raw popularity before transformation:

```typescript
export const useTMDBSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search", query, page],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await tmdbService.searchContent(query, page);
      
      // Sort by popularity BEFORE transforming
      const sortedResults = [...response.results].sort(
        (a, b) => b.popularity - a.popularity
      );
      
      return sortedResults
        .map(transformTMDBSearchResult)
        .filter((item): item is WatchContent => item !== null);
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
  });
};
```

### 3. Sort Person Search Results Too

Apply the same popularity sorting to person search:

**File: `src/hooks/useTMDB.ts`**

```typescript
export const useTMDBPersonSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search-person", query, page],
    queryFn: async (): Promise<TMDBPerson[]> => {
      if (!query.trim()) return [];
      const response = await tmdbService.searchPerson(query, page);
      // Sort by popularity - most famous actors/actresses first
      return [...response.results].sort((a, b) => b.popularity - a.popularity);
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
  });
};
```

### 4. Immediate Visual Feedback (Perceived Speed)

Show loading state immediately when typing starts, not just after debounce:

**File: `src/components/watch/SearchOverlay.tsx`**

```typescript
// Track if we're waiting for debounce
const isWaitingForDebounce = searchTerm !== debouncedTerm && searchTerm.trim().length > 0;

// Update loading indicator logic
const isSearching = isWaitingForDebounce || isSearchingContent || isSearchingPerson || isLoadingCredits;
```

This gives users immediate feedback that their input is being processed.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/watch/SearchOverlay.tsx` | Reduce debounce to 150ms, add immediate loading state |
| `src/hooks/useTMDB.ts` | Sort content results by popularity, sort person results by popularity |

## Expected Results

**Before (searching "Batman"):**
1. Batman: The Killing Joke (2016)
2. Batman vs Dracula (2005)
3. Batman Ninja (2018)
4. The Dark Knight (2008) ← Finally appears!

**After (searching "Batman"):**
1. The Dark Knight (2008) ← Most popular first
2. The Dark Knight Rises (2012)
3. Batman Begins (2005)
4. Batman (1989)
5. Batman Returns (1992)

**Speed improvement:**
- 150ms debounce instead of 300ms = 50% faster initial response
- Immediate loading spinner = feels even faster

