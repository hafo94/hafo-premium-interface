/**
 * Hooks for IPTV-first catalog browsing.
 * Fetches content directly from the IPTV provider's API via the browser.
 */

import { useQuery } from '@tanstack/react-query';
import { useIPTVContext } from '@/contexts/IPTVContext';
import {
  directGetVodCategories,
  directGetVodStreams,
  directGetVodInfo,
  directGetSeriesCategories,
  directGetSeries,
  directGetSeriesInfo,
  IPTVVodInfo,
} from '@/services/iptvDirectClient';
import {
  IPTVCategory,
  IPTVVodStream,
  IPTVSeriesInfo,
  IPTVSeriesDetails,
  buildProxyStreamUrl,
} from '@/services/iptvService';
import { WatchContent } from '@/data/watchContent';
import { useMemo } from 'react';

// --- Category hooks ---

export function useDirectVodCategories() {
  const { iptvCredentials, iptvConnected } = useIPTVContext();
  return useQuery<IPTVCategory[]>({
    queryKey: ['iptv-direct', 'vod-categories'],
    queryFn: () => directGetVodCategories(iptvCredentials!),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 15,
  });
}

export function useDirectVodStreams(categoryId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();
  return useQuery<IPTVVodStream[]>({
    queryKey: ['iptv-direct', 'vod-streams', categoryId],
    queryFn: () => directGetVodStreams(iptvCredentials!, categoryId),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDirectVodInfo(vodId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();
  return useQuery<IPTVVodInfo>({
    queryKey: ['iptv-direct', 'vod-info', vodId],
    queryFn: () => directGetVodInfo(iptvCredentials!, vodId!),
    enabled: !!iptvCredentials && iptvConnected && !!vodId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useDirectSeriesCategories() {
  const { iptvCredentials, iptvConnected } = useIPTVContext();
  return useQuery<IPTVCategory[]>({
    queryKey: ['iptv-direct', 'series-categories'],
    queryFn: () => directGetSeriesCategories(iptvCredentials!),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 15,
  });
}

export function useDirectSeries(categoryId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();
  return useQuery<IPTVSeriesInfo[]>({
    queryKey: ['iptv-direct', 'series', categoryId],
    queryFn: () => directGetSeries(iptvCredentials!, categoryId),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDirectSeriesDetails(seriesId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();
  return useQuery<IPTVSeriesDetails>({
    queryKey: ['iptv-direct', 'series-details', seriesId],
    queryFn: () => directGetSeriesInfo(iptvCredentials!, seriesId!),
    enabled: !!iptvCredentials && iptvConnected && !!seriesId,
    staleTime: 1000 * 60 * 30,
  });
}

// --- Transform IPTV data to WatchContent ---

export function vodStreamToWatchContent(
  stream: IPTVVodStream,
  credentials: { serverUrl: string; username: string; password: string },
  categoryName?: string,
): WatchContent {
  const baseUrl = credentials.serverUrl.replace(/\/$/, '');
  const directUrl = `${baseUrl}/movie/${credentials.username}/${credentials.password}/${stream.stream_id}.${stream.container_extension || 'mp4'}`;

  return {
    id: `iptv-vod-${stream.stream_id}`,
    title: cleanIPTVTitle(stream.name),
    type: 'movie',
    rating: stream.rating_5based ? stream.rating_5based * 2 : parseFloat(stream.rating) || undefined,
    genre: categoryName ? [categoryName] : [],
    plot: '',
    poster: stream.stream_icon || '',
    backdrop: stream.stream_icon || '',
    iptvId: stream.stream_id,
    streamUrl: buildProxyStreamUrl(directUrl),
    containerExtension: stream.container_extension,
  };
}

export function seriesToWatchContent(
  series: IPTVSeriesInfo,
  credentials: { serverUrl: string; username: string; password: string },
  categoryName?: string,
): WatchContent {
  return {
    id: `iptv-series-${series.series_id}`,
    title: cleanIPTVTitle(series.name),
    type: 'series',
    rating: series.rating_5based ? series.rating_5based * 2 : parseFloat(series.rating) || undefined,
    genre: series.genre ? series.genre.split(',').map(g => g.trim()) : categoryName ? [categoryName] : [],
    plot: series.plot || '',
    poster: series.cover || '',
    backdrop: series.backdrop_path?.[0] || series.cover || '',
    cast: series.cast ? series.cast.split(',').map(c => c.trim()) : undefined,
    director: series.director || undefined,
    iptvId: series.series_id,
    streamUrl: '', // Will be resolved when user picks an episode
    containerExtension: 'mp4',
  };
}

function cleanIPTVTitle(raw: string): string {
  // Remove prefixes like "US| EN| " and quality tags
  const parts = raw.split('|');
  let title = parts[parts.length - 1].trim();
  title = title.replace(/\[.*?\]/g, '').replace(/\((?:HD|SD|4K|UHD|EN|FHD)\)/gi, '').trim();
  return title;
}

/** Check if the IPTV-first catalog has content (categories loaded successfully) */
export function useIPTVCatalogAvailable() {
  const { data: vodCategories, isLoading: vodLoading, isError: vodError } = useDirectVodCategories();
  const { data: seriesCategories, isLoading: seriesLoading, isError: seriesError } = useDirectSeriesCategories();

  return {
    hasMovies: !vodError && (vodCategories?.length ?? 0) > 0,
    hasSeries: !seriesError && (seriesCategories?.length ?? 0) > 0,
    isLoading: vodLoading || seriesLoading,
  };
}
