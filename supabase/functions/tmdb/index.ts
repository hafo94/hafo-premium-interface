import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const CACHE_MAX_AGE_DAYS = 7;

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

    // Handle batch-imdb-ratings POST endpoint
    if (endpoint === "batch-imdb-ratings" && req.method === "POST") {
      const OMDB_API_KEY = Deno.env.get("OMDB_API_KEY");
      if (!OMDB_API_KEY) {
        return new Response(
          JSON.stringify({ error: "OMDB_API_KEY not configured" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const body = await req.json();
      const items: { tmdb_id: number; media_type: string }[] = (body.items || []).slice(0, 20);

      if (items.length === 0) {
        return new Response(
          JSON.stringify({ ratings: {} }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tmdbIds = items.map(i => i.tmdb_id);
      const cutoff = new Date(Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

      // 1. Check cache
      const { data: cached } = await supabase
        .from("imdb_ratings_cache")
        .select("*")
        .in("tmdb_id", tmdbIds)
        .gte("cached_at", cutoff);

      const cachedMap = new Map<string, any>();
      for (const row of (cached || [])) {
        cachedMap.set(`${row.tmdb_id}-${row.media_type}`, row);
      }

      const ratings: Record<number, { imdbRating: number | null; imdbId: string | null }> = {};

      // Populate from cache hits
      for (const row of (cached || [])) {
        ratings[row.tmdb_id] = {
          imdbRating: row.imdb_rating ? parseFloat(row.imdb_rating) : null,
          imdbId: row.imdb_id,
        };
      }

      // 2. Process cache misses
      const misses = items.filter(i => !cachedMap.has(`${i.tmdb_id}-${i.media_type}`));

      for (const item of misses) {
        try {
          // Get TMDB detail to find imdb_id
          let imdbId: string | null = null;
          if (item.media_type === "movie") {
            const tmdbRes = await fetch(
              `${TMDB_BASE_URL}/movie/${item.tmdb_id}?api_key=${TMDB_API_KEY}`
            );
            if (tmdbRes.ok) {
              const detail = await tmdbRes.json();
              imdbId = detail.imdb_id || null;
            } else {
              await tmdbRes.text(); // consume body
            }
          } else {
            const tmdbRes = await fetch(
              `${TMDB_BASE_URL}/tv/${item.tmdb_id}/external_ids?api_key=${TMDB_API_KEY}`
            );
            if (tmdbRes.ok) {
              const detail = await tmdbRes.json();
              imdbId = detail.imdb_id || null;
            } else {
              await tmdbRes.text();
            }
          }

          let imdbRating: number | null = null;
          let imdbVotes: string | null = null;

          if (imdbId) {
            const omdbRes = await fetch(
              `http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
            );
            if (omdbRes.ok) {
              const omdb = await omdbRes.json();
              const parsed = parseFloat(omdb.imdbRating);
              if (!isNaN(parsed)) {
                imdbRating = parsed;
                imdbVotes = omdb.imdbVotes || null;
              }
            } else {
              await omdbRes.text();
            }
          }

          // Store in cache (upsert)
          await supabase.from("imdb_ratings_cache").upsert({
            tmdb_id: item.tmdb_id,
            media_type: item.media_type,
            imdb_id: imdbId,
            imdb_rating: imdbRating,
            imdb_votes: imdbVotes,
            cached_at: new Date().toISOString(),
          });

          ratings[item.tmdb_id] = { imdbRating, imdbId };
        } catch (e) {
          console.error(`Failed to fetch IMDb rating for ${item.tmdb_id}:`, e);
          ratings[item.tmdb_id] = { imdbRating: null, imdbId: null };
        }
      }

      return new Response(
        JSON.stringify({ ratings }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        tmdbUrl = `${TMDB_BASE_URL}/tv/${id}?append_to_response=credits,similar,external_ids`;
        break;
      case "imdb-rating": {
        const imdbId = url.searchParams.get("imdb_id");
        if (!imdbId) {
          return new Response(
            JSON.stringify({ error: "IMDB ID required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const OMDB_API_KEY = Deno.env.get("OMDB_API_KEY");
        if (!OMDB_API_KEY) {
          return new Response(
            JSON.stringify({ error: "OMDB_API_KEY not configured" }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const omdbResponse = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
        if (!omdbResponse.ok) {
          return new Response(
            JSON.stringify({ error: "OMDb API error" }),
            { status: omdbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const omdbData = await omdbResponse.json();
        return new Response(
          JSON.stringify({ imdbRating: omdbData.imdbRating || "N/A", imdbVotes: omdbData.imdbVotes || "N/A" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
      case "discover-movies": {
        const genreId = url.searchParams.get("genre_id");
        if (!genreId) {
          return new Response(
            JSON.stringify({ error: "Genre ID required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
        break;
      }
      case "discover-series": {
        const genreId = url.searchParams.get("genre_id");
        if (!genreId) {
          return new Response(
            JSON.stringify({ error: "Genre ID required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/discover/tv?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
        break;
      }
      case "search-person":
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Search query required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case "search-tv":
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Search query required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case "person-credits":
        if (!id) {
          return new Response(
            JSON.stringify({ error: "Person ID required" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/person/${id}/combined_credits`;
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
