// Centralized genre configuration for Movies and Series

export interface Genre {
  id: string;
  label: string;
  tmdbId: number;
}

// Movie genres from TMDB
export const movieGenres: Genre[] = [
  { id: "action", label: "Action", tmdbId: 28 },
  { id: "animation", label: "Animation", tmdbId: 16 },
  { id: "comedy", label: "Comedy", tmdbId: 35 },
  { id: "documentary", label: "Documentary", tmdbId: 99 },
  { id: "drama", label: "Drama", tmdbId: 18 },
  { id: "fantasy", label: "Fantasy", tmdbId: 14 },
  { id: "horror", label: "Horror", tmdbId: 27 },
  { id: "romance", label: "Romance", tmdbId: 10749 },
  { id: "scifi", label: "Sci-Fi", tmdbId: 878 },
  { id: "thriller", label: "Thriller", tmdbId: 53 },
];

// Series genres from TMDB
export const seriesGenres: Genre[] = [
  { id: "action-adventure", label: "Action & Adventure", tmdbId: 10759 },
  { id: "animation", label: "Animation", tmdbId: 16 },
  { id: "comedy", label: "Comedy", tmdbId: 35 },
  { id: "crime", label: "Crime", tmdbId: 80 },
  { id: "documentary", label: "Documentary", tmdbId: 99 },
  { id: "drama", label: "Drama", tmdbId: 18 },
  { id: "family", label: "Family", tmdbId: 10751 },
  { id: "mystery", label: "Mystery", tmdbId: 9648 },
  { id: "scifi-fantasy", label: "Sci-Fi & Fantasy", tmdbId: 10765 },
];

// Helper to get TMDB ID from genre ID
export const getMovieGenreTmdbId = (genreId: string): number | undefined => {
  return movieGenres.find((g) => g.id === genreId)?.tmdbId;
};

export const getSeriesGenreTmdbId = (genreId: string): number | undefined => {
  return seriesGenres.find((g) => g.id === genreId)?.tmdbId;
};

// Helper to get genre label
export const getMovieGenreLabel = (genreId: string): string => {
  return movieGenres.find((g) => g.id === genreId)?.label || genreId;
};

export const getSeriesGenreLabel = (genreId: string): string => {
  return seriesGenres.find((g) => g.id === genreId)?.label || genreId;
};
