import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
  if (!TMDB_API_KEY) {
    return new Response(
      JSON.stringify({ error: "TMDB_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    const page = url.searchParams.get("page") || "1";
    const query = url.searchParams.get("query") || "";
    const id = url.searchParams.get("id");

    let tmdbUrl = "";

    switch (endpoint) {
      case "popular-movies":
        tmdbUrl = `${TMDB_BASE_URL}/movie/popular?page=${page}`;
        break;
      case "popular-series":
        tmdbUrl = `${TMDB_BASE_URL}/tv/popular?page=${page}`;
        break;
      case "trending":
        tmdbUrl = `${TMDB_BASE_URL}/trending/all/week?page=${page}`;
        break;
      case "trending-movies":
        tmdbUrl = `${TMDB_BASE_URL}/trending/movie/week?page=${page}`;
        break;
      case "trending-series":
        tmdbUrl = `${TMDB_BASE_URL}/trending/tv/week?page=${page}`;
        break;
      case "top-rated-movies":
        tmdbUrl = `${TMDB_BASE_URL}/movie/top_rated?page=${page}`;
        break;
      case "top-rated-series":
        tmdbUrl = `${TMDB_BASE_URL}/tv/top_rated?page=${page}`;
        break;
      case "now-playing":
        tmdbUrl = `${TMDB_BASE_URL}/movie/now_playing?page=${page}`;
        break;
      case "on-the-air":
        tmdbUrl = `${TMDB_BASE_URL}/tv/on_the_air?page=${page}`;
        break;
      case "movie-details":
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Movie ID required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/movie/${id}?append_to_response=credits,similar`;
        break;
      case "series-details":
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Series ID required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/tv/${id}?append_to_response=credits,similar`;
        break;
      case "search":
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Search query required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case "genres-movie":
        tmdbUrl = `${TMDB_BASE_URL}/genre/movie/list`;
        break;
      case "genres-tv":
        tmdbUrl = `${TMDB_BASE_URL}/genre/tv/list`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Use API key as query parameter (v3 method - more reliable)
    const separator = tmdbUrl.includes('?') ? '&' : '?';
    const urlWithKey = `${tmdbUrl}${separator}api_key=${TMDB_API_KEY}`;

    const response = await fetch(urlWithKey, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TMDB API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "TMDB API error", status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error("Error in TMDB function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
