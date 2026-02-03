import { useState, useCallback } from "react";
import { tvChannels, TVChannel, categoryLabels, getCategoryCount } from "@/data/tvChannels";
import { useTVFavorites } from "@/hooks/useTVFavorites";
import ChannelCard from "@/components/tv/ChannelCard";
import TVPlayer from "@/components/tv/TVPlayer";
import ChannelListOverlay from "@/components/tv/ChannelListOverlay";
import { ChevronDown } from "lucide-react";

interface TVContentProps {
  activeSection: string;
}

const TVContent = ({ activeSection }: TVContentProps) => {
  const { favorites, isFavorite, toggleFavorite } = useTVFavorites();
  const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showEPG, setShowEPG] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const favoriteChannels = tvChannels.filter((c) => favorites.includes(c.id));

  const categoryCounts = {
    sports: getCategoryCount("sports"),
    news: getCategoryCount("news"),
    entertainment: getCategoryCount("entertainment"),
    movies: getCategoryCount("movies"),
    documentary: getCategoryCount("documentary"),
  };

  const handleChannelSelect = useCallback((channel: TVChannel) => {
    setSelectedChannel(channel);
    setShowChannelList(false);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setSelectedChannel(null);
  }, []);

  // If watching a channel, show the player
  if (selectedChannel) {
    return (
      <TVPlayer
        channel={selectedChannel}
        onOpenChannelList={() => setShowChannelList(true)}
        onOpenEPG={() => setShowEPG(true)}
        onBack={handleClosePlayer}
      />
    );
  }

  // Show favorites when activeSection is 'favorites'
  const showFavoritesOnly = activeSection === "favorites";

  return (
    <div className="min-h-screen px-6 py-8">
      {/* Live indicator */}
      <div className="flex items-center gap-3 mb-8">
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

      {/* Favorites Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white/90">Favorites</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {favoriteChannels.length > 0 ? (
            favoriteChannels.map((channel, index) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isFavorite={true}
                isSelected={index === selectedIndex}
                onClick={() => handleChannelSelect(channel)}
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

      {/* All Channels Section - only show if not in favorites mode */}
      {!showFavoritesOnly && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white/90">
                All Channels ({tvChannels.length})
              </h2>
              <div className="text-sm text-white/50">
                {categoryLabels.sports} ({categoryCounts.sports}) •{" "}
                {categoryLabels.news} ({categoryCounts.news}) •{" "}
                {categoryLabels.entertainment} ({categoryCounts.entertainment})
              </div>
            </div>
            <button
              onClick={() => setShowChannelList(true)}
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
                onClick={() => handleChannelSelect(channel)}
                size="small"
              />
            ))}
          </div>
        </section>
      )}

      {/* Channel List Overlay */}
      <ChannelListOverlay
        isOpen={showChannelList}
        onClose={() => setShowChannelList(false)}
        onSelectChannel={handleChannelSelect}
        currentChannel={selectedChannel ?? undefined}
      />
    </div>
  );
};

export default TVContent;
