import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB

interface IPTVRequest {
  serverUrl: string;
  username: string;
  password: string;
  action: string;
  categoryId?: string;
  seriesId?: string;
  streamUrl?: string; // For proxy_stream action
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests for stream proxying (video element uses GET)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const streamUrl = url.searchParams.get('streamUrl');
    
    if (!streamUrl) {
      return new Response('Missing streamUrl parameter', { status: 400, headers: corsHeaders });
    }

    console.log(`IPTV proxy_stream (GET): ${streamUrl.substring(0, 80)}...`);

    try {
      const rangeHeader = req.headers.get('Range');
      const upstreamHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };
      if (rangeHeader) upstreamHeaders['Range'] = rangeHeader;

      const videoResponse = await fetch(streamUrl, { headers: upstreamHeaders });

      if (!videoResponse.ok) {
        return new Response(`Stream fetch failed: ${videoResponse.status}`, {
          status: videoResponse.status,
          headers: corsHeaders,
        });
      }

      const contentType = videoResponse.headers.get('Content-Type') || 'video/mp4';
      const contentLength = videoResponse.headers.get('Content-Length');
      const contentRange = videoResponse.headers.get('Content-Range');
      const responseHeaders: Record<string, string> = {
        ...corsHeaders,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      };
      if (contentLength) responseHeaders['Content-Length'] = contentLength;
      if (contentRange) responseHeaders['Content-Range'] = contentRange;

      return new Response(videoResponse.body, { status: videoResponse.status, headers: responseHeaders });
    } catch (error) {
      console.error('Stream proxy error:', error);
      return new Response('Stream proxy error', { status: 502, headers: corsHeaders });
    }
  }

  try {
    const { serverUrl, username, password, action, categoryId, seriesId, streamUrl }: IPTVRequest = await req.json();

    // Handle proxy_stream action — streams video data through HTTPS
    if (action === 'proxy_stream') {
      if (!streamUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing streamUrl for proxy_stream' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`IPTV proxy_stream: ${streamUrl.substring(0, 80)}...`);

      const rangeHeader = req.headers.get('Range');
      const upstreamHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };
      if (rangeHeader) upstreamHeaders['Range'] = rangeHeader;

      const videoResponse = await fetch(streamUrl, { headers: upstreamHeaders });

      if (!videoResponse.ok) {
        return new Response(
          JSON.stringify({ error: `Stream fetch failed: ${videoResponse.status}` }),
          { status: videoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const contentType = videoResponse.headers.get('Content-Type') || 'video/mp4';
      const contentLength = videoResponse.headers.get('Content-Length');
      const contentRange = videoResponse.headers.get('Content-Range');

      const responseHeaders: Record<string, string> = {
        ...corsHeaders,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      };
      if (contentLength) responseHeaders['Content-Length'] = contentLength;
      if (contentRange) responseHeaders['Content-Range'] = contentRange;

      // Stream the video body directly — no buffering
      return new Response(videoResponse.body, { status: videoResponse.status, headers: responseHeaders });
    }

    // Fetch M3U playlist and parse into structured JSON
    if (action === 'fetch_m3u') {
      if (!serverUrl || !username || !password) {
        return new Response(
          JSON.stringify({ error: 'Missing credentials for M3U fetch' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const baseUrl = serverUrl.replace(/\/$/, '');
      // Xtream M3U URL for VOD
      const m3uType = streamUrl || 'vod'; // 'vod', 'series', 'live', or 'all'
      
      // Try multiple M3U URL formats
      const m3uUrls = [
        `${baseUrl}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=mpegts`,
        `${baseUrl}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=ts`,
        `${baseUrl}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus`,
        `${baseUrl}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      ];

      let m3uText = '';
      let fetchSuccess = false;

      for (const m3uUrl of m3uUrls) {
        console.log(`IPTV fetch_m3u: trying ${m3uUrl.replace(encodeURIComponent(password), '***')}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
          const m3uResponse = await fetch(m3uUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          });
          clearTimeout(timeout);

          if (m3uResponse.ok) {
            m3uText = await m3uResponse.text();
            if (m3uText.includes('#EXTINF') || m3uText.includes('#EXTM3U')) {
              fetchSuccess = true;
              console.log(`M3U success with URL format, size: ${(m3uText.length / 1024).toFixed(1)}KB`);
              break;
            }
            console.log(`M3U response not valid M3U format (${m3uText.substring(0, 100)})`);
          } else {
            console.log(`M3U URL returned ${m3uResponse.status}`);
          }
        } catch (e) {
          clearTimeout(timeout);
          console.log(`M3U URL failed: ${e}`);
        }
      }

      if (!fetchSuccess) {
        return new Response(
          JSON.stringify({ error: 'All M3U URL formats failed', entries: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse M3U into entries
      const entries: Array<{
        name: string;
        stream_id: number;
        stream_url: string;
        stream_icon: string;
        group_title: string;
        tvg_id: string;
        tvg_name: string;
        type: string;
      }> = [];

      const lines = m3uText.split('\n');
      let currentEntry: any = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
          const groupMatch = line.match(/group-title="([^"]*)"/);
          const logoMatch = line.match(/tvg-logo="([^"]*)"/);
          const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
          const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
          const titleMatch = line.match(/,(.+)$/);

          currentEntry = {
            name: titleMatch ? titleMatch[1].trim() : '',
            stream_icon: logoMatch ? logoMatch[1] : '',
            group_title: groupMatch ? groupMatch[1] : '',
            tvg_id: tvgIdMatch ? tvgIdMatch[1] : '',
            tvg_name: tvgNameMatch ? tvgNameMatch[1] : '',
          };
        } else if (line.startsWith('http') && currentEntry) {
          currentEntry.stream_url = line;

          if (line.includes('/movie/')) {
            currentEntry.type = 'movie';
          } else if (line.includes('/series/')) {
            currentEntry.type = 'series';
          } else {
            currentEntry.type = 'live';
          }

          const idMatch = line.match(/\/(\d+)\.\w+$/);
          currentEntry.stream_id = idMatch ? parseInt(idMatch[1]) : 0;

          if (m3uType === 'all' || currentEntry.type === m3uType) {
            entries.push(currentEntry);
          }
          currentEntry = null;
        }
      }

      console.log(`M3U parsed: ${entries.length} entries of type '${m3uType}' from ${lines.length} lines`);

      return new Response(
        JSON.stringify({ entries, total: entries.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular API actions
    if (!serverUrl || !username || !password || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: serverUrl, username, password, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = serverUrl.replace(/\/$/, '');
    let apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;

    if (categoryId) {
      apiUrl += `&category_id=${encodeURIComponent(categoryId)}`;
    }
    if (seriesId) {
      apiUrl += `&series_id=${encodeURIComponent(seriesId)}`;
    }

    const maskedUrl = apiUrl.replace(encodeURIComponent(password), '***');
    console.log(`IPTV Fetching: ${maskedUrl}`);
    console.log(`IPTV API Request: action=${action}, categoryId=${categoryId || 'none'}, seriesId=${seriesId || 'none'}`);

    // Add timeout to upstream fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        console.error(`IPTV API Timeout: action=${action}`);
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`IPTV API Error: ${response.status} ${response.statusText}`);
      // Always return 200 to the client so Supabase JS doesn't throw.
      // Return empty array for list actions, error object for auth.
      if (action === 'get_user_info' || action === 'authenticate') {
        return new Response(
          JSON.stringify({ success: false, error: `IPTV server error: ${response.status}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For auth checks, parse JSON to validate credentials
    if (action === 'get_user_info' || action === 'authenticate') {
      const data = await response.json();
      if (data.user_info && data.user_info.auth === 1) {
        return new Response(
          JSON.stringify({
            success: true,
            user_info: data.user_info,
            server_info: data.server_info,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication failed' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Read body as text (not stream) to avoid connection-closed crashes
    const text = await response.text();

    // If response is too large, return empty array to avoid CORS crashes
    if (text.length > MAX_RESPONSE_SIZE) {
      console.warn(`IPTV response too large (${(text.length / 1024 / 1024).toFixed(1)}MB) for action=${action}, returning empty array`);
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('IPTV proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
