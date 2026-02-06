import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { tmdbService, TMDBPerson, TMDBPersonCredits, IMDBRating } from "@/services/tmdbService";
import { 
  transformTMDBMovie, 
  transformTMDBSeries, 
  transformTMDBSearchResult,
  transformTMDBMovieDetails,
  transformTMDBSeriesDetails 
} from "@/services/tmdbTransformer";
import { WatchContent } from "@/data/watchContent";
import { getMovieGenreTmdbId, getSeriesGenreTmdbId } from "@/data/genreConfig";

// Cache times
const STALE_TIME = 1000 * 60 * 15; // 15 minutes
const DETAILS_STALE_TIME = 1000 * 60 * 60; // 1 hour

export const usePopularMovies = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "popular-movies", page],
    queryFn: async () => {
      const response = await tmdbService.getPopularMovies(page);
      return response.results.map(transformTMDBMovie);
    },
    staleTime: STALE_TIME,
  });
};

export const usePopularSeries = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "popular-series", page],
    queryFn: async () => {
      const response = await tmdbService.getPopularSeries(page);
      return response.results.map(transformTMDBSeries);
    },
    staleTime: STALE_TIME,
  });
};

export const useTrendingMovies = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "trending-movies", page],
    queryFn: async () => {
      const response = await tmdbService.getTrendingMovies(page);
      return response.results.map(transformTMDBMovie);
    },
    staleTime: STALE_TIME,
  });
};

export const useTrendingSeries = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "trending-series", page],
    queryFn: async () => {
      const response = await tmdbService.getTrendingSeries(page);
      return response.results.map(transformTMDBSeries);
    },
    staleTime: STALE_TIME,
  });
};

export const useTopRatedMovies = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "top-rated-movies", page],
    queryFn: async () => {
      const response = await tmdbService.getTopRatedMovies(page);
      return response.results.map(transformTMDBMovie);
    },
    staleTime: STALE_TIME,
  });
};

export const useTopRatedSeries = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "top-rated-series", page],
    queryFn: async () => {
      const response = await tmdbService.getTopRatedSeries(page);
      return response.results.map(transformTMDBSeries);
    },
    staleTime: STALE_TIME,
  });
};

export const useNowPlayingMovies = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "now-playing", page],
    queryFn: async () => {
      const response = await tmdbService.getNowPlaying(page);
      return response.results.map(transformTMDBMovie);
    },
    staleTime: STALE_TIME,
  });
};

export const useOnTheAirSeries = (page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "on-the-air", page],
    queryFn: async () => {
      const response = await tmdbService.getOnTheAir(page);
      return response.results.map(transformTMDBSeries);
    },
    staleTime: STALE_TIME,
  });
};

export const useMovieDetails = (id: number | undefined) => {
  return useQuery({
    queryKey: ["tmdb", "movie-details", id],
    queryFn: async () => {
      if (!id) throw new Error("Movie ID required");
      const response = await tmdbService.getMovieDetails(id);
      const content = transformTMDBMovieDetails(response);
      
      // Fetch IMDB rating if imdb_id is available
      if (content.imdbId) {
        try {
          const imdbData = await tmdbService.getIMDBRating(content.imdbId);
          const parsed = parseFloat(imdbData.imdbRating);
          if (!isNaN(parsed)) {
            content.imdbRating = parsed;
          }
        } catch (e) {
          console.warn("Failed to fetch IMDB rating:", e);
        }
      }
      
      return content;
    },
    enabled: !!id,
    staleTime: DETAILS_STALE_TIME,
  });
};

export const useSeriesDetails = (id: number | undefined) => {
  return useQuery({
    queryKey: ["tmdb", "series-details", id],
    queryFn: async () => {
      if (!id) throw new Error("Series ID required");
      const response = await tmdbService.getSeriesDetails(id);
      const content = transformTMDBSeriesDetails(response);
      
      // Fetch IMDB rating if imdb_id is available
      if (content.imdbId) {
        try {
          const imdbData = await tmdbService.getIMDBRating(content.imdbId);
          const parsed = parseFloat(imdbData.imdbRating);
          if (!isNaN(parsed)) {
            content.imdbRating = parsed;
          }
        } catch (e) {
          console.warn("Failed to fetch IMDB rating:", e);
        }
      }
      
      return content;
    },
    enabled: !!id,
    staleTime: DETAILS_STALE_TIME,
  });
};

export const useTMDBSearch = (
  query: string, 
  page = 1,
  mediaFilter: 'movie' | 'tv' | 'all' = 'all'
) => {
  return useQuery({
    queryKey: ["tmdb", "search", query, page, mediaFilter],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // Optimize: only fetch relevant data based on filter
      let multiResults: any[] = [];
      let tvResults: any[] = [];
      
      if (mediaFilter === 'movie') {
        // Only search movies via multi-search and filter
        const response = await tmdbService.searchContent(query, page);
        multiResults = response.results.filter(r => r.media_type === 'movie');
      } else if (mediaFilter === 'tv') {
        // Only search TV
        const response = await tmdbService.searchTV(query, page);
        tvResults = response.results.map(tv => ({
          ...tv,
          media_type: 'tv' as const,
          popularity: tv.popularity,
        }));
      } else {
        // Search all (existing behavior)
        const [multiResponse, tvResponse] = await Promise.all([
          tmdbService.searchContent(query, page),
          tmdbService.searchTV(query, page),
        ]);
        multiResults = multiResponse.results;
        tvResults = tvResponse.results.map(tv => ({
          ...tv,
          media_type: 'tv' as const,
          popularity: tv.popularity,
        }));
      }
      
      // Merge and deduplicate by ID+type
      const allResults = [...multiResults, ...tvResults];
      const seen = new Set<string>();
      const uniqueResults = allResults.filter(item => {
        const mediaType = item.media_type || ('title' in item ? 'movie' : 'tv');
        const key = `${mediaType}-${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      // Sort by popularity - most popular results first
      const sortedResults = uniqueResults.sort(
        (a, b) => b.popularity - a.popularity
      );
      
      return sortedResults
        .map(transformTMDBSearchResult)
        .filter((item): item is WatchContent => item !== null);
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};

// Genre-based discovery hooks
export const useMoviesByGenre = (genreId: string | undefined, page = 1) => {
  const tmdbGenreId = genreId ? getMovieGenreTmdbId(genreId) : undefined;
  
  return useQuery({
    queryKey: ["tmdb", "discover-movies", genreId, page],
    queryFn: async () => {
      if (!tmdbGenreId) throw new Error("Invalid genre");
      const response = await tmdbService.discoverMovies(tmdbGenreId, page);
      return response.results.map(transformTMDBMovie);
    },
    enabled: !!tmdbGenreId,
    staleTime: STALE_TIME,
  });
};

export const useSeriesByGenre = (genreId: string | undefined, page = 1) => {
  const tmdbGenreId = genreId ? getSeriesGenreTmdbId(genreId) : undefined;
  
  return useQuery({
    queryKey: ["tmdb", "discover-series", genreId, page],
    queryFn: async () => {
      if (!tmdbGenreId) throw new Error("Invalid genre");
      const response = await tmdbService.discoverSeries(tmdbGenreId, page);
      return response.results.map(transformTMDBSeries);
    },
    enabled: !!tmdbGenreId,
    staleTime: STALE_TIME,
  });
};

// Combined hook for Movies page
export const useMoviesPageData = () => {
  const popularMovies = usePopularMovies();
  const trendingMovies = useTrendingMovies();
  const topRatedMovies = useTopRatedMovies();
  const nowPlaying = useNowPlayingMovies();

  const isLoading = 
    popularMovies.isLoading || 
    trendingMovies.isLoading || 
    topRatedMovies.isLoading || 
    nowPlaying.isLoading;

  const error = 
    popularMovies.error || 
    trendingMovies.error || 
    topRatedMovies.error || 
    nowPlaying.error;

  return {
    popularMovies: popularMovies.data || [],
    trendingMovies: trendingMovies.data || [],
    topRatedMovies: topRatedMovies.data || [],
    nowPlaying: nowPlaying.data || [],
    isLoading,
    error,
  };
};

// Combined hook for Series page
export const useSeriesPageData = () => {
  const popularSeries = usePopularSeries();
  const trendingSeries = useTrendingSeries();
  const topRatedSeries = useTopRatedSeries();
  const onTheAir = useOnTheAirSeries();

  const isLoading = 
    popularSeries.isLoading || 
    trendingSeries.isLoading || 
    topRatedSeries.isLoading || 
    onTheAir.isLoading;

  const error = 
    popularSeries.error || 
    trendingSeries.error || 
    topRatedSeries.error || 
    onTheAir.error;

  return {
    popularSeries: popularSeries.data || [],
    trendingSeries: trendingSeries.data || [],
    topRatedSeries: topRatedSeries.data || [],
    onTheAir: onTheAir.data || [],
    isLoading,
    error,
  };
};

// Person search hook
export const useTMDBPersonSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search-person", query, page],
    queryFn: async (): Promise<TMDBPerson[]> => {
      if (!query.trim()) return [];
      const response = await tmdbService.searchPerson(query, page);
      // Sort by popularity - most famous actors/actresses first
      return [...response.results].sort((a, b) => b.popularity - a.popularity);
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
};

// Person credits hook
export const usePersonCredits = (personId: number | undefined) => {
  return useQuery({
    queryKey: ["tmdb", "person-credits", personId],
    queryFn: async (): Promise<WatchContent[]> => {
      if (!personId) throw new Error("Person ID required");
      const response: TMDBPersonCredits = await tmdbService.getPersonCredits(personId);
      
      // Build a map keyed by ID to deduplicate, preferring cast over crew
      const creditMap = new Map<number, WatchContent>();
      
      // Process cast first (these take priority)
      for (const credit of response.cast) {
        if (creditMap.has(credit.id)) continue;
        const isMovie = credit.media_type === "movie" || "title" in credit;
        const transformed = isMovie
          ? transformTMDBMovie(credit as any)
          : transformTMDBSeries(credit as any);
        
        // Skip items without a poster
        if (!credit.poster_path) continue;
        
        transformed.creditRole = "Actor";
        transformed.popularity = credit.popularity || 0;
        creditMap.set(credit.id, transformed);
      }
      
      // Process crew (only add if not already seen as cast)
      for (const credit of response.crew) {
        if (creditMap.has(credit.id)) continue;
        const isMovie = credit.media_type === "movie" || "title" in credit;
        const transformed = isMovie
          ? transformTMDBMovie(credit as any)
          : transformTMDBSeries(credit as any);
        
        if (!credit.poster_path) continue;
        
        transformed.creditRole = (credit as any).job || "Crew";
        transformed.popularity = credit.popularity || 0;
        creditMap.set(credit.id, transformed);
      }
      
      const uniqueCredits = Array.from(creditMap.values());
      
      // Sort: rated items first (by rating desc), then unrated (by popularity desc)
      return uniqueCredits.sort((a, b) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        const aHasRating = aRating > 0;
        const bHasRating = bRating > 0;

        if (aHasRating && !bHasRating) return -1;
        if (!aHasRating && bHasRating) return 1;

        if (aHasRating && bHasRating) {
          if (bRating !== aRating) return bRating - aRating;
        }

        return (b.popularity || 0) - (a.popularity || 0);
      });
    },
    enabled: !!personId,
    staleTime: STALE_TIME,
  });
};
