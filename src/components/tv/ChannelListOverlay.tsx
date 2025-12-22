import { useState, useEffect, useCallback } from 'react';
import { X, Star, Clock } from 'lucide-react';
import { tvChannels, TVChannel } from '@/data/tvChannels';
import { useTVFavorites } from '@/hooks/useTVFavorites';

interface ChannelListOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel: (channel: TVChannel) => void;
  currentChannel?: TVChannel;
}

const ChannelListOverlay = ({ 
  isOpen, 
  onClose, 
  onSelectChannel,
  currentChannel 
}: ChannelListOverlayProps) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'all' | 'recent'>('favorites');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { favorites, isFavorite } = useTVFavorites();

  const getChannelList = () => {
    switch (activeTab) {
      case 'favorites':
        return tvChannels.filter(c => favorites.includes(c.id));
      case 'recent':
        // Mock recent - just return first 5 channels
        return tvChannels.slice(0, 5);
      default:
        return tvChannels;
    }
  };

  const channelList = getChannelList();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, channelList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs = ['favorites', 'all', 'recent'] as const;
      const currentIndex = tabs.indexOf(activeTab);
      setActiveTab(tabs[Math.max(currentIndex - 1, 0)]);
      setSelectedIndex(0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs = ['favorites', 'all', 'recent'] as const;
      const currentIndex = tabs.indexOf(activeTab);
      setActiveTab(tabs[Math.min(currentIndex + 1, tabs.length - 1)]);
      setSelectedIndex(0);
    } else if (e.key === 'Enter' && channelList[selectedIndex]) {
      onSelectChannel(channelList[selectedIndex]);
    }
  }, [isOpen, onClose, activeTab, channelList, selectedIndex, onSelectChannel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [activeTab]);

  if (!isOpen) return null;

  const logoColors: Record<string, string> = {
    sports: 'from-red-500 to-orange-500',
    news: 'from-blue-500 to-cyan-500',
    movies: 'from-purple-500 to-pink-500',
    entertainment: 'from-yellow-500 to-amber-500',
    documentary: 'from-green-500 to-emerald-500'
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-start justify-center pt-20"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-black/95 
                   backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl
                   animate-[slideInFromTop_0.3s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My Channels</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { key: 'favorites', label: 'Favorites', icon: Star },
              { key: 'all', label: 'All Channels', icon: null },
              { key: 'recent', label: 'Recent', icon: Clock }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  flex items-center gap-2
                  ${activeTab === tab.key 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                `}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channel List */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {channelList.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              No channels in this category
            </div>
          ) : (
            <div className="space-y-2">
              {channelList.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200
                    ${selectedIndex === index 
                      ? 'bg-white/10 ring-2 ring-primary/50' 
                      : 'hover:bg-white/5'}
                    ${currentChannel?.id === channel.id ? 'bg-primary/20' : ''}
                  `}
                >
                  {/* Channel Logo */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${logoColors[channel.category]}
                    text-white font-bold text-sm shadow-lg
                  `}>
                    {channel.shortName.slice(0, 3)}
                  </div>

                  {/* Channel Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-sm">{channel.number}</span>
                      <span className="text-white font-medium">{channel.name}</span>
                      {isFavorite(channel.id) && (
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-white/50 text-sm truncate">
                      {channel.currentProgram.title}
                    </p>
                  </div>

                  {/* Live Indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs text-red-400 font-medium">LIVE</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ChannelListOverlay;
