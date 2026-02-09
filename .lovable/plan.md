
# Fix IPTV: Stream Failures and Data Loading

## Diagnosis (3 issues found)

### Issue 1: CORS crash kills entire catalog load
Some IPTV categories have responses large enough to crash the edge function mid-stream (`connection closed before message completed`). When this happens, no CORS headers are returned, causing a browser CORS error. Even though individual category fetches have `.catch(() => [])`, the Supabase client throws a CORS-level error that may not be caught properly by the Promise.all.

### Issue 2: Mixed Content Blocking (stream playback)
Stream URLs are built as `http://freeiptv.ottc.xyz:80/movie/...` but the app runs on HTTPS. Browsers block HTTP resources loaded from HTTPS pages. This is why every stream says "failed" -- the video element can never connect.

### Issue 3: Edge function streams body without buffering, but crashes on large responses
The current streaming approach (`return new Response(response.body, ...)`) still fails on very large categories because the edge function connection times out or runs out of resources while proxying.

## Solution

### Fix 1: Make edge function more resilient (`supabase/functions/iptv/index.ts`)
- Add a timeout to the upstream fetch (15 seconds)
- If the response is too large, return an empty array rather than crashing
- Read the body as text and forward it (instead of streaming) for category-level requests which are smaller

### Fix 2: Fix `callIPTVProxy` error handling (`src/services/iptvService.ts`)
- Wrap the supabase.functions.invoke call to catch network/CORS errors and return empty arrays
- Add explicit try/catch in the service layer so CORS failures don't propagate as unhandled rejections

### Fix 3: Fix stream URL protocol (`src/services/iptvService.ts`)
- Change `buildVodStreamUrl`, `buildSeriesStreamUrl`, and `buildLiveStreamUrl` to NOT hardcode HTTP
- Instead, proxy streams through the edge function OR use the protocol from the server URL as-is
- Since the IPTV server only serves HTTP, the best solution is to proxy the stream through the IPTV edge function (which runs on HTTPS)

### Fix 4: Add stream proxy endpoint to edge function (`supabase/functions/iptv/index.ts`)
- Add a new action `proxy_stream` that takes a stream URL and proxies the video data through the HTTPS edge function
- This solves the mixed content problem by serving video over HTTPS
- The edge function streams the video body directly (no buffering needed for streaming media)

### Fix 5: Update stream URL builders (`src/services/iptvService.ts`)
- Change all `build*StreamUrl` functions to return a URL that goes through the edge function proxy
- Format: `https://<supabase-url>/functions/v1/iptv?action=proxy_stream&url=<encoded-stream-url>`
- Actually, since the edge function uses POST, build the URL as a data object that StreamPlayer can use

Alternative for Fix 3-5 (simpler): Instead of proxying video through the edge function (which would hit memory limits for video), we can use the IPTV server URL directly but the player needs to handle this. Since the video is loaded by a `<video>` element (not fetch), mixed content *may* work depending on browser settings, BUT most modern browsers still block it.

**Simplest viable approach**: Build stream URLs using the IPTV server's own protocol but ensure it works. If the server supports HTTPS, use that. Otherwise, we need to accept HTTP-only playback works only in non-HTTPS contexts.

Let me check: the IPTV server is `http://freeiptv.ottc.xyz:80` -- it likely doesn't support HTTPS. Proxying entire video streams through an edge function is impractical (memory/timeout limits). 

**Revised approach for streaming**: The `<video>` element loading HTTP sources on HTTPS pages IS blocked by browsers. The practical fix is to note this limitation and, for now, focus on getting the catalog loading and matching working correctly. For playback, we need to either:
- Accept it won't work on HTTPS-served pages (production limitation)
- Or add a lightweight proxy that just forwards chunks

For the immediate fix, let's focus on what we CAN solve:

## Revised Plan

### Step 1: Fix edge function resilience (`supabase/functions/iptv/index.ts`)
- Read the upstream response body as text (not stream) for API calls
- Add a 20-second timeout on upstream fetch
- Limit response size: if body exceeds 5MB, return empty array
- This prevents the `connection closed` crash

### Step 2: Fix error handling in service layer (`src/services/iptvService.ts`)
- Make `callIPTVProxy` return `null` or throw a clean error on CORS/network failures
- The `.catch(() => [])` in `useIPTVLibrary.ts` already handles this, but the error path needs to be cleaner

### Step 3: Fix stream URLs for mixed content (`src/services/iptvService.ts`)  
- Update `buildVodStreamUrl` and `buildSeriesStreamUrl` to construct URLs that go through the edge function as a stream proxy
- Add a new `proxy_stream` action to the edge function that forwards video data
- The edge function will stream the response body directly without buffering the entire video

### Step 4: Add debug logging (`src/hooks/useIPTVLibrary.ts`)
- After maps are built, log how many TMDB titles matched vs total
- Log sample matched titles so we can verify the matching is working

## Technical Details

### Edge function changes (`supabase/functions/iptv/index.ts`)
```typescript
// Add timeout to upstream fetch
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 20000);

const response = await fetch(apiUrl, {
  signal: controller.signal,
  headers: { 'User-Agent': '...' },
});
clearTimeout(timeout);

// For API calls, read as text to avoid streaming issues
if (action !== 'proxy_stream') {
  const text = await response.text();
  return new Response(text, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// New: proxy_stream action - stream video through HTTPS
if (action === 'proxy_stream') {
  const streamUrl = /* from request body */;
  const videoResponse = await fetch(streamUrl);
  return new Response(videoResponse.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
    },
  });
}
```

### Service layer changes (`src/services/iptvService.ts`)
```typescript
// Update stream URL builders to use proxy
export function buildVodStreamUrl(credentials: IPTVCredentials, streamId: number, extension: string): string {
  const baseUrl = credentials.serverUrl.replace(/\/$/, '');
  const directUrl = `${baseUrl}/movie/${credentials.username}/${credentials.password}/${streamId}.${extension}`;
  // Return the proxy URL through the edge function
  return directUrl; // StreamPlayer will use proxy
}
```

### Stream player proxy approach
- Add a `proxy_stream` action to the edge function
- StreamPlayer calls the edge function with the stream URL
- Edge function fetches the HTTP video and serves it over HTTPS
- This uses response body streaming (no buffering) so memory isn't an issue

### Files to modify

| File | Change |
|------|--------|
| `supabase/functions/iptv/index.ts` | Add timeout, read body as text for API calls, add `proxy_stream` action |
| `src/services/iptvService.ts` | Update stream URL builders to go through edge function proxy |
| `src/hooks/useIPTVLibrary.ts` | Add debug logging for match rates |
