import { supabase } from "@/integrations/supabase/client";

export interface KodiConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

interface KodiRPCResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  details?: unknown;
}

async function callKodiProxy(config: KodiConfig, method: string, params?: Record<string, unknown>): Promise<KodiRPCResponse> {
  const { data, error } = await supabase.functions.invoke('kodi', {
    body: {
      kodiHost: config.host,
      kodiPort: config.port,
      kodiUsername: config.username,
      kodiPassword: config.password,
      method,
      params,
    },
  });

  if (error) {
    throw new Error(error.message || 'Kodi API error');
  }

  return data;
}

// Test connection to Kodi
export async function testKodiConnection(config: KodiConfig): Promise<{ success: boolean; version?: string; error?: string }> {
  try {
    const response = await callKodiProxy(config, 'JSONRPC.Version');
    if (response.success && response.result) {
      const result = response.result as { version: { major: number; minor: number; patch: number } };
      return {
        success: true,
        version: `${result.version.major}.${result.version.minor}.${result.version.patch}`,
      };
    }
    return { success: false, error: response.error || 'Unknown error' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// Play a video file/URL on Kodi
export async function playOnKodi(config: KodiConfig, streamUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await callKodiProxy(config, 'Player.Open', {
      item: { file: streamUrl },
    });
    return { success: response.success, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Playback failed',
    };
  }
}

// Stop playback
export async function stopPlayback(config: KodiConfig): Promise<{ success: boolean; error?: string }> {
  try {
    // Get active players first
    const playersResponse = await callKodiProxy(config, 'Player.GetActivePlayers');
    if (!playersResponse.success) {
      return { success: false, error: playersResponse.error };
    }

    const players = playersResponse.result as Array<{ playerid: number }>;
    if (players.length === 0) {
      return { success: true }; // No active players
    }

    // Stop each active player
    for (const player of players) {
      await callKodiProxy(config, 'Player.Stop', { playerid: player.playerid });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Stop failed',
    };
  }
}

// Pause/Resume playback
export async function togglePlayPause(config: KodiConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const playersResponse = await callKodiProxy(config, 'Player.GetActivePlayers');
    if (!playersResponse.success) {
      return { success: false, error: playersResponse.error };
    }

    const players = playersResponse.result as Array<{ playerid: number }>;
    if (players.length === 0) {
      return { success: false, error: 'No active player' };
    }

    const response = await callKodiProxy(config, 'Player.PlayPause', { playerid: players[0].playerid });
    return { success: response.success, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Toggle failed',
    };
  }
}

// Get currently playing item info
export async function getNowPlaying(config: KodiConfig): Promise<{ success: boolean; item?: unknown; error?: string }> {
  try {
    const playersResponse = await callKodiProxy(config, 'Player.GetActivePlayers');
    if (!playersResponse.success) {
      return { success: false, error: playersResponse.error };
    }

    const players = playersResponse.result as Array<{ playerid: number }>;
    if (players.length === 0) {
      return { success: true, item: null };
    }

    const response = await callKodiProxy(config, 'Player.GetItem', {
      playerid: players[0].playerid,
      properties: ['title', 'file', 'thumbnail', 'runtime'],
    });

    return { success: response.success, item: response.result, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get now playing',
    };
  }
}

// Set volume
export async function setVolume(config: KodiConfig, volume: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await callKodiProxy(config, 'Application.SetVolume', {
      volume: Math.max(0, Math.min(100, volume)),
    });
    return { success: response.success, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Volume change failed',
    };
  }
}

// Seek to position (percentage)
export async function seekTo(config: KodiConfig, percentage: number): Promise<{ success: boolean; error?: string }> {
  try {
    const playersResponse = await callKodiProxy(config, 'Player.GetActivePlayers');
    if (!playersResponse.success) {
      return { success: false, error: playersResponse.error };
    }

    const players = playersResponse.result as Array<{ playerid: number }>;
    if (players.length === 0) {
      return { success: false, error: 'No active player' };
    }

    const response = await callKodiProxy(config, 'Player.Seek', {
      playerid: players[0].playerid,
      value: { percentage: Math.max(0, Math.min(100, percentage)) },
    });

    return { success: response.success, error: response.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Seek failed',
    };
  }
}
