
# Fix "More Like This" Feature

## Problem

The "More Like This" section in the content detail modal shows placeholder Unsplash images instead of actual similar movies/series. The TMDB API already provides similar content data, but it's not being utilized.

## Root Cause Analysis

1. **Edge function is correct** - Already fetches `similar` content via `append_to_response=credits,similar`
2. **Service types are correct** - `TMDBMovieDetails.similar` and `TMDBSeriesDetails.similar` fields exist
3. **Transformer ignores similar data** - `transformTMDBMovieDetails` and `transformTMDBSeriesDetails` don't extract similar content
4. **WatchContent lacks field** - No `similarContent` field in the interface
5. **Component uses placeholders** - `ContentDetail.tsx` renders fake Unsplash images

## Solution Architecture

```text
TMDB API (similar)
       ↓
Edge Function (already includes similar)
       ↓
Transformer (NEW: extract & transform similar)
       ↓
WatchContent interface (NEW: add similarContent field)
       ↓
ContentDetail.tsx (NEW: render real similar content)
```

## Implementation Details

### 1. Update WatchContent Interface (watchContent.ts)

Add a field for similar content:

```typescript
export interface WatchContent {
  // ... existing fields
  similarContent?: WatchContent[];  // NEW
}
```

### 2. Update Transformer Functions (tmdbTransformer.ts)

Modify both `transformTMDBMovieDetails` and `transformTMDBSeriesDetails` to include similar content:

**For movies:**
```typescript
export const transformTMDBMovieDetails = (movie: TMDBMovieDetails): WatchContent => ({
  // ... existing fields
  similarContent: movie.similar?.results
    .slice(0, 6)
    .map(transformTMDBMovie),
});
```

**For series:**
```typescript
export const transformTMDBSeriesDetails = (series: TMDBSeriesDetails): WatchContent => ({
  // ... existing fields
  similarContent: series.similar?.results
    .slice(0, 6)
    .map(transformTMDBSeries),
});
```

### 3. Update ContentDetail Component (ContentDetail.tsx)

Replace the placeholder grid with real similar content that:
- Shows actual movie/series posters from TMDB
- Displays title overlay on hover
- Makes items clickable to view details (optional enhancement)

**Current code (placeholder):**
```tsx
{[1, 2, 3].map((i) => (
  <div key={i} className="aspect-video bg-muted rounded-md overflow-hidden">
    <img src={`https://images.unsplash.com/...`} />
  </div>
))}
```

**New code (real content):**
```tsx
{content.similarContent && content.similarContent.length > 0 ? (
  <div className="grid grid-cols-3 gap-3">
    {content.similarContent.slice(0, 6).map((item) => (
      <div key={item.id} className="aspect-video bg-muted rounded-md overflow-hidden relative group cursor-pointer">
        <img
          src={item.backdrop || item.poster}
          alt={item.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <span className="text-xs font-medium text-white line-clamp-2">{item.title}</span>
        </div>
      </div>
    ))}
  </div>
) : (
  <p className="text-sm text-muted-foreground">No similar content available</p>
)}
```

### 4. Fetch Details When Opening Modal

Currently the modal receives the basic `WatchContent` from list views which doesn't have similar content. To get the full details including similar content, we need to fetch the details when opening the modal.

Add a hook call in `ContentDetail.tsx`:
```typescript
const { data: fullDetails } = useMovieDetails(
  content.type === 'movie' ? content.tmdbId : undefined
);
const { data: seriesDetails } = useSeriesDetails(
  content.type === 'series' ? content.tmdbId : undefined
);

// Use enriched content with similar data
const enrichedContent = fullDetails || seriesDetails || content;
```

Then use `enrichedContent.similarContent` for the "More Like This" grid.

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/watchContent.ts` | Add `similarContent?: WatchContent[]` to interface |
| `src/services/tmdbTransformer.ts` | Extract and transform similar content in detail transformers |
| `src/components/watch/ContentDetail.tsx` | Fetch full details on mount, render real similar content grid |

## Visual Result

**Before:**
- 3 faded placeholder images from Unsplash
- No interactivity
- Same images for every movie/series

**After:**
- Up to 6 actual similar movies/series from TMDB
- Real backdrop images with title on hover
- Different recommendations for each content item
- Fallback message if no similar content available
