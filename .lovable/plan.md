

# Use IMDb Ratings for Sorting and Trending Selection

## Problem
TMDB ratings are unreliable for titles with few votes. We want to use IMDb ratings (via OMDb) to sort content in browse rows/grids and to determine which titles appear as "trending" or featured.

## Challenge: API Rate Limits
The OMDb free tier allows only **1,000 requests/day**. Each browse page shows 20 items across multiple rows, so fetching ratings on every page load would exhaust the limit quickly.

## Solution: Database Cache + Batch Fetching

We'll create a persistent cache table in the database that stores IMDb ratings. The edge function checks the cache first and only calls OMDb on a cache miss. Once a rating is cached, it's reused for 7 days before refreshing. This means after initial population, most requests are served from cache with zero OMDb calls.

```text
Client requests 20 titles
  --> Edge function checks cache table
  --> Cache hits: return immediately
  --> Cache misses: fetch from OMDb, store in cache, return
  --> Client re-sorts items by IMDb rating
```

## Changes

### 1. Database: Create `imdb_ratings_cache` table

| Column | Type | Description |
|--------|------|-------------|
| tmdb_id | integer (PK) | TMDB content ID |
| media_type | text | "movie" or "tv" |
| imdb_id | text | IMDb ID (e.g., tt0468569) |
| imdb_rating | numeric | Rating value (e.g., 9.1) |
| imdb_votes | text | Vote count string |
| cached_at | timestamptz | When it was cached |

No RLS needed -- this is public reference data, not user-specific.

### 2. Edge function: `supabase/functions/tmdb/index.ts`

Add a new `batch-imdb-ratings` endpoint that:
- Accepts a JSON body with `items: [{ tmdb_id, media_type }]` (up to 20 items)
- For each item, checks the cache table first
- For cache misses, fetches the TMDB detail to get the `imdb_id`, then calls OMDb
- Stores results in cache and returns all ratings
- Uses POST method to send the batch payload

### 3. Service: `src/services/tmdbService.ts`

Add `getBatchIMDBRatings(items)` method that calls the new batch endpoint.

### 4. Hooks: `src/hooks/useTMDB.ts`

Update list hooks (`usePopularMovies`, `useTrendingMovies`, `useTopRatedMovies`, `useNowPlayingMovies`, and their series equivalents) to:
- After fetching the TMDB list, fire a batch IMDb rating request
- Merge IMDb ratings into the `WatchContent` items
- Re-sort by IMDb rating (rated first descending, unrated last by TMDB popularity)
- Use a separate React Query for the IMDb batch so the TMDB data renders immediately, then updates with IMDb ratings when available

### 5. Transformer: `src/services/tmdbTransformer.ts`

No changes needed -- `imdbRating` and `imdbId` fields already exist on `WatchContent`.

### 6. Featured Hero selection

In `MoviesContent.tsx` and `SeriesContent.tsx`, update `featuredItems` logic to prefer titles with high IMDb ratings (>= 7.5) for the hero carousel, falling back to the existing backdrop filter.

## Technical Details

### Batch endpoint logic (edge function)

```typescript
case "batch-imdb-ratings": {
  // Parse POST body: { items: [{ tmdb_id, media_type }] }
  // 1. Query cache table for all tmdb_ids
  // 2. For cache misses:
  //    a. Fetch TMDB detail to get imdb_id
  //    b. Call OMDb for rating
  //    c. Insert into cache
  // 3. Return { ratings: { [tmdb_id]: { imdbRating, imdbId } } }
}
```

### Client-side merge and sort

```typescript
// After TMDB data loads, fire batch request
const imdbQuery = useQuery({
  queryKey: ["imdb-batch", tmdbIds],
  queryFn: () => tmdbService.getBatchIMDBRatings(items),
  enabled: items.length > 0,
  staleTime: DETAILS_STALE_TIME,
});

// Merge: overlay IMDb ratings onto WatchContent items
// Sort: IMDb-rated first (desc), then TMDB-rated, then unrated
```

### Cache expiry

Ratings older than 7 days are treated as stale and re-fetched. This keeps data fresh without excessive API calls.

### Files summary

| File | Change |
|------|--------|
| Database migration | Create `imdb_ratings_cache` table |
| `supabase/functions/tmdb/index.ts` | Add `batch-imdb-ratings` POST endpoint with cache logic |
| `src/services/tmdbService.ts` | Add `getBatchIMDBRatings()` method |
| `src/hooks/useTMDB.ts` | Add IMDb batch fetch + merge + sort to all list hooks |
| `src/components/content/MoviesContent.tsx` | Update featured hero selection to prefer high IMDb ratings |
| `src/components/content/SeriesContent.tsx` | Same featured hero update |

