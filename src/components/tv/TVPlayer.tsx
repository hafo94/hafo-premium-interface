import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Volume2, VolumeX, Settings, ChevronUp, ChevronDown, 
  ArrowLeft, Play, Pause, SkipBack, SkipForward, Maximize, Minimize 
} from 'lucide-react';
import StreamPlayer from '@/components/player/StreamPlayer';

export interface BrowserChannel {
  id: number;
  name: string;
  icon: string;
  category: string;
  streamUrl: string;
  epgId: string;
  hasArchive: boolean;
}

interface TVPlayerProps {
  channel: BrowserChannel;
  onOpenChannelList: () => void;
  onOpenEPG: () => void;
  onBack: () => void;
  onChannelChange?: (channel: BrowserChannel) => void;
  allChannels?: BrowserChannel[];
}

const TVPlayer = ({ channel, onOpenChannelList, onOpenEPG, onBack, onChannelChange, allChannels = [] }: TVPlayerProps) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCenterPlay, setShowCenterPlay] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const centerPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showControls = useCallback(() => {
    setShowOverlay(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowOverlay(false), 4000);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPaused(prev => !prev);
    setShowCenterPlay(true);
    if (centerPlayTimeoutRef.current) clearTimeout(centerPlayTimeoutRef.current);
    centerPlayTimeoutRef.current = setTimeout(() => setShowCenterPlay(false), 800);
    showControls();
  }, [showControls]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  const navigateChannel = useCallback((direction: 'prev' | 'next') => {
    if (allChannels.length === 0) return;
    const currentIndex = allChannels.findIndex(c => c.id === channel.id);
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? allChannels.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= allChannels.length - 1 ? 0 : currentIndex + 1;
    }
    onChannelChange?.(allChannels[newIndex]);
    showControls();
  }, [channel.id, allChannels, onChannelChange, showControls]);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (centerPlayTimeoutRef.current) clearTimeout(centerPlayTimeoutRef.current);
    };
  }, [showControls]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    showControls();
    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); onOpenChannelList(); break;
      case 'ArrowDown': e.preventDefault(); onOpenEPG(); break;
      case 'Escape': case 'Backspace': e.preventDefault(); onBack(); break;
      case 'm': case 'M': setIsMuted(prev => !prev); break;
      case ' ': e.preventDefault(); togglePlayPause(); break;
      case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
      case 'PageUp': e.preventDefault(); navigateChannel('prev'); break;
      case 'PageDown': e.preventDefault(); navigateChannel('next'); break;
    }
  }, [onOpenChannelList, onOpenEPG, onBack, showControls, togglePlayPause, toggleFullscreen, navigateChannel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      className="fixed inset-0 bg-black z-50 cursor-none"
      onMouseMove={showControls}
      onClick={() => { showControls(); togglePlayPause(); }}
    >
      {/* Stream Player */}
      <StreamPlayer
        streamUrl={channel.streamUrl}
        isPlaying={!isPaused}
        isMuted={isMuted}
        onReady={() => setStreamReady(true)}
      />

      {/* Center Play/Pause Indicator */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showCenterPlay ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-24 h-24 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
          {isPaused ? <Play className="w-12 h-12 text-white ml-1" fill="white" /> : <Pause className="w-12 h-12 text-white" fill="white" />}
        </div>
      </div>

      {/* Top-Left Back Button */}
      <div className={`absolute top-4 left-4 transition-all duration-500 ${showOverlay ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-white/20 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-medium">Tillbaka</span>
        </button>
      </div>

      {/* Minimal UI (always visible when overlay hidden) */}
      <div className={`absolute top-4 right-4 transition-opacity duration-500 ${showOverlay ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-white text-sm font-medium truncate max-w-[120px]">{channel.name}</span>
        </div>
      </div>

      {/* Bottom Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 ease-out ${showOverlay ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-8">
          {/* Channel Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {channel.icon && (
                <img src={channel.icon} alt={channel.name} className="w-12 h-12 rounded-lg object-contain bg-white/10" />
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">{channel.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-red-400 text-sm font-semibold">LIVE</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button onClick={() => navigateChannel('prev')} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Föregående kanal (Page Up)">
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              <button onClick={togglePlayPause} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Spela/Pausa (Space)">
                {isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
              </button>
              <button onClick={() => navigateChannel('next')} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Nästa kanal (Page Down)">
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              <div className="w-px h-8 bg-white/20 mx-2" />
              <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Ljud av/på (M)">
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
              <button onClick={toggleFullscreen} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Fullskärm (F)">
                {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Navigation Hints */}
          <div className="flex gap-6 mt-4 text-sm text-white/40">
            <span className="flex items-center gap-2"><ChevronUp className="w-4 h-4" /> Kanaler</span>
            <span className="flex items-center gap-2"><ChevronDown className="w-4 h-4" /> Guide</span>
            <span>SPACE Spela/Pausa</span>
            <span>F Fullskärm</span>
            <span>ESC Avsluta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVPlayer;
