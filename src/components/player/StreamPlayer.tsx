import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface StreamPlayerProps {
  streamUrl: string;
  isPlaying?: boolean;
  isMuted?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  onError?: (error: string) => void;
  onReady?: () => void;
  className?: string;
}

const StreamPlayer = ({
  streamUrl,
  isPlaying = true,
  isMuted = false,
  onPlayStateChange,
  onError,
  onReady,
  className = '',
}: StreamPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const loadStream = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    destroyHls();
    setStatus('loading');
    setErrorMessage('');

    const isHls = streamUrl.includes('.m3u8') || !streamUrl.match(/\.\w{2,4}$/);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        onReady?.();
        if (isPlaying) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          const msg = data.type === Hls.ErrorTypes.NETWORK_ERROR
            ? 'Network error — check your connection'
            : data.type === Hls.ErrorTypes.MEDIA_ERROR
            ? 'Media error — stream format not supported'
            : 'Stream playback failed';
          setStatus('error');
          setErrorMessage(msg);
          onError?.(msg);
        }
      });
    } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setStatus('playing');
        onReady?.();
        if (isPlaying) video.play().catch(() => {});
      }, { once: true });
    } else {
      // Direct URL (mp4, ts)
      video.src = streamUrl;
      video.addEventListener('loadeddata', () => {
        setStatus('playing');
        onReady?.();
        if (isPlaying) video.play().catch(() => {});
      }, { once: true });
    }

    video.addEventListener('error', () => {
      setStatus('error');
      setErrorMessage('Failed to load stream');
      onError?.('Failed to load stream');
    }, { once: true });
  }, [streamUrl, isPlaying, destroyHls, onReady, onError]);

  // Load stream when URL changes
  useEffect(() => {
    loadStream();
    return destroyHls;
  }, [streamUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || status !== 'playing') return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, status]);

  // Sync mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
      />

      {/* Loading State */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-foreground/60 text-sm">Loading stream...</p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-foreground/80 text-sm text-center max-w-xs">{errorMessage}</p>
          <button
            onClick={loadStream}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 
                       text-primary transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;
