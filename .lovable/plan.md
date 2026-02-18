
# Fix: Debug & Diagnose IPTV 404 Stream Failures

## Root Cause (Confirmed from Logs)

The edge function logs show clearly:
```
IPTV API Request: action=get_vod_categories
IPTV API Error: 404 Not Found
```

The IPTV server at `http://freeiptv.ottc.xyz:80` is returning 404 when the edge function calls:
```
http://freeiptv.ottc.xyz:80/player_api.php?username=850832714335&password=641859008374&action=get_vod_categories
```

This is **not a code bug** - the IPTV provider's server is rejecting the request. This can happen because:
- The subscription has expired
- The server URL has changed
- Max simultaneous connections reached
- The `player_api.php` endpoint path is different for this provider

The current code already handles 404 gracefully (returns empty array), but then no content gets matched and no stream URL is ever built - so clicking Play correctly shows "No stream available."

## What Needs to Change

### 1. Log the Full API URL in the Edge Function
Currently the edge function only logs the action name, not the full URL it constructs. We need to log the complete URL (with credentials masked) so we can diagnose what endpoint is being hit.

**File: `supabase/functions/iptv/index.ts`**

Add a log line showing the actual URL being fetched (masking the password for security):
```typescript
const maskedUrl = apiUrl.replace(encodeURIComponent(password), '***');
console.log(`IPTV Fetching: ${maskedUrl}`);
```

### 2. Add a Detailed Connection Test in the Settings UI
The Settings modal's "Test Connection" button exists but only shows "Connection failed." It doesn't tell the user:
- What exact URL was attempted
- What HTTP status came back
- Whether credentials are valid vs. server is wrong

**File: `src/components/settings/IPTVSettings.tsx`**

Enhance the test result panel to show:
- The server URL being tested
- The status code returned (404 = wrong URL, 401 = bad credentials, 200 = working)
- A clear message explaining what to fix

### 3. Add a "Diagnostic URL" Display in Settings
Show the user the exact `player_api.php` URL that will be called, so they can paste it into a browser to verify it works manually. This is the fastest way to confirm credentials and server URL are correct.

**File: `src/components/settings/IPTVSettings.tsx`**

Add a collapsible "Advanced / Diagnostics" section showing:
```
API Endpoint: http://your-server/player_api.php?username=***&password=***&action=get_user_info
```
With a copy button so the user can test it in a browser tab directly.

### 4. Add a Stream URL Debug Log When Play is Clicked
In `ContentDetail.tsx`, when play is clicked, log the full resolved stream URL to the console so we can verify the URL format is correct.

**File: `src/components/watch/ContentDetail.tsx`**

```typescript
const handlePlay = () => {
  console.log('[StreamDebug] iptvContent:', {
    title: iptvContent.title,
    iptvId: iptvContent.iptvId,
    streamUrl: iptvContent.streamUrl,
  });
  // ... existing logic
};
```

### 5. Add Range Request Support to the Stream Proxy
The current stream proxy does not forward `Range` headers from the browser. Video elements use HTTP range requests to seek within a video. Without range support, the video may load but seeking fails, or some players refuse to play at all.

**File: `supabase/functions/iptv/index.ts`**

Forward the `Range` header from the client to the upstream IPTV server, and pass back the `Accept-Ranges`, `Content-Range`, and `206` status from the upstream response.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/iptv/index.ts` | Log full masked URL; forward Range headers for video seeking |
| `src/components/settings/IPTVSettings.tsx` | Show diagnostic URL, clearer error messages with HTTP status |
| `src/components/watch/ContentDetail.tsx` | Console log stream URL on play for debugging |

## Technical Details

### Range Request Forwarding (Edge Function)

```typescript
// In GET handler for stream proxying:
const rangeHeader = req.headers.get('Range');
const upstreamHeaders: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0...',
};
if (rangeHeader) {
  upstreamHeaders['Range'] = rangeHeader;
}

const videoResponse = await fetch(streamUrl, { headers: upstreamHeaders });

// Forward 206 Partial Content status back:
const responseHeaders = {
  ...corsHeaders,
  'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
  'Accept-Ranges': 'bytes',
};
const rangeResponse = videoResponse.headers.get('Content-Range');
if (rangeResponse) responseHeaders['Content-Range'] = rangeResponse;
const contentLength = videoResponse.headers.get('Content-Length');
if (contentLength) responseHeaders['Content-Length'] = contentLength;

return new Response(videoResponse.body, {
  status: videoResponse.status, // preserve 206
  headers: responseHeaders,
});
```

### Diagnostic URL Display

The diagnostic panel will construct and display:
```
http://freeiptv.ottc.xyz:80/player_api.php?username=850832714335&password=***&action=get_user_info
```

This lets the user open it in a browser tab to instantly confirm whether the server/credentials are valid independently of the app.

## Expected Outcome

After these changes:
1. The edge function logs will show the exact URL being fetched, making future debugging immediate
2. The Settings panel will show the user exactly what URL is being tested and what went wrong
3. The user can copy the diagnostic URL and paste it in a browser to confirm their IPTV provider is working
4. Range requests will be forwarded, enabling proper video seeking once a working stream is found
5. Debug logs in the console will confirm whether stream URLs are being built correctly
