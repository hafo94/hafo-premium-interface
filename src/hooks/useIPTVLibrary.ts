import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIPTVContext } from '@/contexts/IPTVContext';
import {
  getVodCategories,
  getVodStreams,
  getSeriesCategories,
  getSeries,
  buildVodStreamUrl,
  buildSeriesStreamUrl,
  IPTVVodStream,
  IPTVSeriesInfo,
  IPTVCategory,
} from '@/services/iptvService';
import { WatchContent } from '@/data/watchContent';

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract multiple normalized lookup keys from an IPTV title.
 *  Handles patterns like "US| EN| The Dark Knight (2008)" */
function extractCleanTitle(rawTitle: string): string[] {
  const keys: string[] = [];

  // Split by | and take the last segment (the actual title)
  const parts = rawTitle.split('|');
  const lastPart = parts[parts.length - 1].trim();

  // Also try without year suffix: "Title (2021)" -> "Title"
  const withoutYear = lastPart.replace(/\s*\(\d{4}\)\s*$/, '').trim();

  // Remove common tags like [HD], (HD), [EN], etc.
  const withoutTags = withoutYear
    .replace(/\[.*?\]/g, '')
    .replace(/\((?:HD|SD|4K|UHD|EN|FHD)\)/gi, '')
    .trim();

  const normalized = normalizeTitle(lastPart);
  const normalizedNoYear = normalizeTitle(withoutYear);
  const normalizedClean = normalizeTitle(withoutTags);

  keys.push(normalized);
  if (normalizedNoYear !== normalized) keys.push(normalizedNoYear);
  if (normalizedClean !== normalized && normalizedClean !== normalizedNoYear) keys.push(normalizedClean);

  // Also add the full raw normalized (for titles without prefixes)
  const fullNormalized = normalizeTitle(rawTitle);
  if (!keys.includes(fullNormalized)) keys.push(fullNormalized);

  return keys.filter(k => k.length > 0);
}

// Fetch all streams by iterating over categories in batches
async function fetchAllVodByCategory(credentials: any): Promise<IPTVVodStream[]> {
  const categories: IPTVCategory[] = await getVodCategories(credentials);
  const all: IPTVVodStream[] = [];
  
  const batchSize = 5;
  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(cat => getVodStreams(credentials, cat.category_id).catch(() => [] as IPTVVodStream[]))
    );
    for (const r of results) all.push(...r);
  }
  return all;
}

async function fetchAllSeriesByCategory(credentials: any): Promise<IPTVSeriesInfo[]> {
  const categories: IPTVCategory[] = await getSeriesCategories(credentials);
  const all: IPTVSeriesInfo[] = [];
  
  const batchSize = 5;
  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(cat => getSeries(credentials, cat.category_id).catch(() => [] as IPTVSeriesInfo[]))
    );
    for (const r of results) all.push(...r);
  }
  return all;
}

export function useIPTVLibrary() {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  const { data: vodStreams, isLoading: vodLoading } = useQuery<IPTVVodStream[]>({
    queryKey: ['iptv', 'all-vod-by-category'],
    queryFn: () => fetchAllVodByCategory(iptvCredentials!),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const { data: seriesList, isLoading: seriesLoading } = useQuery<IPTVSeriesInfo[]>({
    queryKey: ['iptv', 'all-series-by-category'],
    queryFn: () => fetchAllSeriesByCategory(iptvCredentials!),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const isLoading = vodLoading || seriesLoading;

  // Build lookup maps by normalized title (multiple keys per entry)
  const vodMap = useMemo(() => {
    const map = new Map<string, IPTVVodStream>();
    if (!vodStreams) return map;
    for (const stream of vodStreams) {
      const keys = extractCleanTitle(stream.name);
      for (const key of keys) {
        map.set(key, stream);
      }
    }
    console.log(`[IPTV Library] VOD map built: ${vodStreams.length} streams → ${map.size} title keys`);
    return map;
  }, [vodStreams]);

  const vodByTmdbId = useMemo(() => {
    const map = new Map<string, IPTVVodStream>();
    if (!vodStreams) return map;
    for (const stream of vodStreams) {
      if (stream.tmdb_id && stream.tmdb_id !== '0') {
        map.set(String(stream.tmdb_id), stream);
      }
      if (stream.tmdb && stream.tmdb !== '0') {
        map.set(String(stream.tmdb), stream);
      }
    }
    console.log(`[IPTV Library] VOD TMDB ID map built: ${map.size} entries`);
    return map;
  }, [vodStreams]);

  const seriesMap = useMemo(() => {
    const map = new Map<string, IPTVSeriesInfo>();
    if (!seriesList) return map;
    for (const series of seriesList) {
      const keys = extractCleanTitle(series.name);
      for (const key of keys) {
        map.set(key, series);
      }
    }
    console.log(`[IPTV Library] Series map built: ${seriesList.length} series → ${map.size} title keys`);
    return map;
  }, [seriesList]);

  const seriesByTmdbId = useMemo(() => {
    const map = new Map<string, IPTVSeriesInfo>();
    if (!seriesList) return map;
    for (const series of seriesList) {
      if (series.tmdb_id && series.tmdb_id !== '0') {
        map.set(String(series.tmdb_id), series);
      }
    }
    console.log(`[IPTV Library] Series TMDB ID map built: ${map.size} entries`);
    return map;
  }, [seriesList]);

  const enrichWithIPTV = useMemo(() => {
    return (items: WatchContent[]): WatchContent[] => {
      if (!iptvCredentials) return items;

      let byId = 0, byTitle = 0, unmatched = 0;

      const result = items.map((item) => {
        if (item.type === 'movie') {
          let vod = item.tmdbId ? vodByTmdbId.get(String(item.tmdbId)) : undefined;
          if (vod) { byId++; } else {
            vod = vodMap.get(normalizeTitle(item.title));
            if (vod) byTitle++;
          }
          if (vod) {
            return {
              ...item,
              iptvId: vod.stream_id,
              streamUrl: buildVodStreamUrl(iptvCredentials, vod.stream_id, vod.container_extension || 'mp4'),
              containerExtension: vod.container_extension,
            };
          }
        } else {
          let series = item.tmdbId ? seriesByTmdbId.get(String(item.tmdbId)) : undefined;
          if (series) { byId++; } else {
            series = seriesMap.get(normalizeTitle(item.title));
            if (series) byTitle++;
          }
          if (series) {
            return {
              ...item,
              iptvId: series.series_id,
              streamUrl: buildSeriesStreamUrl(iptvCredentials, series.series_id, 'mp4'),
              containerExtension: 'mp4',
            };
          }
        }

        unmatched++;
        return item;
      });

      console.log(`[IPTV Library] Enriched ${items.length} items: ${byId} by TMDB ID, ${byTitle} by title, ${unmatched} unmatched`);
      return result;
    };
  }, [iptvCredentials, vodMap, seriesMap, vodByTmdbId, seriesByTmdbId]);

  const filterByIPTV = useMemo(() => {
    return (items: WatchContent[]): WatchContent[] => {
      // Show all items while IPTV is still loading (don't block UI)
      if (!iptvCredentials || isLoading) return items;
      const enriched = enrichWithIPTV(items);
      return enriched.filter((item) => !!item.iptvId);
    };
  }, [iptvCredentials, isLoading, enrichWithIPTV]);

  return {
    isLoading,
    isReady: !isLoading && !!vodStreams && !!seriesList,
    vodCount: vodStreams?.length || 0,
    seriesCount: seriesList?.length || 0,
    enrichWithIPTV,
    filterByIPTV,
  };
}
