

# Use IMDB Ratings via OMDb API

## Problem

TMDB ratings are unreliable for titles with few votes. IMDB ratings are more trusted and consistent because they have a much larger voter base.

## Approach

Rather than scraping IMDB (which violates their terms and is blocked), we'll use the **OMDb API** -- a free, legal API that returns IMDB ratings by IMDB ID or by title.

TMDB already returns `imdb_id` in movie/series detail responses, so we can cross-reference easily.

## How It Works

```text
User sees title --> TMDB provides imdb_id --> OMDb returns IMDB rating
```

For list views (grids, rows) where we only have TMDB data, we'll keep TMDB ratings as a fallback but prioritize IMDB ratings when available (e.g., in detail views and filmography).

## Setup Required

You'll need a free OMDb API key from omdbapi.com/apikey.aspx (free tier allows 1,000 requests/day). You'll be prompted to enter it as a secret.

## Changes

### 1. Edge function: `supabase/functions/tmdb/index.ts`

Add a new endpoint `imdb-rating` that:
- Accepts an `imdb_id` parameter
- Calls OMDb API (`http://www.omdbapi.com/?i={imdb_id}&apikey={key}`)
- Returns the IMDB rating and vote count
- Uses the `OMDB_API_KEY` secret

Also update `movie-details` and `series-details` endpoints to include `imdb_id` in the response passthrough (TMDB already returns this field -- it just needs to flow through).

### 2. Service: `src/services/tmdbService.ts`

- Add `imdb_id` to `TMDBMovieDetails` and `TMDBSeriesDetails` interfaces
- Add `getIMDBRating(imdbId: string)` method that calls the new edge function endpoint
- Returns `{ imdbRating: string, imdbVotes: string }` (e.g., "8.4", "1,234,567")

### 3. Data model: `src/data/watchContent.ts`

- Add optional `imdbId?: string` and `imdbRating?: number` fields to `WatchContent`

### 4. Transformer: `src/services/tmdbTransformer.ts`

- In `transformTMDBMovieDetails` and `transformTMDBSeriesDetails`, pass through `imdbId` from the TMDB detail response

### 5. Hook: `src/hooks/useTMDB.ts`

- Update `useMovieDetails` and `useSeriesDetails` to fetch the IMDB rating as a secondary call after getting the TMDB details (only if `imdb_id` is available)
- For `usePersonCredits`, keep using TMDB ratings (fetching IMDB for every credit would be too many API calls)

### 6. UI: `src/components/watch/ContentDetail.tsx`

- Display the IMDB rating (with the IMDB logo/icon) when available, falling back to TMDB rating
- Show something like: "IMDb 8.4" instead of the current star rating

### 7. UI: `src/components/watch/SearchOverlay.tsx`

- In filmography cards, continue showing TMDB ratings (fetching IMDB for dozens of credits is impractical)
- In detail view (ContentDetail), show IMDB rating when available

## Where IMDB vs TMDB ratings are used

| View | Rating Source | Reason |
|------|-------------|--------|
| Content detail page | IMDB (via OMDb) | Single item, worth the extra API call |
| Browse grids/rows | TMDB | Too many items to fetch IMDB for each |
| Actor filmography | TMDB | Too many items to fetch IMDB for each |
| Search results | TMDB | Too many items to fetch IMDB for each |

## Files summary

| File | Change |
|------|--------|
| `supabase/functions/tmdb/index.ts` | Add `imdb-rating` endpoint using OMDb API |
| `src/services/tmdbService.ts` | Add `imdb_id` to detail interfaces, add `getIMDBRating()` |
| `src/data/watchContent.ts` | Add `imdbId` and `imdbRating` fields |
| `src/services/tmdbTransformer.ts` | Pass through `imdbId` in detail transforms |
| `src/hooks/useTMDB.ts` | Fetch IMDB rating in detail hooks |
| `src/components/watch/ContentDetail.tsx` | Display IMDB rating with fallback to TMDB |

