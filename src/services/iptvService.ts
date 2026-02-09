import { supabase } from "@/integrations/supabase/client";

export interface IPTVCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface IPTVUserInfo {
  username: string;
  password: string;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
}

export interface IPTVServerInfo {
  url: string;
  port: string;
  https_port: string;
  server_protocol: string;
  rtmp_port: string;
  timezone: string;
  timestamp_now: number;
  time_now: string;
}

export interface IPTVCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface IPTVVodStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  // Some providers include TMDB data
  tmdb?: string;
  tmdb_id?: string;
}

export interface IPTVSeriesInfo {
  series_id: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
  tmdb_id?: string;
}

export interface IPTVEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    duration_secs: number;
    duration: string;
    plot: string;
    rating: number;
  };
  added: string;
  season: number;
  direct_source: string;
}

export interface IPTVSeriesDetails {
  seasons: Record<string, IPTVEpisode[]>;
  info: IPTVSeriesInfo;
  episodes: Record<string, IPTVEpisode[]>;
}

export interface IPTVLiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

// API functions
async function callIPTVProxy(credentials: IPTVCredentials, action: string, params: Record<string, string> = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('iptv', {
      body: {
        serverUrl: credentials.serverUrl,
        username: credentials.username,
        password: credentials.password,
        action,
        ...params,
      },
    });

    if (error) {
      console.warn(`[IPTV] API error for action=${action}:`, error.message);
      throw new Error(error.message || 'IPTV API error');
    }

    return data;
  } catch (err) {
    // Catch CORS/network errors that supabase client may throw
    console.warn(`[IPTV] Network/CORS error for action=${action}:`, err);
    throw err;
  }
}

// Build a proxied stream URL that goes through the HTTPS edge function
export function buildProxyStreamUrl(directUrl: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return `${supabaseUrl}/functions/v1/iptv?apikey=${anonKey}&streamUrl=${encodeURIComponent(directUrl)}`;
}

export async function testConnection(credentials: IPTVCredentials): Promise<{ success: boolean; userInfo?: IPTVUserInfo; serverInfo?: IPTVServerInfo; error?: string }> {
  try {
    const data = await callIPTVProxy(credentials, 'get_user_info');
    return {
      success: data.success,
      userInfo: data.user_info,
      serverInfo: data.server_info,
      error: data.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// VOD (Movies)
export async function getVodCategories(credentials: IPTVCredentials): Promise<IPTVCategory[]> {
  const data = await callIPTVProxy(credentials, 'get_vod_categories');
  return Array.isArray(data) ? data : [];
}

export async function getVodStreams(credentials: IPTVCredentials, categoryId?: string): Promise<IPTVVodStream[]> {
  const params = categoryId ? { categoryId } : {};
  const data = await callIPTVProxy(credentials, 'get_vod_streams', params);
  return Array.isArray(data) ? data : [];
}

// Series
export async function getSeriesCategories(credentials: IPTVCredentials): Promise<IPTVCategory[]> {
  const data = await callIPTVProxy(credentials, 'get_series_categories');
  return Array.isArray(data) ? data : [];
}

export async function getSeries(credentials: IPTVCredentials, categoryId?: string): Promise<IPTVSeriesInfo[]> {
  const params = categoryId ? { categoryId } : {};
  const data = await callIPTVProxy(credentials, 'get_series', params);
  return Array.isArray(data) ? data : [];
}

export async function getSeriesInfo(credentials: IPTVCredentials, seriesId: string): Promise<IPTVSeriesDetails> {
  const data = await callIPTVProxy(credentials, 'get_series_info', { seriesId });
  return data;
}

// Live TV
export async function getLiveCategories(credentials: IPTVCredentials): Promise<IPTVCategory[]> {
  const data = await callIPTVProxy(credentials, 'get_live_categories');
  return Array.isArray(data) ? data : [];
}

export async function getLiveStreams(credentials: IPTVCredentials, categoryId?: string): Promise<IPTVLiveStream[]> {
  const params = categoryId ? { categoryId } : {};
  const data = await callIPTVProxy(credentials, 'get_live_streams', params);
  return Array.isArray(data) ? data : [];
}

// Stream URL builders — returns direct URL; use buildProxyStreamUrl() to proxy through HTTPS
export function buildVodStreamUrl(credentials: IPTVCredentials, streamId: number, extension: string): string {
  const baseUrl = credentials.serverUrl.replace(/\/$/, '');
  const directUrl = `${baseUrl}/movie/${credentials.username}/${credentials.password}/${streamId}.${extension}`;
  return buildProxyStreamUrl(directUrl);
}

export function buildSeriesStreamUrl(credentials: IPTVCredentials, streamId: number, extension: string): string {
  const baseUrl = credentials.serverUrl.replace(/\/$/, '');
  const directUrl = `${baseUrl}/series/${credentials.username}/${credentials.password}/${streamId}.${extension}`;
  return buildProxyStreamUrl(directUrl);
}

export function buildLiveStreamUrl(credentials: IPTVCredentials, streamId: number): string {
  const baseUrl = credentials.serverUrl.replace(/\/$/, '');
  const directUrl = `${baseUrl}/${credentials.username}/${credentials.password}/${streamId}`;
  return buildProxyStreamUrl(directUrl);
}
