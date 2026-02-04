import { useQuery } from "@tanstack/react-query";
import { tmdbService } from "@/services/tmdbService";
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

export const useTMDBSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["tmdb", "search", query, page],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await tmdbService.searchContent(query, page);
      return response.results
        .map(transformTMDBSearchResult)
        .filter((item): item is WatchContent => item !== null);
    },
    enabled: query.trim().length > 0,
    staleTime: STALE_TIME,
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
