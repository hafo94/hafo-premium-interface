import { useQuery } from "@tanstack/react-query";
import { tmdbService, BatchIMDBRatingsResponse } from "@/services/tmdbService";
import { WatchContent } from "@/data/watchContent";
import { useMemo } from "react";

const IMDB_STALE_TIME = 1000 * 60 * 60; // 1 hour (cache is 7 days server-side)

/**
 * Fetches batch IMDb ratings for a list of WatchContent items,
 * then returns a new sorted array with IMDb ratings merged in.
 */
export const useIMDBSortedContent = (
  items: WatchContent[],
  queryKeyPrefix: string
) => {
  const batchItems = useMemo(
    () =>
      items.map((item) => ({
        tmdb_id: parseInt(item.id, 10),
        media_type: item.type === "movie" ? "movie" : "tv",
      })),
    [items]
  );

  const tmdbIds = useMemo(() => batchItems.map((i) => i.tmdb_id).sort().join(","), [batchItems]);

  const { data: ratingsData } = useQuery({
    queryKey: ["imdb-batch", queryKeyPrefix, tmdbIds],
    queryFn: () => tmdbService.getBatchIMDBRatings(batchItems),
    enabled: batchItems.length > 0,
    staleTime: IMDB_STALE_TIME,
  });

  return useMemo(() => {
    if (!ratingsData?.ratings || items.length === 0) return items;

    // Merge IMDb ratings into items
    const merged = items.map((item) => {
      const tmdbId = parseInt(item.id, 10);
      const rating = ratingsData.ratings[tmdbId];
      if (rating) {
        return {
          ...item,
          imdbRating: rating.imdbRating ?? item.imdbRating,
          imdbId: rating.imdbId ?? item.imdbId,
        };
      }
      return item;
    });

    // Sort: IMDb-rated first (desc), then by popularity
    return merged.sort((a, b) => {
      const aRating = a.imdbRating || 0;
      const bRating = b.imdbRating || 0;

      if (aRating > 0 && bRating === 0) return -1;
      if (aRating === 0 && bRating > 0) return 1;
      if (aRating > 0 && bRating > 0 && aRating !== bRating) return bRating - aRating;

      return (b.popularity || 0) - (a.popularity || 0);
    });
  }, [items, ratingsData]);
};

/**
 * From a list of items (already IMDb-enriched), pick the best featured items.
 * Prefers titles with IMDb rating >= 7.5 and a backdrop.
 */
export const selectFeaturedItems = (
  items: WatchContent[],
  count = 5
): WatchContent[] => {
  const withBackdrop = items.filter(
    (item) => item.backdrop && item.backdrop !== "/placeholder.svg"
  );

  // Prefer high IMDb-rated items
  const highRated = withBackdrop.filter(
    (item) => item.imdbRating && item.imdbRating >= 7.5
  );

  if (highRated.length >= count) {
    return highRated.slice(0, count);
  }

  // Fill remaining from all items with backdrop
  const remaining = withBackdrop.filter(
    (item) => !highRated.includes(item)
  );
  return [...highRated, ...remaining].slice(0, count);
};
