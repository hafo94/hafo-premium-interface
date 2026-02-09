

# Fix IPTV Matching: Use TMDB ID Instead of Title

## The Problem

Titles are not matching between IPTV and TMDB because title-based matching is inherently fragile. IPTV providers use names like `"US| EN| The Dark Knight (2008)"` while TMDB returns `"The Dark Knight"`. Even with our title normalization, slight differences cause mismatches.

## The Solution

Both the IPTV data and our UI content already carry TMDB IDs:
- IPTV VOD streams have a `tmdb_id` field (string)
- IPTV Series have a `tmdb_id` field (string)
- Our UI content (from TMDB) has `tmdbId` (number)

We should match by TMDB ID first -- this is a guaranteed 1:1 match. Title matching becomes a fallback for the rare case where `tmdb_id` is missing from the IPTV data.

## Changes

### File: `src/hooks/useIPTVLibrary.ts`

1. **Add TMDB ID lookup maps** alongside the existing title maps:
   - `vodByTmdbId`: Map of TMDB ID string to `IPTVVodStream`
   - `seriesByTmdbId`: Map of TMDB ID string to `IPTVSeriesInfo`

2. **Update `enrichWithIPTV`** to check TMDB ID first, then fall back to title:
   ```
   For each TMDB item:
     1. Look up by item.tmdbId in the TMDB ID map
     2. If not found, fall back to title normalization lookup
     3. If found by either method, set streamUrl + iptvId
   ```

3. **Add match rate logging** so we can verify how many titles are actually matching:
   ```
   [IPTV Library] Enriched 20 items: 14 matched by TMDB ID, 2 by title, 4 unmatched
   ```

## Technical Details

### New maps in `useIPTVLibrary.ts`

```typescript
const vodByTmdbId = useMemo(() => {
  const map = new Map<string, IPTVVodStream>();
  if (!vodStreams) return map;
  for (const stream of vodStreams) {
    if (stream.tmdb_id) {
      map.set(String(stream.tmdb_id), stream);
    }
    // Also try the 'tmdb' field some providers use
    if (stream.tmdb) {
      map.set(String(stream.tmdb), stream);
    }
  }
  return map;
}, [vodStreams]);

const seriesByTmdbId = useMemo(() => {
  const map = new Map<string, IPTVSeriesInfo>();
  if (!seriesList) return map;
  for (const series of seriesList) {
    if (series.tmdb_id) {
      map.set(String(series.tmdb_id), series);
    }
  }
  return map;
}, [seriesList]);
```

### Updated matching in `enrichWithIPTV`

```typescript
return items.map((item) => {
  if (item.type === 'movie') {
    // Try TMDB ID first (reliable)
    let vod = item.tmdbId ? vodByTmdbId.get(String(item.tmdbId)) : undefined;
    // Fall back to title match
    if (!vod) vod = vodMap.get(normalizeTitle(item.title));
    if (vod) {
      return { ...item, iptvId: vod.stream_id, streamUrl: buildVodStreamUrl(...) };
    }
  } else {
    let series = item.tmdbId ? seriesByTmdbId.get(String(item.tmdbId)) : undefined;
    if (!series) series = seriesMap.get(normalizeTitle(item.title));
    if (series) {
      return { ...item, iptvId: series.series_id, streamUrl: buildSeriesStreamUrl(...) };
    }
  }
  return item;
});
```

## Summary

| File | Change |
|------|--------|
| `src/hooks/useIPTVLibrary.ts` | Add TMDB ID maps, match by ID first then title fallback, add debug logging |

This is the minimal change needed. No edge function changes, no service layer changes -- just smarter matching on the client side using data we already have.

