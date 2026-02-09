

# Fix Stream Playback: Two Bugs Preventing Video

## Bug 1: Player Never Opens (ContentDetail.tsx, line 118)

The fullscreen player render condition checks `content.streamUrl` (the original, unenriched prop which is always `undefined`) instead of `iptvContent.streamUrl` (the enriched version with the actual stream URL).

```
// Current (broken):
if (isPlayerOpen && content.streamUrl) {

// Fixed:
if (isPlayerOpen && iptvContent.streamUrl) {
```

This single-character fix is why the player never appears -- the condition is always false.

## Bug 2: StreamPlayer Treats Proxy URL as HLS (StreamPlayer.tsx, line 44)

The proxy URL format is:
```
https://dvhjyyjzxmbtvrfbbgcr.supabase.co/functions/v1/iptv?apikey=...&streamUrl=...
```

The current HLS detection logic `!streamUrl.match(/\.\w{2,4}$/)` sees no file extension at the end of this URL (it ends with query params), so it assumes HLS and tries to load it via hls.js. But this is actually a direct video proxy that returns mp4/mkv data.

**Fix**: Check the *original* stream URL (inside the `streamUrl` query param) for its extension, or detect that it's a proxy URL and treat it as direct video.

The simplest approach: extract the inner URL's extension from the proxy URL to determine the content type, and only use HLS for actual `.m3u8` URLs.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/watch/ContentDetail.tsx` | Line 118: change `content.streamUrl` to `iptvContent.streamUrl` |
| `src/components/player/StreamPlayer.tsx` | Fix HLS detection to check for `.m3u8` explicitly rather than defaulting to HLS when no extension found |

## Technical Details

### StreamPlayer HLS Detection Fix

```typescript
// Current (broken):
const isHls = streamUrl.includes('.m3u8') || !streamUrl.match(/\.\w{2,4}$/);

// Fixed - only treat as HLS if URL explicitly contains .m3u8:
const isHls = streamUrl.includes('.m3u8');
```

This is safe because:
- Real HLS streams always have `.m3u8` somewhere in the URL
- Proxy URLs and direct mp4/mkv URLs should use the native `<video>` element
- The proxy edge function already sets the correct `Content-Type` header
