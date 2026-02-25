

# IPTV-First Catalog: Browse Provider Content Directly

## The Problem

The current architecture fetches content from TMDB first, then tries to match it against the IPTV catalog. But the IPTV provider blocks API calls from cloud/datacenter IPs (HTTP 513), so the catalog is always empty. Other IPTV players like Smarters work because they call the IPTV API directly from the user's device.

## The Solution

Switch to an **IPTV-first** approach: call the IPTV Xtream Codes API directly from the browser (bypassing the edge function), and display the provider's own catalog with its metadata, categories, and artwork. Keep the edge function only for HTTPS video stream proxying.

## Architecture Change

```text
CURRENT (broken):
  Browser -> Edge Function -> IPTV Server (blocked: 513)
                                  |
  Browser -> TMDB API (works, but nothing to match against)

NEW:
  Browser -> IPTV Server directly (works from residential IP)
  Browser -> Edge Function -> IPTV Server (only for video streaming)
```

## Changes

### 1. Add Direct Browser IPTV Client

**New file: `src/services/iptvDirectClient.ts`**

Create a service that calls the IPTV Xtream Codes API directly from the browser (no edge function proxy). This bypasses the datacenter IP block since requests come from the user's own IP.

Functions:
- `directGetUserInfo(credentials)` -- test connection
- `directGetVodCategories(credentials)` -- movie categories
- `directGetVodStreams(credentials, categoryId?)` -- movie list with metadata
- `directGetSeriesCategories(credentials)` -- series categories  
- `directGetSeries(credentials, categoryId?)` -- series list
- `directGetSeriesInfo(credentials, seriesId)` -- series episodes/details
- `directGetVodInfo(credentials, vodId)` -- full movie metadata (cast, director, plot, poster)

Each function constructs the `player_api.php` URL and calls `fetch()` directly. Since the IPTV server is HTTP, this may trigger mixed-content warnings on HTTPS, so we'll need a fallback to the edge function proxy if direct calls fail.

### 2. Update `useIPTVLibrary` Hook -- IPTV-First Mode

**Modified file: `src/hooks/useIPTVLibrary.ts`**

Instead of fetching from TMDB and cross-referencing, add a new mode that:
- Fetches VOD categories and streams directly from the IPTV provider
- Transforms IPTV entries into `WatchContent` objects using the provider's own metadata (`stream_icon` as poster, `rating`, category name as genre)
- Groups content by IPTV categories (the provider's own grouping like "4K-TOP", "Drama", "Action", etc.)
- Falls back to the edge function proxy if direct browser calls fail (CORS/mixed-content)

### 3. Add IPTV Browse Components

**New file: `src/components/content/IPTVMoviesContent.tsx`**

A new content view that displays the IPTV provider's movie catalog directly:
- Sidebar shows IPTV categories (from `get_vod_categories`)
- Content area shows movie tiles with provider artwork (`stream_icon`)
- Clicking a movie shows detail page with metadata from `get_vod_info` (director, cast, plot, rating -- same data Smarters shows)
- Play button builds the stream URL and proxies through the edge function

**New file: `src/components/content/IPTVSeriesContent.tsx`**

Same approach for series:
- Categories from `get_series_categories`
- Series list with covers from provider
- Detail view shows seasons/episodes from `get_series_info`

### 4. Update MoviesContent and SeriesContent

**Modified files: `src/components/content/MoviesContent.tsx`, `SeriesContent.tsx`**

Add a toggle or automatic detection:
- If IPTV is connected and the IPTV-first catalog loaded successfully, show the IPTV catalog directly
- If IPTV catalog is empty or not connected, fall back to TMDB-based browsing (current behavior)
- The TMDB data can still be used to enrich IPTV entries with better posters/backdrops when available (optional enhancement)

### 5. Handle Mixed Content (HTTP API on HTTPS page)

**Modified file: `src/services/iptvDirectClient.ts`**

Since the IPTV API is HTTP and the app is HTTPS, direct `fetch()` may be blocked by browsers. Strategy:
- First attempt: direct fetch to HTTP IPTV API
- If blocked (mixed content error): fall back to edge function proxy (which may get 513 from some endpoints but works for `get_user_info`)
- Display a note to the user if both fail, suggesting they access the app via HTTP for full catalog access

### 6. Update Edge Function for VOD Info

**Modified file: `supabase/functions/iptv/index.ts`**

Add support for `get_vod_info` action (accepts `vodId` parameter) so the detail page can fetch full metadata (cast, director, plot) through the proxy as a fallback.

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/services/iptvDirectClient.ts` | New | Direct browser-to-IPTV API calls |
| `src/hooks/useIPTVLibrary.ts` | Modify | Add IPTV-first catalog mode |
| `src/components/content/IPTVMoviesContent.tsx` | New | Browse IPTV movie catalog directly |
| `src/components/content/IPTVSeriesContent.tsx` | New | Browse IPTV series catalog directly |
| `src/components/content/MoviesContent.tsx` | Modify | Auto-switch to IPTV-first when available |
| `src/components/content/SeriesContent.tsx` | Modify | Auto-switch to IPTV-first when available |
| `supabase/functions/iptv/index.ts` | Modify | Add `get_vod_info` and `vodId` param support |

## Key Benefit

This mirrors exactly how Smarters Player and other IPTV apps work -- the provider's catalog IS the catalog. No TMDB matching needed. The metadata (poster, cast, director, genre, plot, rating) all comes from the IPTV provider itself, as shown in the Smarters screenshot.

