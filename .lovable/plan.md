

# Optimize TMDB Image Sizes for Faster Loading

## Problem

Currently, every image pulled from TMDB uses the same large sizes regardless of where it's displayed:
- **Posters**: Always `w500` (~750KB each) -- even for small 200px thumbnails
- **Backdrops**: Always `original` (~2-5MB each) -- even when used as small backgrounds

This causes unnecessary bandwidth usage and slower load times, especially when scrolling through grids with 20-60+ items.

## Solution

Introduce multiple image size options in the transformer and use appropriately sized images throughout the app. Small thumbnails get small images; only hero/detail views get large ones.

## TMDB Available Sizes

| Type | Options |
|------|---------|
| Poster | w92, w154, w185, w342, w500, w780 |
| Backdrop | w300, w780, w1280, original |

## Recommended Size Mapping

| Usage | Current | Proposed | Approx Savings |
|-------|---------|----------|----------------|
| Grid/row thumbnails (poster) | w500 | w342 | ~40% smaller |
| Search result thumbnails | w500 | w185 | ~70% smaller |
| Detail view poster | w500 | w500 | No change |
| Hero backdrop | original | w1280 | ~60% smaller |
| Row/grid backdrop (if used) | original | w780 | ~70% smaller |

## Changes

### 1. `src/services/tmdbTransformer.ts`

Update the `getImageUrl` helper to support more size options:

```typescript
type ImageSize = "poster_small" | "poster_medium" | "poster_large" | "backdrop_small" | "backdrop_medium" | "backdrop_large";
```

Update all transform functions to output both a small and large poster URL (e.g., `poster` for standard use, `posterSmall` or keep `poster` as the small version and add `posterLarge` for detail views).

**Simpler approach**: Change the default poster size from `w500` to `w342` globally, and add a `posterLarge` field for detail views. Change backdrop default from `original` to `w1280`.

### 2. `src/data/watchContent.ts`

Add optional `posterLarge` field to `WatchContent` interface for detail/hero views that need higher resolution.

### 3. `src/components/watch/ContentDetail.tsx`

Use `posterLarge` (w500) for the detail view poster instead of the default smaller one.

### 4. `src/components/watch/FeaturedHero.tsx`

Already uses `backdrop` -- this will automatically benefit from the `original` to `w1280` change.

### Summary of File Changes

| File | Change |
|------|--------|
| `src/services/tmdbTransformer.ts` | Change poster default to w342, backdrop to w1280, add posterLarge (w500) output |
| `src/data/watchContent.ts` | Add optional `posterLarge` field |
| `src/components/watch/ContentDetail.tsx` | Use `posterLarge` for the detail poster image |

This is a low-risk change that applies globally to all content (movies, series, search results, all categories) since everything flows through the same transformer functions.

