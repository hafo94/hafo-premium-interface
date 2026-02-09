

# Browser-Based IPTV Playback (No Kodi)

## Overview

Replace the headless Kodi playback model with a fully in-browser media player. The app will use the existing IPTV credentials (Xtream Codes API) to fetch live channels, VOD, and series -- then play streams directly in an HTML5 video element using HLS.js.

## What Changes

### 1. Add HLS.js Dependency

Install `hls.js` -- a JavaScript library that enables HLS (HTTP Live Streaming) playback in browsers. Most IPTV providers serve streams in HLS format, and this library handles the protocol natively in any modern browser.

### 2. New Component: `StreamPlayer`

Create `src/components/player/StreamPlayer.tsx` -- a reusable in-browser video player that:

- Accepts a stream URL (built from IPTV credentials + stream ID)
- Uses HLS.js to load and play `.m3u8` streams
- Falls back to native `<video>` for `.mp4` / `.ts` direct URLs
- Provides controls: play/pause, volume, mute, fullscreen, progress bar
- Shows loading/buffering states and error handling
- Supports keyboard shortcuts (Space, M, F, Escape) matching the current TVPlayer UX
- Displays channel info overlay that auto-hides after 4 seconds (same pattern as current TVPlayer)

### 3. Rewire the TV Page to Use Real IPTV Data

Currently `src/pages/TV.tsx` uses hardcoded channels from `src/data/tvChannels.ts`. We will:

- Replace the hardcoded channel list with data from the `useLiveCategories()` and `useLiveStreams()` hooks (already built in `src/hooks/useIPTV.ts`)
- Map `IPTVLiveStream` data to a format the `LiveTVHome` component can display
- When a channel is selected, build the stream URL using `buildLiveStreamUrl()` from `iptvService.ts` and pass it to the new `StreamPlayer`
- Show a "Connect IPTV" prompt if no credentials are configured, linking to Settings

### 4. Update TVPlayer to Use StreamPlayer

Replace the current placeholder gradient background in `TVPlayer` with the actual `StreamPlayer` component:

- Pass `buildLiveStreamUrl(credentials, channel.stream_id)` as the stream source
- Keep all existing overlay UI (back button, channel info, progress bar, controls)
- Wire play/pause/mute/volume controls to the actual video element
- Channel switching (PageUp/PageDown) rebuilds the stream URL and loads the new channel

### 5. Settings Flow Verification

The IPTV settings (`src/components/settings/IPTVSettings.tsx`) already:
- Accepts server URL, username, password
- Saves to localStorage via `IPTVContext`
- Has a "Test Connection" button that calls the `iptv` edge function

We will verify this works by:
- Ensuring the edge function proxy correctly forwards the `get_user_info` action
- Confirming that after a successful test, `iptvConnected` is set to `true`
- Making the TV page reactive to connection state changes

### 6. Remove Kodi Tab from Settings (Optional)

Since this remix is browser-only, the Kodi settings tab can be hidden or removed from the Settings modal. The Kodi service code can remain but won't be used.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `hls.js` dependency |
| `src/components/player/StreamPlayer.tsx` | Create | New HLS-capable video player component |
| `src/components/tv/TVPlayer.tsx` | Modify | Replace placeholder with StreamPlayer, wire real controls |
| `src/components/tv/LiveTVHome.tsx` | Modify | Use IPTV hooks instead of hardcoded tvChannels |
| `src/pages/TV.tsx` | Modify | Use IPTV data, show connect prompt if no credentials |
| `src/components/SettingsModal.tsx` | Modify | Remove Kodi tab (browser-only version) |

## Technical Details

### HLS.js Integration Pattern

```typescript
import Hls from 'hls.js';

// In StreamPlayer component:
useEffect(() => {
  if (!videoRef.current || !streamUrl) return;

  if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(streamUrl);
    hls.attachMedia(videoRef.current);
    hls.on(Hls.Events.MANIFEST_PARSED, () => videoRef.current?.play());
    return () => hls.destroy();
  } else {
    // Direct URL (mp4, ts) -- native playback
    videoRef.current.src = streamUrl;
    videoRef.current.play();
  }
}, [streamUrl]);
```

### Stream URL Construction

IPTV streams from Xtream Codes use these URL patterns (already defined in `iptvService.ts`):
- Live: `http://server/username/password/streamId` (usually outputs HLS or TS)
- VOD: `http://server/movie/username/password/streamId.mp4`
- Series: `http://server/series/username/password/streamId.mp4`

The edge function proxy is NOT needed for stream playback -- only for API calls. The video element loads the stream URL directly from the IPTV provider.

### IPTV Data Mapping

Map `IPTVLiveStream` to a display-friendly format:

```typescript
interface BrowserChannel {
  id: number;          // stream_id
  name: string;        // name
  icon: string;        // stream_icon
  category: string;    // category_id
  streamUrl: string;   // built from buildLiveStreamUrl()
  epgId: string;       // epg_channel_id
  hasArchive: boolean; // tv_archive > 0
}
```

### Error States to Handle

- No IPTV credentials configured: show "Connect your IPTV service in Settings"
- IPTV connected but stream fails to load: show error with retry button
- HLS.js not supported (rare): show message suggesting a compatible browser
- Network error during playback: auto-retry with exponential backoff (HLS.js handles this)

