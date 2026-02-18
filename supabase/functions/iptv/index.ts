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
      const videoResponse = await fetch(streamUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      if (!videoResponse.ok) {
        return new Response(`Stream fetch failed: ${videoResponse.status}`, {
          status: videoResponse.status,
          headers: corsHeaders,
        });
      }

      const contentType = videoResponse.headers.get('Content-Type') || 'video/mp4';
      const contentLength = videoResponse.headers.get('Content-Length');
      const responseHeaders: Record<string, string> = { ...corsHeaders, 'Content-Type': contentType };
      if (contentLength) responseHeaders['Content-Length'] = contentLength;

      return new Response(videoResponse.body, { headers: responseHeaders });
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

      const videoResponse = await fetch(streamUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      if (!videoResponse.ok) {
        return new Response(
          JSON.stringify({ error: `Stream fetch failed: ${videoResponse.status}` }),
          { status: videoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const contentType = videoResponse.headers.get('Content-Type') || 'video/mp4';
      const contentLength = videoResponse.headers.get('Content-Length');

      const responseHeaders: Record<string, string> = {
        ...corsHeaders,
        'Content-Type': contentType,
      };
      if (contentLength) {
        responseHeaders['Content-Length'] = contentLength;
      }

      // Stream the video body directly — no buffering
      return new Response(videoResponse.body, { headers: responseHeaders });
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
