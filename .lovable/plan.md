

# Improve Actor Filmography: Sort by Score + Show Role

## Problem

When clicking an actor in search, the filmography is poorly ordered and lacks role context. Titles without scores appear mixed in randomly instead of being pushed to the bottom.

## Changes

### 1. `src/data/watchContent.ts`
- Add `creditRole?: string` to the `WatchContent` interface

### 2. `src/hooks/useTMDB.ts` (`usePersonCredits` hook)
- Process cast and crew separately, attaching role info:
  - Cast entries: `creditRole = "Actor"`
  - Crew entries: `creditRole = credit.job` (e.g., "Director", "Producer")
- When deduplicating, prefer cast over crew (if someone acted AND produced, show "Actor")
- Filter out items with no poster image
- **Sorting logic:**
  1. Items WITH a rating (> 0) come first, sorted by rating descending
  2. Items WITHOUT a rating go to the bottom, sorted by popularity descending
  3. Within same-rating items, popularity is used as tiebreaker

### 3. `src/components/watch/SearchOverlay.tsx`
- Display `creditRole` as a small subtle label on each filmography card, below the year/type/rating line

## Technical Details

### Sorting implementation

```typescript
return uniqueCredits.sort((a, b) => {
  const aRating = a.rating || 0;
  const bRating = b.rating || 0;
  const aHasRating = aRating > 0;
  const bHasRating = bRating > 0;

  // Rated items always come before unrated
  if (aHasRating && !bHasRating) return -1;
  if (!aHasRating && bHasRating) return 1;

  // Both rated: sort by rating desc
  if (aHasRating && bHasRating) {
    if (bRating !== aRating) return bRating - aRating;
  }

  // Tiebreaker: popularity
  return (b.popularity || 0) - (a.popularity || 0);
});
```

This requires also adding an optional `popularity?: number` field to `WatchContent` (currently not carried through from TMDB data).

### Files summary

| File | Change |
|------|--------|
| `src/data/watchContent.ts` | Add `creditRole?: string` and `popularity?: number` fields |
| `src/hooks/useTMDB.ts` | Rework `usePersonCredits`: preserve roles, sort rated first then unrated, filter no-poster |
| `src/components/watch/SearchOverlay.tsx` | Display `creditRole` label on filmography cards |

