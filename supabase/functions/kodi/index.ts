import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface KodiRequest {
  kodiHost: string;
  kodiPort: number;
  kodiUsername?: string;
  kodiPassword?: string;
  method: string;
  params?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { kodiHost, kodiPort, kodiUsername, kodiPassword, method, params }: KodiRequest = await req.json();

    if (!kodiHost || !kodiPort || !method) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: kodiHost, kodiPort, method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the Kodi JSON-RPC URL
    const kodiUrl = `http://${kodiHost}:${kodiPort}/jsonrpc`;

    // Build request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add basic auth if credentials provided
    if (kodiUsername && kodiPassword) {
      const auth = btoa(`${kodiUsername}:${kodiPassword}`);
      headers['Authorization'] = `Basic ${auth}`;
    }

    // Build JSON-RPC request
    const rpcRequest = {
      jsonrpc: '2.0',
      method,
      params: params || {},
      id: 1,
    };

    console.log(`Kodi JSON-RPC Request: method=${method}`);

    // Make the request to Kodi
    const response = await fetch(kodiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(rpcRequest),
    });

    if (!response.ok) {
      console.error(`Kodi API Error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `Kodi API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Check for JSON-RPC error
    if (data.error) {
      console.error('Kodi JSON-RPC error:', data.error);
      return new Response(
        JSON.stringify({ error: data.error.message || 'Kodi error', details: data.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result: data.result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Kodi proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Check if it's a connection error (Kodi not reachable)
    if (errorMessage.includes('error trying to connect') || errorMessage.includes('Connection refused')) {
      return new Response(
        JSON.stringify({ error: 'Cannot connect to Kodi. Make sure Kodi is running and the web server is enabled.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
