

# Faster Search Results & Image Loading Optimizations

## Problems Found

1. **Search result thumbnails use backdrop images (w1280)** -- these are ~200KB+ each, far too large for small search cards
2. **No skeleton placeholders** while images load -- users see empty space or nothing
3. **Content row thumbnails lack `loading="lazy"`** -- all images load at once even if off-screen
4. **No blur-up / low-quality placeholder** -- images pop in abruptly

## Optimizations

### 1. Smaller images for search results
- Search content results currently use `item.backdrop` (w1280) as the thumbnail
- Switch to `item.backdrop` at a **new smaller size** by adding a `backdropSmall` field using TMDB's `w300` size (~10-20KB vs ~200KB)
- For person profile images, `w185` is already appropriate

### 2. Skeleton placeholders (shimmer effect)
- Show a pulsing skeleton placeholder in the exact aspect ratio of each image while it loads
- As soon as the image loads, cross-fade it in over the skeleton
- This gives **instant visual feedback** -- users see the grid layout immediately with shimmering cards

### 3. Lazy loading everywhere
- Add `loading="lazy"` to ContentRow thumbnails (currently missing)
- Already present in ContentGrid -- no change needed there

### 4. CSS blur-up technique
- Start images with a slight blur and scale, then animate to sharp on load
- Combined with the skeleton, this creates a smooth "materializing" effect

### 5. Keep previous search results visible (already done via React Query)
- React Query's `keepPreviousData` behavior already prevents flickering between searches -- no change needed

## Technical Details

### Files to modify

**`src/services/tmdbTransformer.ts`**
- Add `backdropSmall` using TMDB `w300` size to all transform functions
- Add `backdrop_small` already exists in the size map as `w780` -- will add a new `backdrop_thumb` at `w300`

**`src/data/watchContent.ts`**
- Add optional `backdropSmall?: string` field to `WatchContent` interface

**`src/components/watch/SearchOverlay.tsx`**
- Replace `item.backdrop || item.poster` with `item.backdropSmall || item.poster` for content result thumbnails
- Wrap each image in a skeleton container that shows a shimmer until `onLoad` fires
- Apply blur-up CSS transition on load

**`src/components/watch/ContentRow.tsx`**
- Add `loading="lazy"` to thumbnail images
- Add skeleton placeholder with shimmer while image loads
- Apply fade-in on load

**`src/components/watch/ContentGrid.tsx`**
- Add skeleton placeholder behind each poster image (same shimmer pattern)
- Already has `loading="lazy"` -- no change needed there

### Skeleton + fade-in pattern (used in all three components)

```tsx
const [loaded, setLoaded] = useState(false);

<div className="relative w-full h-full bg-muted/30">
  {/* Skeleton shimmer */}
  {!loaded && (
    <div className="absolute inset-0 animate-pulse bg-muted/50 rounded" />
  )}
  <img
    src={imageUrl}
    alt={title}
    loading="lazy"
    className={cn(
      "w-full h-full object-cover transition-all duration-300",
      loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
    )}
    onLoad={() => setLoaded(true)}
    onError={(e) => {
      e.currentTarget.src = '/placeholder.svg';
      setLoaded(true);
    }}
  />
</div>
```

### Image size changes summary

| Context | Current source | New source | Approx size |
|---------|---------------|------------|-------------|
| Search result thumbnails | backdrop w1280 | backdropSmall w300 | ~15KB vs ~200KB |
| Content row thumbnails | poster w342 | poster w342 (unchanged) | ~50KB |
| Content grid thumbnails | poster w342 | poster w342 (unchanged) | ~50KB |
| Person search photos | w185 | w185 (unchanged) | ~15KB |

### Files summary

| File | Changes |
|------|---------|
| `src/data/watchContent.ts` | Add `backdropSmall` field |
| `src/services/tmdbTransformer.ts` | Add `backdrop_thumb` (w300) size, output `backdropSmall` |
| `src/components/watch/SearchOverlay.tsx` | Use `backdropSmall`, add skeleton + blur-up |
| `src/components/watch/ContentRow.tsx` | Add `loading="lazy"`, skeleton + blur-up |
| `src/components/watch/ContentGrid.tsx` | Add skeleton + blur-up behind poster images |

