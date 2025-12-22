import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { TVChannel } from '@/data/tvChannels';

interface TVPlayerProps {
  channel: TVChannel;
  onOpenChannelList: () => void;
  onOpenEPG: () => void;
  onBack: () => void;
}

const TVPlayer = ({ channel, onOpenChannelList, onOpenEPG, onBack }: TVPlayerProps) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showControls = useCallback(() => {
    setShowOverlay(true);
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setShowOverlay(false);
    }, 3000);
  }, []);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showControls]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    showControls();
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onOpenChannelList();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onOpenEPG();
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault();
      onBack();
    } else if (e.key === 'm' || e.key === 'M') {
      setIsMuted(prev => !prev);
    }
  }, [onOpenChannelList, onOpenEPG, onBack, showControls]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const logoColors: Record<string, string> = {
    sports: 'from-red-500 to-orange-500',
    news: 'from-blue-500 to-cyan-500',
    movies: 'from-purple-500 to-pink-500',
    entertainment: 'from-yellow-500 to-amber-500',
    documentary: 'from-green-500 to-emerald-500'
  };

  // Calculate progress (mock - random between 20-80%)
  const progress = Math.floor(Math.random() * 60) + 20;

  return (
    <div 
      className="fixed inset-0 bg-black z-50 cursor-none"
      onMouseMove={showControls}
      onClick={showControls}
    >
      {/* Video Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className={`
          w-32 h-32 rounded-full flex items-center justify-center
          bg-gradient-to-br ${logoColors[channel.category]}
          text-white font-bold text-3xl opacity-20
        `}>
          {channel.shortName}
        </div>
      </div>

      {/* Minimal UI (always visible when overlay hidden) */}
      <div className={`
        absolute top-4 right-4 transition-opacity duration-500
        ${showOverlay ? 'opacity-0' : 'opacity-100'}
      `}>
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-white text-sm font-medium">{channel.number}</span>
        </div>
      </div>

      {/* Bottom Overlay */}
      <div className={`
        absolute inset-x-0 bottom-0 
        bg-gradient-to-t from-black via-black/80 to-transparent
        transition-all duration-500 ease-out
        ${showOverlay ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}>
        <div className="p-6 pb-8">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Channel Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Channel Number & Name */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">{channel.number}</span>
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  bg-gradient-to-br ${logoColors[channel.category]}
                  text-white font-bold text-sm shadow-lg
                `}>
                  {channel.shortName.slice(0, 3)}
                </div>
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

              {/* Program Info */}
              <div className="ml-4 pl-4 border-l border-white/20">
                <h3 className="text-lg text-white/90">{channel.currentProgram.title}</h3>
                <p className="text-sm text-white/50">
                  {channel.currentProgram.startTime} - {channel.currentProgram.endTime}
                  {channel.currentProgram.rating && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/10 rounded">
                      {channel.currentProgram.rating}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Navigation Hints */}
          <div className="flex gap-6 mt-4 text-sm text-white/40">
            <span className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4" /> Channels
            </span>
            <span className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4" /> Guide
            </span>
            <span>ESC to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVPlayer;
