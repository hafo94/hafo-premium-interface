import { WatchContent } from "@/data/watchContent";
import { TMDBMovie, TMDBSeries, TMDBSearchResult, TMDBMovieDetails, TMDBSeriesDetails } from "./tmdbService";

// Genre ID to name mapping (from TMDB)
const movieGenreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const tvGenreMap: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

type ImageSize = "poster" | "poster_large" | "backdrop" | "backdrop_small" | "backdrop_thumb";

const imageSizeMap: Record<ImageSize, string> = {
  poster: "w342",
  poster_large: "w500",
  backdrop: "w1280",
  backdrop_small: "w780",
  backdrop_thumb: "w300",
};

const getImageUrl = (path: string | null, size: ImageSize = "poster"): string => {
  if (!path) {
    return "/placeholder.svg";
  }
  return `https://image.tmdb.org/t/p/${imageSizeMap[size]}${path}`;
};

const mapGenreIds = (genreIds: number[], type: "movie" | "series"): string[] => {
  const genreMap = type === "movie" ? movieGenreMap : tvGenreMap;
  return genreIds
    .map((id) => genreMap[id])
    .filter((name): name is string => !!name)
    .slice(0, 3);
};

export const transformTMDBMovie = (movie: TMDBMovie): WatchContent => ({
  id: `tmdb-movie-${movie.id}`,
  title: movie.title,
  type: "movie",
  year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
  rating: Math.round(movie.vote_average * 10) / 10,
  runtime: 0, // Will be fetched from details
  genre: mapGenreIds(movie.genre_ids, "movie"),
  plot: movie.overview,
  poster: getImageUrl(movie.poster_path, "poster"),
  posterLarge: getImageUrl(movie.poster_path, "poster_large"),
  backdrop: getImageUrl(movie.backdrop_path, "backdrop"),
  backdropSmall: getImageUrl(movie.backdrop_path, "backdrop_thumb"),
  isHot: movie.vote_average >= 7.5 && movie.vote_count > 1000,
  isRecommended: movie.popularity > 50,
  tmdbId: movie.id,
});

export const transformTMDBSeries = (series: TMDBSeries): WatchContent => ({
  id: `tmdb-series-${series.id}`,
  title: series.name,
  type: "series",
  year: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
  rating: Math.round(series.vote_average * 10) / 10,
  genre: mapGenreIds(series.genre_ids, "series"),
  plot: series.overview,
  poster: getImageUrl(series.poster_path, "poster"),
  posterLarge: getImageUrl(series.poster_path, "poster_large"),
  backdrop: getImageUrl(series.backdrop_path, "backdrop"),
  backdropSmall: getImageUrl(series.backdrop_path, "backdrop_thumb"),
  isHot: series.vote_average >= 7.5 && series.vote_count > 500,
  isRecommended: series.popularity > 50,
  tmdbId: series.id,
});

export const transformTMDBSearchResult = (result: TMDBSearchResult): WatchContent | null => {
  if (result.media_type === "person") {
    return null;
  }

  const isMovie = result.media_type === "movie";
  
  return {
    id: `tmdb-${result.media_type}-${result.id}`,
    title: isMovie ? result.title || "" : result.name || "",
    type: isMovie ? "movie" : "series",
    year: isMovie
      ? result.release_date ? new Date(result.release_date).getFullYear() : undefined
      : result.first_air_date ? new Date(result.first_air_date).getFullYear() : undefined,
    rating: result.vote_average ? Math.round(result.vote_average * 10) / 10 : undefined,
    genre: result.genre_ids ? mapGenreIds(result.genre_ids, isMovie ? "movie" : "series") : [],
    plot: result.overview || "",
    poster: getImageUrl(result.poster_path, "poster"),
    posterLarge: getImageUrl(result.poster_path, "poster_large"),
    backdrop: getImageUrl(result.backdrop_path, "backdrop"),
    backdropSmall: getImageUrl(result.backdrop_path, "backdrop_thumb"),
    isHot: (result.vote_average || 0) >= 7.5,
    isRecommended: result.popularity > 50,
    tmdbId: result.id,
  };
};

export const transformTMDBMovieDetails = (movie: TMDBMovieDetails): WatchContent => ({
  id: `tmdb-movie-${movie.id}`,
  title: movie.title,
  type: "movie",
  year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
  rating: Math.round(movie.vote_average * 10) / 10,
  runtime: movie.runtime,
  genre: movie.genres.map((g) => g.name).slice(0, 3),
  plot: movie.overview,
  poster: getImageUrl(movie.poster_path, "poster"),
  posterLarge: getImageUrl(movie.poster_path, "poster_large"),
  backdrop: getImageUrl(movie.backdrop_path, "backdrop"),
  backdropSmall: getImageUrl(movie.backdrop_path, "backdrop_thumb"),
  isHot: movie.vote_average >= 7.5 && movie.vote_count > 1000,
  isRecommended: movie.popularity > 50,
  tmdbId: movie.id,
  imdbId: movie.imdb_id || undefined,
  cast: movie.credits?.cast.slice(0, 5).map((c) => c.name),
  director: movie.credits?.crew.find((c) => c.job === "Director")?.name,
  similarContent: movie.similar?.results?.slice(0, 6).map(transformTMDBMovie),
});

export const transformTMDBSeriesDetails = (series: TMDBSeriesDetails): WatchContent => ({
  id: `tmdb-series-${series.id}`,
  title: series.name,
  type: "series",
  year: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
  rating: Math.round(series.vote_average * 10) / 10,
  runtime: series.episode_run_time?.[0],
  genre: series.genres.map((g) => g.name).slice(0, 3),
  plot: series.overview,
  poster: getImageUrl(series.poster_path, "poster"),
  posterLarge: getImageUrl(series.poster_path, "poster_large"),
  backdrop: getImageUrl(series.backdrop_path, "backdrop"),
  backdropSmall: getImageUrl(series.backdrop_path, "backdrop_thumb"),
  isHot: series.vote_average >= 7.5 && series.vote_count > 500,
  isRecommended: series.popularity > 50,
  tmdbId: series.id,
  imdbId: series.external_ids?.imdb_id || undefined,
  episodes: series.number_of_episodes,
  cast: series.credits?.cast.slice(0, 5).map((c) => c.name),
  similarContent: series.similar?.results?.slice(0, 6).map(transformTMDBSeries),
});
