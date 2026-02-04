
# IPTV Integration: Xtream Codes + Kodi Playback

## Overview

Connect your IPTV service (Xtream Codes compatible) to this app, replacing the mock TMDB data browsing with actual playable content. When you click play, the stream URL is sent to your headless Kodi.

## Architecture

```text
+------------------+     +------------------+     +------------------+
|   hafo App       |     |  Edge Function   |     |  IPTV Provider   |
|  (This UI)       | --> |  (Proxy/Auth)    | --> |  Xtream Codes    |
+------------------+     +------------------+     +------------------+
         |                                               |
         |  (play command)                               |
         v                                               |
+------------------+                                     |
|  Kodi Instance   | <-----------------------------------+
|  (Headless)      |       (stream URL)
+------------------+
```

## Data Flow

1. **Browse**: App fetches VOD categories and content from your IPTV provider via Xtream Codes API
2. **Match Metadata**: Combine IPTV content data with TMDB metadata for rich posters/descriptions
3. **Play**: When you click play, app sends the stream URL to Kodi via JSON-RPC

## Implementation Plan

### Phase 1: IPTV Settings & Connection

**New Files:**
| File | Purpose |
|------|---------|
| `src/services/iptvService.ts` | Xtream Codes API client |
| `src/hooks/useIPTV.ts` | React Query hooks for IPTV data |
| `src/contexts/IPTVContext.tsx` | Store IPTV credentials & connection state |
| `src/components/settings/IPTVSettings.tsx` | Settings UI for IPTV credentials |
| `supabase/functions/iptv/index.ts` | Edge function proxy (avoids CORS, protects credentials) |

**Settings Panel:**
- IPTV Server URL (e.g., `http://provider.com:8080`)
- Username
- Password
- Test Connection button
- Credentials stored in browser localStorage (or optionally in user profiles table)

### Phase 2: Xtream Codes API Integration

The Xtream Codes API provides these endpoints (all via GET):

| Endpoint | Returns |
|----------|---------|
| `player_api.php?username=X&password=Y&action=get_vod_categories` | Movie categories |
| `player_api.php?username=X&password=Y&action=get_series_categories` | Series categories |
| `player_api.php?username=X&password=Y&action=get_vod_streams&category_id=ID` | Movies in category |
| `player_api.php?username=X&password=Y&action=get_series&category_id=ID` | Series in category |
| `player_api.php?username=X&password=Y&action=get_series_info&series_id=ID` | Series details with episodes |
| `player_api.php?username=X&password=Y&action=get_live_categories` | Live TV categories |
| `player_api.php?username=X&password=Y&action=get_live_streams` | Live TV channels |

**Stream URLs:**
- Movies: `http://provider:port/movie/username/password/stream_id.ext`
- Series: `http://provider:port/series/username/password/stream_id.ext`
- Live: `http://provider:port/username/password/stream_id.ext`

### Phase 3: Content Matching Strategy

Your IPTV provider returns content with limited metadata. We'll enhance it:

**IPTV Response Example (movie):**
```json
{
  "stream_id": 12345,
  "name": "The White Lotus S01E01",
  "container_extension": "mkv",
  "stream_icon": "http://...",
  "tmdb_id": "110316",  // Some providers include this!
  "rating": "8.5"
}
```

**Matching Logic:**
1. If provider includes `tmdb_id` → use directly for TMDB metadata
2. Else → fuzzy match by title + year against TMDB search
3. Cache matches to avoid repeated lookups

### Phase 4: Kodi Integration

**New Files:**
| File | Purpose |
|------|---------|
| `src/services/kodiService.ts` | Kodi JSON-RPC client |
| `src/components/settings/KodiSettings.tsx` | Settings for Kodi IP/port |

**Kodi JSON-RPC Commands:**

```typescript
// Play a video URL on Kodi
const playOnKodi = async (streamUrl: string) => {
  const response = await fetch(`http://${kodiIp}:${kodiPort}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'Player.Open',
      params: {
        item: { file: streamUrl }
      },
      id: 1
    })
  });
  return response.json();
};
```

**Note:** CORS may require this to go through an edge function proxy, OR you configure Kodi's web interface to allow cross-origin requests.

### Phase 5: Update UI Components

**Modify Existing Files:**

| File | Changes |
|------|---------|
| `src/data/watchContent.ts` | Add `streamUrl` and `iptvId` to `WatchContent` interface |
| `src/components/watch/ContentDetail.tsx` | Wire Play button to Kodi playback |
| `src/components/content/MoviesContent.tsx` | Option to switch between TMDB browse and IPTV library |
| `src/components/content/SeriesContent.tsx` | Same - IPTV series with episodes |
| `src/pages/TV.tsx` | Replace mock channels with IPTV live streams |

**Updated WatchContent Interface:**
```typescript
export interface WatchContent {
  id: string;
  title: string;
  type: 'movie' | 'series';
  // ... existing fields ...
  
  // New IPTV fields
  iptvId?: number;           // Xtream stream_id
  streamUrl?: string;        // Direct stream URL
  containerExtension?: string; // mkv, mp4, etc.
}
```

## Files to Create/Modify

### New Files
| File | Description |
|------|-------------|
| `src/services/iptvService.ts` | Xtream Codes API wrapper |
| `src/services/kodiService.ts` | Kodi JSON-RPC wrapper |
| `src/hooks/useIPTV.ts` | React Query hooks for IPTV VOD & Live |
| `src/contexts/IPTVContext.tsx` | IPTV connection state & credentials |
| `src/components/settings/IPTVSettings.tsx` | IPTV configuration UI |
| `src/components/settings/KodiSettings.tsx` | Kodi configuration UI |
| `supabase/functions/iptv/index.ts` | Edge function proxy for IPTV API |
| `supabase/functions/kodi/index.ts` | Edge function proxy for Kodi (if needed for CORS) |

### Modified Files
| File | Changes |
|------|---------|
| `src/data/watchContent.ts` | Add IPTV fields to interfaces |
| `src/components/watch/ContentDetail.tsx` | Connect Play button to Kodi |
| `src/components/SettingsModal.tsx` | Add IPTV and Kodi settings tabs |
| `src/pages/TV.tsx` | Use IPTV live streams instead of mock data |
| `src/data/tvChannels.ts` | May become generated from IPTV data |

## User Flow

1. **First Setup:**
   - Open Settings → IPTV
   - Enter server URL, username, password
   - Click "Test Connection"
   - Open Settings → Kodi
   - Enter Kodi IP and port
   - Click "Test Connection"

2. **Browsing:**
   - Movies/Series modes show your IPTV library
   - Enhanced with TMDB posters and descriptions
   - Search works across your IPTV content

3. **Playback:**
   - Click any movie/episode
   - Click Play
   - Stream starts on your Kodi

## Security Considerations

- IPTV credentials stored in localStorage (client-side only)
- Edge function proxies requests to avoid exposing credentials in browser network tab
- Kodi typically runs on local network (same subnet as browser)

## Technical Notes

- **CORS for IPTV**: Xtream providers don't allow browser CORS → must proxy through edge function
- **CORS for Kodi**: Local Kodi may work directly if on same network; otherwise proxy through edge function
- **Caching**: Cache IPTV responses (categories, content lists) with React Query for fast UI
- **TMDB Matching**: Use existing TMDB service for metadata enrichment
