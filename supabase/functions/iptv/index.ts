import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface IPTVRequest {
  serverUrl: string;
  username: string;
  password: string;
  action: string;
  categoryId?: string;
  seriesId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serverUrl, username, password, action, categoryId, seriesId }: IPTVRequest = await req.json();

    if (!serverUrl || !username || !password || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: serverUrl, username, password, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the Xtream Codes API URL
    const baseUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
    let apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;

    // Add optional parameters
    if (categoryId) {
      apiUrl += `&category_id=${encodeURIComponent(categoryId)}`;
    }
    if (seriesId) {
      apiUrl += `&series_id=${encodeURIComponent(seriesId)}`;
    }

    console.log(`IPTV API Request: action=${action}, categoryId=${categoryId || 'none'}, seriesId=${seriesId || 'none'}`);

    // Make the request to the IPTV provider
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`IPTV API Error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `IPTV API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            server_info: data.server_info 
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

    // For large responses (streams lists), pass through the body directly without buffering
    return new Response(response.body, {
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
