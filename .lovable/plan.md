
# Fix Low-Vote TMDB Ratings Showing at Top

## Problem
Titles with very few TMDB ratings (e.g., 1 vote with a 10.0 score) appear at the top of sorted lists like person filmography results. These inflated scores are unreliable and should not be trusted until an IMDb rating confirms them.

## Rule
If a title has fewer than 20 TMDB votes, treat its TMDB rating as null for sorting purposes. It should sink to the bottom until an IMDb rating is fetched, at which point it gets placed according to its IMDb score.

## Changes

### 1. Add `voteCount` to `WatchContent` interface
**File:** `src/data/watchContent.ts`

Add a new optional field `voteCount?: number` alongside the existing TMDB fields. This allows downstream sorting logic to check vote reliability.

### 2. Pass `vote_count` through transformers
**File:** `src/services/tmdbTransformer.ts`

Update all four transform functions (`transformTMDBMovie`, `transformTMDBSeries`, `transformTMDBSearchResult`, `transformTMDBMovieDetails`, `transformTMDBSeriesDetails`) to include `voteCount` in the output.

### 3. Apply the "< 20 votes = null rating" rule in sorting

**File:** `src/hooks/useIMDBRatings.ts` -- Update `useIMDBSortedContent`:
- When merging ratings, if an item has `voteCount < 20` and no IMDb rating yet, treat its effective rating as 0 (bottom of list).
- Once an IMDb rating arrives, use it normally regardless of vote count.

**File:** `src/hooks/useTMDB.ts` -- Update `usePersonCredits` sorting:
- Same rule: if `voteCount < 20`, treat the TMDB rating as 0 for sorting. This directly fixes the Sydney Sweeney filmography issue.

### 4. Update `selectFeaturedItems` in `useIMDBRatings.ts`
- When checking `isHot` or selecting featured items, also require `voteCount >= 20` or an existing IMDb rating, so low-vote titles don't get promoted to the hero carousel.

## Technical Details

### WatchContent addition
```typescript
// src/data/watchContent.ts
voteCount?: number;  // TMDB vote count for reliability filtering
```

### Transformer example
```typescript
// In transformTMDBMovie:
voteCount: movie.vote_count,
```

### Sorting logic (person credits)
```typescript
// Effective rating considers vote count threshold
const effectiveRating = (item: WatchContent) => {
  if (item.imdbRating) return item.imdbRating;
  if ((item.voteCount || 0) >= 20) return item.rating || 0;
  return 0; // Low-vote, no IMDb = bottom
};
```

### Files changed

| File | Change |
|------|--------|
| `src/data/watchContent.ts` | Add `voteCount` field |
| `src/services/tmdbTransformer.ts` | Pass `vote_count` through all transformers |
| `src/hooks/useTMDB.ts` | Apply vote threshold in `usePersonCredits` sorting |
| `src/hooks/useIMDBRatings.ts` | Apply vote threshold in `useIMDBSortedContent` and `selectFeaturedItems` |
