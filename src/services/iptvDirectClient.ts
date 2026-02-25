/**
 * Direct browser-to-IPTV API client.
 * Calls the Xtream Codes API directly from the browser (bypassing edge function)
 * so requests come from the user's residential IP, avoiding datacenter IP blocks.
 * 
 * Falls back to the edge function proxy if direct calls fail (mixed content, CORS).
 */

import { IPTVCredentials, IPTVCategory, IPTVVodStream, IPTVSeriesInfo, IPTVSeriesDetails } from './iptvService';
import { supabase } from '@/integrations/supabase/client';

export interface IPTVVodInfo {
  info: {
    movie_image?: string;
    tmdb_id?: string;
    name?: string;
    o_name?: string;
    cover_big?: string;
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    release_date?: string;
    duration?: string;
    duration_secs?: number;
    rating?: string;
    rating_5based?: number;
    backdrop_path?: string[];
    youtube_trailer?: string;
  };
  movie_data?: {
    stream_id: number;
    name: string;
    container_extension: string;
  };
}

function buildApiUrl(credentials: IPTVCredentials, action: string, params: Record<string, string> = {}): string {
  const baseUrl = credentials.serverUrl.replace(/\/$/, '');
  const url = new URL(`${baseUrl}/player_api.php`);
  url.searchParams.set('username', credentials.username);
  url.searchParams.set('password', credentials.password);
  url.searchParams.set('action', action);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function directFetch<T>(credentials: IPTVCredentials, action: string, params: Record<string, string> = {}): Promise<T> {
  const url = buildApiUrl(credentials, action, params);
  
  try {
    // Try direct fetch first (works from residential IPs)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (directError) {
    console.warn(`[IPTV Direct] Direct fetch failed for ${action}, falling back to proxy:`, directError);
    
    // Fallback to edge function proxy
    const { data, error } = await supabase.functions.invoke('iptv', {
      body: {
        serverUrl: credentials.serverUrl,
        username: credentials.username,
        password: credentials.password,
        action,
        ...params,
      },
    });
    
    if (error) throw error;
    return data as T;
  }
}

// --- Public API ---

export async function directGetUserInfo(credentials: IPTVCredentials) {
  return directFetch<any>(credentials, 'get_user_info');
}

export async function directGetVodCategories(credentials: IPTVCredentials): Promise<IPTVCategory[]> {
  const data = await directFetch<IPTVCategory[]>(credentials, 'get_vod_categories');
  return Array.isArray(data) ? data : [];
}

export async function directGetVodStreams(credentials: IPTVCredentials, categoryId?: string): Promise<IPTVVodStream[]> {
  const params = categoryId ? { category_id: categoryId } : {};
  const data = await directFetch<IPTVVodStream[]>(credentials, 'get_vod_streams', params);
  return Array.isArray(data) ? data : [];
}

export async function directGetVodInfo(credentials: IPTVCredentials, vodId: string): Promise<IPTVVodInfo> {
  return directFetch<IPTVVodInfo>(credentials, 'get_vod_info', { vod_id: vodId });
}

export async function directGetSeriesCategories(credentials: IPTVCredentials): Promise<IPTVCategory[]> {
  const data = await directFetch<IPTVCategory[]>(credentials, 'get_series_categories');
  return Array.isArray(data) ? data : [];
}

export async function directGetSeries(credentials: IPTVCredentials, categoryId?: string): Promise<IPTVSeriesInfo[]> {
  const params = categoryId ? { category_id: categoryId } : {};
  const data = await directFetch<IPTVSeriesInfo[]>(credentials, 'get_series', params);
  return Array.isArray(data) ? data : [];
}

export async function directGetSeriesInfo(credentials: IPTVCredentials, seriesId: string): Promise<IPTVSeriesDetails> {
  return directFetch<IPTVSeriesDetails>(credentials, 'get_series_info', { series_id: seriesId });
}
