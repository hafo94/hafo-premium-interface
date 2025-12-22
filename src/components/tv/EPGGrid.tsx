import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { tvChannels, TVChannel, TVProgram } from '@/data/tvChannels';

interface EPGGridProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProgram: (channel: TVChannel, program: TVProgram) => void;
  currentChannel?: TVChannel;
}

const EPGGrid = ({ isOpen, onClose, onSelectProgram, currentChannel }: EPGGridProps) => {
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0);
  const [timeOffset, setTimeOffset] = useState(0); // Hours offset from now
  const gridRef = useRef<HTMLDivElement>(null);

  // Generate time slots
  const now = new Date();
  const baseHour = now.getHours() + timeOffset;
  const timeSlots = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setHours(baseHour + i * 0.5, (i % 2) * 30, 0, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    const channel = tvChannels[selectedChannelIndex];
    const maxPrograms = channel?.schedule?.length || 0;

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedChannelIndex(prev => Math.min(prev + 1, tvChannels.length - 1));
      setSelectedProgramIndex(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedChannelIndex(prev => Math.max(prev - 1, 0));
      setSelectedProgramIndex(0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (selectedProgramIndex < maxPrograms - 1) {
        setSelectedProgramIndex(prev => prev + 1);
      } else {
        setTimeOffset(prev => prev + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (selectedProgramIndex > 0) {
        setSelectedProgramIndex(prev => prev - 1);
      } else if (timeOffset > -2) {
        setTimeOffset(prev => prev - 1);
      }
    } else if (e.key === 'Enter') {
      const selectedChannel = tvChannels[selectedChannelIndex];
      const selectedProgram = selectedChannel?.schedule?.[selectedProgramIndex];
      if (selectedChannel && selectedProgram) {
        onSelectProgram(selectedChannel, selectedProgram);
      }
    }
  }, [isOpen, onClose, selectedChannelIndex, selectedProgramIndex, timeOffset, onSelectProgram]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const logoColors: Record<string, string> = {
    sports: 'from-red-500 to-orange-500',
    news: 'from-blue-500 to-cyan-500',
    movies: 'from-purple-500 to-pink-500',
    entertainment: 'from-yellow-500 to-amber-500',
    documentary: 'from-green-500 to-emerald-500'
  };

  const selectedChannel = tvChannels[selectedChannelIndex];
  const selectedProgram = selectedChannel?.schedule?.[selectedProgramIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">TV Guide</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeOffset(prev => Math.max(prev - 1, -2))}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </button>
            <span className="text-white/60 text-sm min-w-[100px] text-center">
              {timeOffset === 0 ? 'Now' : `${timeOffset > 0 ? '+' : ''}${timeOffset}h`}
            </span>
            <button
              onClick={() => setTimeOffset(prev => prev + 1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-white/60" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* EPG Grid */}
        <div className="flex-1 overflow-auto" ref={gridRef}>
          {/* Time Header */}
          <div className="sticky top-0 z-10 flex bg-gray-900/95 border-b border-white/10">
            <div className="w-48 flex-shrink-0 p-3 text-white/40 text-sm font-medium">
              Channel
            </div>
            <div className="flex-1 flex">
              {timeSlots.map((time, i) => (
                <div 
                  key={i}
                  className={`
                    flex-1 min-w-[120px] p-3 text-sm font-medium border-l border-white/10
                    ${i === 0 && timeOffset === 0 ? 'text-primary' : 'text-white/40'}
                  `}
                >
                  {i === 0 && timeOffset === 0 ? 'NOW' : time}
                </div>
              ))}
            </div>
          </div>

          {/* Channel Rows */}
          {tvChannels.map((channel, channelIndex) => (
            <div 
              key={channel.id}
              className={`
                flex border-b border-white/5
                ${selectedChannelIndex === channelIndex ? 'bg-white/5' : ''}
              `}
            >
              {/* Channel Info */}
              <div className="w-48 flex-shrink-0 p-3 flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  bg-gradient-to-br ${logoColors[channel.category]}
                  text-white font-bold text-xs
                `}>
                  {channel.shortName.slice(0, 3)}
                </div>
                <div>
                  <span className="text-white/40 text-xs">{channel.number}</span>
                  <p className="text-white text-sm font-medium">{channel.name}</p>
                </div>
              </div>

              {/* Programs */}
              <div className="flex-1 flex">
                {channel.schedule.map((program, programIndex) => {
                  const isSelected = selectedChannelIndex === channelIndex && selectedProgramIndex === programIndex;
                  const isLive = program.isLive;
                  const isPast = !isLive && programIndex === 0 && timeOffset > 0;
                  
                  // Calculate width based on duration (30 min = 1 unit)
                  const widthUnits = Math.max(program.duration / 30, 1);
                  
                  return (
                    <button
                      key={program.id}
                      onClick={() => onSelectProgram(channel, program)}
                      onMouseEnter={() => {
                        setSelectedChannelIndex(channelIndex);
                        setSelectedProgramIndex(programIndex);
                      }}
                      className={`
                        min-w-[120px] p-3 text-left border-l border-white/10
                        transition-all duration-200
                        ${isSelected 
                          ? 'bg-primary/30 ring-2 ring-primary/50' 
                          : isLive 
                            ? 'bg-primary/10' 
                            : isPast 
                              ? 'bg-white/[0.02] opacity-50' 
                              : 'hover:bg-white/5'}
                      `}
                      style={{ flex: widthUnits }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isLive && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        <span className="text-white/40 text-xs">
                          {program.startTime}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium truncate">
                        {program.title}
                      </p>
                      {program.rating && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-white/50">
                          {program.rating}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Details Footer */}
      {selectedProgram && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/10">
          <div className="flex items-start justify-between max-w-4xl">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">{selectedProgram.title}</h3>
                {selectedProgram.isLive && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                    LIVE NOW
                  </span>
                )}
                {selectedProgram.rating && (
                  <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded">
                    {selectedProgram.rating}
                  </span>
                )}
              </div>
              <p className="text-white/60 text-sm mb-2">
                {selectedChannel.name} • {selectedProgram.startTime} - {selectedProgram.endTime}
              </p>
              <p className="text-white/40 text-sm max-w-xl">
                {selectedProgram.description}
              </p>
            </div>
            <div className="flex gap-3">
              {selectedProgram.isLive ? (
                <button 
                  onClick={() => onSelectProgram(selectedChannel, selectedProgram)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 
                           text-white font-medium rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Watch Now
                </button>
              ) : (
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 
                                 text-white font-medium rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  Remind Me
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPGGrid;
