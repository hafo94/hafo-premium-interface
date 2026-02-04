

# Connect to TMDB API for Real Movie/Series Data

## Overview
Integrate TMDB (The Movie Database) API to replace static mock data with real popular movies, trending series, and metadata. This requires a backend component to securely store the API key.

## Prerequisites
Before implementation, you'll need to:
1. **Enable Lovable Cloud** - Required to create edge functions that securely call TMDB
2. **Get a TMDB API Key** - Free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

## Architecture

```text
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────┐
│  React App      │ ──── │  Edge Function       │ ──── │  TMDB API   │
│  (Frontend)     │      │  (Secure API Key)    │      │             │
└─────────────────┘      └──────────────────────┘      └─────────────┘
      │                           │
      │ fetch /api/tmdb/movies    │ Authorization: Bearer TOKEN
      └───────────────────────────┘
```

## Implementation Plan

### Phase 1: Backend Setup

#### 1.1 Enable Lovable Cloud
Required to create edge functions and store secrets.

#### 1.2 Create TMDB Edge Function
**New File:** `supabase/functions/tmdb/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

serve(async (req) => {
  const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
  
  // Handle endpoints:
  // - /popular-movies
  // - /popular-series  
  // - /trending
  // - /movie/:id
  // - /tv/:id
  // - /search?query=...
});
```

#### 1.3 Store API Key as Secret
After enabling Cloud, add `TMDB_API_KEY` as a secret.

### Phase 2: API Service Layer

#### 2.1 Create TMDB Service
**New File:** `src/services/tmdbService.ts`

```typescript
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  // ...
}

export const tmdbService = {
  getPopularMovies: async (page = 1) => {...},
  getPopularSeries: async (page = 1) => {...},
  getTrending: async (timeWindow = 'week') => {...},
  getMovieDetails: async (id: number) => {...},
  getSeriesDetails: async (id: number) => {...},
  searchContent: async (query: string) => {...},
};
```

#### 2.2 Create Data Transformer
**New File:** `src/services/tmdbTransformer.ts`

Transform TMDB responses to match existing `WatchContent` interface:

```typescript
export const transformTMDBMovie = (movie: TMDBMovie): WatchContent => ({
  id: String(movie.id),
  title: movie.title,
  type: 'movie',
  year: new Date(movie.release_date).getFullYear(),
  rating: movie.vote_average,
  runtime: 0, // Requires separate details call
  genre: mapGenreIds(movie.genre_ids),
  plot: movie.overview,
  poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
  backdrop: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
  isHot: movie.vote_average >= 8,
  isRecommended: movie.popularity > 100,
});
```

### Phase 3: React Query Integration

#### 3.1 Create TMDB Hooks
**New File:** `src/hooks/useTMDB.ts`

```typescript
export const usePopularMovies = () => {
  return useQuery({
    queryKey: ['tmdb', 'popular-movies'],
    queryFn: tmdbService.getPopularMovies,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const usePopularSeries = () => {...};
export const useTrending = () => {...};
export const useMovieDetails = (id: number) => {...};
```

### Phase 4: Update Content Components

#### 4.1 Update MoviesContent.tsx
- Replace static `watchContent` import with `usePopularMovies` hook
- Add loading skeletons
- Handle error states
- Maintain existing navigation/focus logic

#### 4.2 Update SeriesContent.tsx
- Similar changes using `usePopularSeries` hook

#### 4.3 Update SearchOverlay.tsx
- Connect to TMDB search endpoint
- Show real-time search results

### Phase 5: Enhanced Features

#### 5.1 Additional TMDB Endpoints to Use
| Endpoint | Use Case |
|----------|----------|
| `/movie/popular` | Popular movies list |
| `/tv/popular` | Popular TV series |
| `/trending/all/week` | Trending content |
| `/movie/{id}` | Full movie details (runtime, cast) |
| `/tv/{id}` | Full series details (seasons, episodes) |
| `/search/multi` | Search movies & series |
| `/movie/{id}/similar` | Recommendations |
| `/genre/movie/list` | Genre mappings |

#### 5.2 Caching Strategy
- Cache popular/trending for 15 minutes
- Cache individual details for 1 hour
- Use React Query's built-in caching

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/tmdb/index.ts` | Create | Secure API proxy |
| `src/services/tmdbService.ts` | Create | TMDB API client |
| `src/services/tmdbTransformer.ts` | Create | Data transformation |
| `src/hooks/useTMDB.ts` | Create | React Query hooks |
| `src/components/content/MoviesContent.tsx` | Modify | Use real TMDB data |
| `src/components/content/SeriesContent.tsx` | Modify | Use real TMDB data |
| `src/components/watch/SearchOverlay.tsx` | Modify | Real search |
| `src/data/watchContent.ts` | Keep | Fallback/offline data |

## Technical Details

### TMDB Image URLs
- Posters: `https://image.tmdb.org/t/p/w500{poster_path}`
- Backdrops: `https://image.tmdb.org/t/p/original{backdrop_path}`
- Available sizes: w92, w154, w185, w342, w500, w780, original

### Genre ID Mapping
TMDB uses numeric genre IDs. We'll fetch and cache the genre list:
- 28 = Action
- 12 = Adventure  
- 16 = Animation
- 35 = Comedy
- 80 = Crime
- 18 = Drama
- 27 = Horror
- 878 = Science Fiction

### Rate Limiting
TMDB allows ~40 requests per 10 seconds. React Query caching will help stay within limits.

## Next Steps After Implementation
1. Enable Lovable Cloud when prompted
2. Add your TMDB API key as a secret
3. The edge function will be deployed automatically
4. Content will load from TMDB on next refresh

