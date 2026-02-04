import { useInfiniteQuery } from "@tanstack/react-query";
import { tmdbService } from "@/services/tmdbService";
import { transformTMDBMovie, transformTMDBSeries } from "@/services/tmdbTransformer";
import { getMovieGenreTmdbId, getSeriesGenreTmdbId } from "@/data/genreConfig";

const STALE_TIME = 1000 * 60 * 15; // 15 minutes

// Infinite scroll hooks for Movies

export const useInfinitePopularMovies = () => {
  return useInfiniteQuery({
    queryKey: ["tmdb", "infinite-popular-movies"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await tmdbService.getPopularMovies(pageParam);
      return {
        items: response.results.map(transformTMDBMovie),
        nextPage: pageParam < response.total_pages ? pageParam + 1 : undefined,
        totalPages: response.total_pages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME,
  });
};

export const useInfiniteNowPlayingMovies = () => {
  return useInfiniteQuery({
    queryKey: ["tmdb", "infinite-now-playing"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await tmdbService.getNowPlaying(pageParam);
      return {
        items: response.results.map(transformTMDBMovie),
        nextPage: pageParam < response.total_pages ? pageParam + 1 : undefined,
        totalPages: response.total_pages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME,
  });
};

export const useInfiniteMoviesByGenre = (genreId: string | undefined) => {
  const tmdbGenreId = genreId ? getMovieGenreTmdbId(genreId) : undefined;

  return useInfiniteQuery({
    queryKey: ["tmdb", "infinite-movies-genre", genreId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!tmdbGenreId) throw new Error("Invalid genre");
      const response = await tmdbService.discoverMovies(tmdbGenreId, pageParam);
      return {
        items: response.results.map(transformTMDBMovie),
        nextPage: pageParam < response.total_pages ? pageParam + 1 : undefined,
        totalPages: response.total_pages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!tmdbGenreId,
    staleTime: STALE_TIME,
  });
};

// Infinite scroll hooks for Series

export const useInfinitePopularSeries = () => {
  return useInfiniteQuery({
    queryKey: ["tmdb", "infinite-popular-series"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await tmdbService.getPopularSeries(pageParam);
      return {
        items: response.results.map(transformTMDBSeries),
        nextPage: pageParam < response.total_pages ? pageParam + 1 : undefined,
        totalPages: response.total_pages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME,
  });
};

export const useInfiniteOnTheAirSeries = () => {
  return useInfiniteQuery({
    queryKey: ["tmdb", "infinite-on-the-air"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await tmdbService.getOnTheAir(pageParam);
      return {
        items: response.results.map(transformTMDBSeries),
        nextPage: pageParam < response.total_pages ? pageParam + 1 : undefined,
        totalPages: response.total_pages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME,
  });
};

export const useInfiniteSeriesByGenre = (genreId: string | undefined) => {
  const tmdbGenreId = genreId ? getSeriesGenreTmdbId(genreId) : undefined;

  return useInfiniteQuery({
    queryKey: ["tmdb", "infinite-series-genre", genreId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!tmdbGenreId) throw new Error("Invalid genre");
      const response = await tmdbService.discoverSeries(tmdbGenreId, pageParam);
      return {
        items: response.results.map(transformTMDBSeries),
        nextPage: pageParam < response.total_pages ? pageParam + 1 : undefined,
        totalPages: response.total_pages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!tmdbGenreId,
    staleTime: STALE_TIME,
  });
};
