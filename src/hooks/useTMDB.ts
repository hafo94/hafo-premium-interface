import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { tmdbService, TMDBPerson, TMDBPersonCredits } from "@/services/tmdbService";
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
      return transformTMDBMovieDetails(response);
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
      return transformTMDBSeriesDetails(response);
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
      
      // Transform and deduplicate credits
      const allCredits = [...response.cast, ...response.crew];
      const seen = new Set<number>();
      const uniqueCredits: WatchContent[] = [];
      
      for (const credit of allCredits) {
        if (seen.has(credit.id)) continue;
        seen.add(credit.id);
        
        // Determine if it's a movie or series
        const isMovie = credit.media_type === "movie" || "title" in credit;
        if (isMovie) {
          uniqueCredits.push(transformTMDBMovie(credit as any));
        } else {
          uniqueCredits.push(transformTMDBSeries(credit as any));
        }
      }
      
      // Sort by popularity
      return uniqueCredits.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    },
    enabled: !!personId,
    staleTime: STALE_TIME,
  });
};
