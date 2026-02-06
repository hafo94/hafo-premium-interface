// TMDB Service - calls the secure edge function proxy

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  vote_count: number;
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
  popularity: number;
  origin_country: string[];
  original_language: string;
  vote_count: number;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  imdb_id?: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  similar?: TMDBResponse<TMDBMovie>;
}

export interface TMDBSeriesDetails extends TMDBSeries {
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  external_ids?: { imdb_id?: string };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  similar?: TMDBResponse<TMDBSeries>;
}

export interface IMDBRating {
  imdbRating: string;
  imdbVotes: string;
}

export interface TMDBSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  popularity: number;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: TMDBSearchResult[];
  popularity: number;
}

export interface TMDBPersonCredits {
  id: number;
  cast: Array<TMDBMovie & { media_type?: string } | TMDBSeries & { media_type?: string }>;
  crew: Array<TMDBMovie & { media_type?: string } | TMDBSeries & { media_type?: string }>;
}

const callTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const response = await fetch(`${projectUrl}/functions/v1/tmdb?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `TMDB request failed: ${response.status}`);
  }

  return response.json();
};

export const tmdbService = {
  getPopularMovies: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return callTMDB('popular-movies', { page: String(page) });
  },

  getPopularSeries: async (page = 1): Promise<TMDBResponse<TMDBSeries>> => {
    return callTMDB('popular-series', { page: String(page) });
  },

  getTrending: async (page = 1): Promise<TMDBResponse<TMDBSearchResult>> => {
    return callTMDB('trending', { page: String(page) });
  },

  getTrendingMovies: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return callTMDB('trending-movies', { page: String(page) });
  },

  getTrendingSeries: async (page = 1): Promise<TMDBResponse<TMDBSeries>> => {
    return callTMDB('trending-series', { page: String(page) });
  },

  getTopRatedMovies: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return callTMDB('top-rated-movies', { page: String(page) });
  },

  getTopRatedSeries: async (page = 1): Promise<TMDBResponse<TMDBSeries>> => {
    return callTMDB('top-rated-series', { page: String(page) });
  },

  getNowPlaying: async (page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return callTMDB('now-playing', { page: String(page) });
  },

  getOnTheAir: async (page = 1): Promise<TMDBResponse<TMDBSeries>> => {
    return callTMDB('on-the-air', { page: String(page) });
  },

  getMovieDetails: async (id: number): Promise<TMDBMovieDetails> => {
    return callTMDB('movie-details', { id: String(id) });
  },

  getSeriesDetails: async (id: number): Promise<TMDBSeriesDetails> => {
    return callTMDB('series-details', { id: String(id) });
  },

  getIMDBRating: async (imdbId: string): Promise<IMDBRating> => {
    return callTMDB('imdb-rating', { imdb_id: imdbId });
  },

  searchContent: async (query: string, page = 1): Promise<TMDBResponse<TMDBSearchResult>> => {
    return callTMDB('search', { query, page: String(page) });
  },

  discoverMovies: async (genreId: number, page = 1): Promise<TMDBResponse<TMDBMovie>> => {
    return callTMDB('discover-movies', { genre_id: String(genreId), page: String(page) });
  },

  discoverSeries: async (genreId: number, page = 1): Promise<TMDBResponse<TMDBSeries>> => {
    return callTMDB('discover-series', { genre_id: String(genreId), page: String(page) });
  },

  searchPerson: async (query: string, page = 1): Promise<TMDBResponse<TMDBPerson>> => {
    return callTMDB('search-person', { query, page: String(page) });
  },

  getPersonCredits: async (id: number): Promise<TMDBPersonCredits> => {
    return callTMDB('person-credits', { id: String(id) });
  },

  searchTV: async (query: string, page = 1): Promise<TMDBResponse<TMDBSeries>> => {
    return callTMDB('search-tv', { query, page: String(page) });
  },
};
