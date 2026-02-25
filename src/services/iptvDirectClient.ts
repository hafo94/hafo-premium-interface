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

function buildApiUrl(credentials: IPTVCredentials, action: string, params: Record<string, string> = {}, forceHttps = false): string {
  let baseUrl = credentials.serverUrl.replace(/\/$/, '');
  if (forceHttps) {
    baseUrl = baseUrl.replace(/^http:\/\//i, 'https://');
  }
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
  const isHttpServer = credentials.serverUrl.startsWith('http://');
  const isSecurePage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  // Strategy: If we're on HTTPS and server is HTTP, try HTTPS version first to avoid mixed content
  const attempts: Array<{ label: string; url: string }> = [];
  
  if (isSecurePage && isHttpServer) {
    // Try HTTPS first (avoids mixed content), then fall back to proxy
    attempts.push({ label: 'HTTPS direct', url: buildApiUrl(credentials, action, params, true) });
  } else {
    // Server is already HTTPS or we're on HTTP - just try direct
    attempts.push({ label: 'direct', url: buildApiUrl(credentials, action, params) });
  }
  
  for (const attempt of attempts) {
    try {
      console.log(`[IPTV Direct] Trying ${attempt.label} for ${action}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch(attempt.url, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        console.warn(`[IPTV Direct] ${attempt.label} returned ${response.status} for ${action}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`[IPTV Direct] ${attempt.label} success for ${action}, data length: ${Array.isArray(data) ? data.length : 'object'}`);
      return data;
    } catch (err) {
      console.warn(`[IPTV Direct] ${attempt.label} failed for ${action}:`, err);
    }
  }
  
  // Final fallback: edge function proxy
  console.log(`[IPTV Direct] All direct attempts failed for ${action}, falling back to proxy`);
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
