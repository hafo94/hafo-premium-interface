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

// Fetch all streams by iterating over categories in batches
async function fetchAllVodByCategory(credentials: any): Promise<IPTVVodStream[]> {
  const categories: IPTVCategory[] = await getVodCategories(credentials);
  const all: IPTVVodStream[] = [];
  
  // Fetch in batches of 5 categories at a time
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

  // Build lookup maps by normalized title
  const vodMap = useMemo(() => {
    const map = new Map<string, IPTVVodStream>();
    if (!vodStreams) return map;
    for (const stream of vodStreams) {
      map.set(normalizeTitle(stream.name), stream);
    }
    console.log(`[IPTV Library] VOD map built: ${map.size} titles`);
    return map;
  }, [vodStreams]);

  const seriesMap = useMemo(() => {
    const map = new Map<string, IPTVSeriesInfo>();
    if (!seriesList) return map;
    for (const series of seriesList) {
      map.set(normalizeTitle(series.name), series);
    }
    console.log(`[IPTV Library] Series map built: ${map.size} titles`);
    return map;
  }, [seriesList]);

  const enrichWithIPTV = useMemo(() => {
    return (items: WatchContent[]): WatchContent[] => {
      if (!iptvCredentials) return items;

      return items.map((item) => {
        const normalized = normalizeTitle(item.title);

        if (item.type === 'movie') {
          const vod = vodMap.get(normalized);
          if (vod) {
            return {
              ...item,
              iptvId: vod.stream_id,
              streamUrl: buildVodStreamUrl(iptvCredentials, vod.stream_id, vod.container_extension || 'mp4'),
              containerExtension: vod.container_extension,
            };
          }
        } else {
          const series = seriesMap.get(normalized);
          if (series) {
            return {
              ...item,
              iptvId: series.series_id,
              streamUrl: buildSeriesStreamUrl(iptvCredentials, series.series_id, 'mp4'),
              containerExtension: 'mp4',
            };
          }
        }

        return item;
      });
    };
  }, [iptvCredentials, vodMap, seriesMap]);

  const filterByIPTV = useMemo(() => {
    return (items: WatchContent[]): WatchContent[] => {
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
