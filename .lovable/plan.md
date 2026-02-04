
# Fix Search Results Image Flickering

## Problem

When typing in search, the movie/actor images flicker (disappear and reappear quickly). This creates a jarring visual experience.

## Root Cause Analysis

1. **React Query clears data on new queries** - When the search term changes, the previous results become `undefined` while new results load, causing images to unmount and remount

2. **No loading placeholder for images** - Images render without a background placeholder, so they flash from empty to loaded

3. **No smooth transition** - There's no fade-in animation when images load

## Solution

### 1. Keep Previous Data While Loading (React Query)

Add `placeholderData` option to preserve the previous search results while new ones are loading:

**File: `src/hooks/useTMDB.ts`**

```typescript
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export const useTMDBSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search", query, page],
    queryFn: async () => { /* ... */ },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData, // ADD THIS
  });
};

export const useTMDBPersonSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search-person", query, page],
    queryFn: async () => { /* ... */ },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData, // ADD THIS
  });
};
```

This keeps the old results visible while new ones are fetching, eliminating the flash to empty state.

### 2. Add Image Loading Placeholder & Fade-In

Add a background color to image containers and a fade-in animation when images load:

**File: `src/components/watch/SearchOverlay.tsx`**

For content results:
```tsx
<button
  key={item.id}
  className={cn(
    'relative aspect-video rounded-lg overflow-hidden',
    'bg-muted/50', // ADD: Background placeholder
    // ... rest of classes
  )}
>
  <img
    src={item.backdrop || item.poster}
    alt={item.title}
    className="w-full h-full object-cover transition-opacity duration-300"
    loading="lazy"
    onLoad={(e) => {
      (e.target as HTMLImageElement).style.opacity = '1';
    }}
    style={{ opacity: 0 }} // Start invisible, fade in on load
    onError={(e) => {
      (e.target as HTMLImageElement).src = '/placeholder.svg';
      (e.target as HTMLImageElement).style.opacity = '1';
    }}
  />
```

For person results - similar treatment for profile images.

### 3. Use Stable Keys

The current `key={item.id}` is already good, but we should ensure the same item doesn't remount by verifying IDs are stable TMDB IDs (which they are).

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useTMDB.ts` | Add `placeholderData: keepPreviousData` to `useTMDBSearch` and `useTMDBPersonSearch` |
| `src/components/watch/SearchOverlay.tsx` | Add background placeholder, lazy loading, and fade-in transition to images |

## Technical Details

**`keepPreviousData` behavior:**
- When query changes (e.g., "bat" → "batm"), the previous results stay visible
- New results smoothly replace old ones once fetched
- No empty/loading flash between results

**Image fade-in technique:**
- Image starts with `opacity: 0`
- `onLoad` sets `opacity: 1`
- CSS `transition-opacity` creates smooth fade
- Background placeholder shows while loading

## Expected Results

**Before:**
- Type "b" → results appear
- Type "a" → results disappear, loading, reappear
- Type "t" → results disappear, loading, reappear
- Images flash and flicker on each keystroke

**After:**
- Type "b" → results appear
- Type "a" → previous results stay visible, smoothly transition to new results
- Type "t" → same smooth transition
- Images fade in gracefully, no flicker
