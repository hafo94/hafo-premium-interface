

# IPTV Library Integration -- Show Only Streamable Titles

## Overview

Hardcode the IPTV credentials, fetch the full VOD (movies) and Series library from the IPTV server, then cross-reference every TMDB title with the IPTV catalog. Only titles that exist on the IPTV server will be displayed. Clicking "Play" will stream directly from the IPTV provider.

## How It Works

1. **Hardcode credentials** in the IPTVContext so it auto-connects without needing the Settings flow.

2. **Fetch IPTV catalogs on startup** -- the full VOD streams list and full Series list (no category filter = all titles). Cache these in React Query.

3. **Title matching** -- create a utility hook (`useIPTVLibrary`) that:
   - Loads all VOD streams and all Series from IPTV
   - Builds a lookup map by normalized title (lowercase, stripped of special characters)
   - Exposes a `filterByIPTV(items: WatchContent[])` function that filters a TMDB content array to only include titles found in the IPTV catalog
   - Attaches `streamUrl`, `iptvId`, and `containerExtension` to each matched item

4. **Apply the filter** in `MoviesContent` and `SeriesContent` -- wrap every content array (trending, popular, top rated, grid items, etc.) through the IPTV filter before rendering. This means only titles available on the IPTV server appear.

5. **Play button works** -- since each matched `WatchContent` item now has a `streamUrl`, the existing `ContentDetail` -> `StreamPlayer` flow will stream it.

## Changes

### 1. IPTVContext -- Hardcode Credentials

Set the default credentials to:
- Server: `http://freeiptv.ottc.xyz:80`
- Username: `850832714335`
- Password: `641859008374`

Auto-mark as connected on mount (skip manual test).

### 2. New Hook: `useIPTVLibrary`

Create `src/hooks/useIPTVLibrary.ts`:

- Fetches all VOD streams (`get_vod_streams` with no category)
- Fetches all Series (`get_series` with no category)
- Builds a normalized title -> IPTV stream map
- Provides `enrichWithIPTV(items: WatchContent[]): WatchContent[]` that:
  - Matches by normalized title
  - Attaches `streamUrl` (using `buildVodStreamUrl` or `buildSeriesStreamUrl`)
  - Attaches `iptvId` and `containerExtension`
- Provides `filterByIPTV(items: WatchContent[]): WatchContent[]` that returns only matched items
- Exposes loading state

### 3. MoviesContent -- Filter Through IPTV

- Import `useIPTVLibrary`
- Wrap all content arrays through `filterByIPTV` before rendering
- Show a loading indicator while the IPTV library is loading
- Featured hero picks from filtered content only

### 4. SeriesContent -- Filter Through IPTV

Same approach as MoviesContent.

### 5. ContentDetail -- Use Stream URL

Already mostly done. When `content.streamUrl` is set (from IPTV matching), clicking Play opens StreamPlayer with that URL. No changes needed here since the previous work already wired this up.

## Technical Details

### Title Normalization

```typescript
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special chars
    .replace(/\s+/g, ' ')          // Collapse whitespace
    .trim();
}
```

This handles cases like "The Dark Knight" vs "the dark knight" or slight punctuation differences.

### Stream URL Construction

For movies (VOD):
```
http://server/movie/username/password/streamId.mp4
```

For series (first episode as default):
```
http://server/series/username/password/episodeId.mp4
```

### Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/contexts/IPTVContext.tsx` | Modify | Hardcode credentials, auto-connect |
| `src/hooks/useIPTVLibrary.ts` | Create | IPTV catalog fetching + title matching + filtering |
| `src/components/content/MoviesContent.tsx` | Modify | Filter all content through IPTV library |
| `src/components/content/SeriesContent.tsx` | Modify | Filter all content through IPTV library |

