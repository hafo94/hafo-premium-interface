import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tvChannels, TVChannel, categoryLabels, getCategoryCount } from '@/data/tvChannels';
import { useTVFavorites } from '@/hooks/useTVFavorites';
import ChannelCard from './ChannelCard';

interface LiveTVHomeProps {
  onChannelSelect: (channel: TVChannel) => void;
  onViewAll: () => void;
  onEditFavorites: () => void;
}

const LiveTVHome = ({ onChannelSelect, onViewAll, onEditFavorites }: LiveTVHomeProps) => {
  const { favorites, isFavorite } = useTVFavorites();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const favoriteChannels = tvChannels.filter(c => favorites.includes(c.id));
  const categoryCounts = {
    sports: getCategoryCount('sports'),
    news: getCategoryCount('news'),
    entertainment: getCategoryCount('entertainment'),
    movies: getCategoryCount('movies'),
    documentary: getCategoryCount('documentary')
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      setSelectedIndex(prev => Math.min(prev + 1, favoriteChannels.length - 1));
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && favoriteChannels[selectedIndex]) {
      onChannelSelect(favoriteChannels[selectedIndex]);
    }
  }, [favoriteChannels, selectedIndex, onChannelSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground p-6">
      {/* Header */}
      <header className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>
            </span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Live TV
            </h1>
          </div>
        </div>
      </header>

      {/* Favorites Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white/90">Favorites</h2>
          <button 
            onClick={onEditFavorites}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white
                       bg-white/5 hover:bg-white/10 rounded-lg border border-white/10
                       transition-all duration-200"
          >
            Edit
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {favoriteChannels.length > 0 ? (
            favoriteChannels.map((channel, index) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isFavorite={true}
                isSelected={index === selectedIndex}
                onClick={() => onChannelSelect(channel)}
                size="medium"
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-32 rounded-xl border border-dashed border-white/20 text-white/40">
              No favorites yet. Add channels to your favorites.
            </div>
          )}
        </div>
      </section>

      {/* All Channels Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white/90">
              All Channels ({tvChannels.length})
            </h2>
            <div className="text-sm text-white/50">
              {categoryLabels.sports} ({categoryCounts.sports}) • {categoryLabels.news} ({categoryCounts.news}) • {categoryLabels.entertainment} ({categoryCounts.entertainment})
            </div>
          </div>
          <button 
            onClick={onViewAll}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white
                       bg-white/5 hover:bg-white/10 rounded-lg border border-white/10
                       transition-all duration-200 flex items-center gap-2"
          >
            View All
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Grid Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tvChannels.slice(0, 6).map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isFavorite={isFavorite(channel.id)}
              onClick={() => onChannelSelect(channel)}
              size="small"
            />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-auto">
        <div className="flex gap-4 text-sm text-white/40">
          <span className="flex items-center gap-2">
            <ChevronUp className="w-4 h-4" /> Channels
          </span>
          <span className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4" /> Guide
          </span>
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" /> Search
          </span>
        </div>
      </section>
    </div>
  );
};

export default LiveTVHome;
