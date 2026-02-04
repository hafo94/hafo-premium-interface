import { useQuery } from '@tanstack/react-query';
import { useIPTVContext } from '@/contexts/IPTVContext';
import {
  getVodCategories,
  getVodStreams,
  getSeriesCategories,
  getSeries,
  getSeriesInfo,
  getLiveCategories,
  getLiveStreams,
  IPTVCategory,
  IPTVVodStream,
  IPTVSeriesInfo,
  IPTVSeriesDetails,
  IPTVLiveStream,
} from '@/services/iptvService';

// VOD (Movies) hooks
export function useVodCategories() {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  return useQuery<IPTVCategory[]>({
    queryKey: ['iptv', 'vod-categories'],
    queryFn: () => getVodCategories(iptvCredentials!),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useVodStreams(categoryId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  return useQuery<IPTVVodStream[]>({
    queryKey: ['iptv', 'vod-streams', categoryId],
    queryFn: () => getVodStreams(iptvCredentials!, categoryId),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 5,
  });
}

// Series hooks
export function useSeriesCategories() {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  return useQuery<IPTVCategory[]>({
    queryKey: ['iptv', 'series-categories'],
    queryFn: () => getSeriesCategories(iptvCredentials!),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 5,
  });
}

export function useIPTVSeries(categoryId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  return useQuery<IPTVSeriesInfo[]>({
    queryKey: ['iptv', 'series', categoryId],
    queryFn: () => getSeries(iptvCredentials!, categoryId),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSeriesDetails(seriesId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  return useQuery<IPTVSeriesDetails>({
    queryKey: ['iptv', 'series-details', seriesId],
    queryFn: () => getSeriesInfo(iptvCredentials!, seriesId!),
    enabled: !!iptvCredentials && iptvConnected && !!seriesId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Live TV hooks
export function useLiveCategories() {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  return useQuery<IPTVCategory[]>({
    queryKey: ['iptv', 'live-categories'],
    queryFn: () => getLiveCategories(iptvCredentials!),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLiveStreams(categoryId?: string) {
  const { iptvCredentials, iptvConnected } = useIPTVContext();

  return useQuery<IPTVLiveStream[]>({
    queryKey: ['iptv', 'live-streams', categoryId],
    queryFn: () => getLiveStreams(iptvCredentials!, categoryId),
    enabled: !!iptvCredentials && iptvConnected,
    staleTime: 1000 * 60 * 2, // 2 minutes for live content
  });
}
