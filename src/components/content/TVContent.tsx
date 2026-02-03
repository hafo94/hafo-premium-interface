import { useState, useCallback } from "react";
import { tvChannels, TVChannel, TVProgram, categoryLabels, getCategoryCount } from "@/data/tvChannels";
import { useTVHomeChannels } from "@/hooks/useTVHomeChannels";
import ChannelCard from "@/components/tv/ChannelCard";
import TVPlayer from "@/components/tv/TVPlayer";
import ChannelListOverlay from "@/components/tv/ChannelListOverlay";
import EPGGrid from "@/components/tv/EPGGrid";
import TVHomeSettings from "@/components/tv/TVHomeSettings";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TVContentProps {
  activeSection: string;
}

const TVContent = ({ activeSection }: TVContentProps) => {
  const { homeChannels, iconSize, isOnHome } = useTVHomeChannels();
  const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showEPG, setShowEPG] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const homeChannelsList = tvChannels.filter((c) => homeChannels.includes(c.id));
  // Sort by the order in homeChannels array
  const sortedHomeChannels = homeChannels
    .map(id => tvChannels.find(c => c.id === id))
    .filter(Boolean) as TVChannel[];

  const handleChannelSelect = useCallback((channel: TVChannel) => {
    setSelectedChannel(channel);
    setShowChannelList(false);
    setShowEPG(false);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setSelectedChannel(null);
  }, []);

  const handleProgramSelect = useCallback((channel: TVChannel, program: TVProgram) => {
    if (program.isLive) {
      handleChannelSelect(channel);
    }
  }, [handleChannelSelect]);

  // If watching a channel, show the player
  if (selectedChannel) {
    return (
      <>
        <TVPlayer
          channel={selectedChannel}
          onOpenChannelList={() => setShowChannelList(true)}
          onOpenEPG={() => setShowEPG(true)}
          onBack={handleClosePlayer}
          onChannelChange={handleChannelSelect}
        />
        <ChannelListOverlay
          isOpen={showChannelList}
          onClose={() => setShowChannelList(false)}
          onSelectChannel={handleChannelSelect}
          currentChannel={selectedChannel}
        />
        <EPGGrid
          isOpen={showEPG}
          onClose={() => setShowEPG(false)}
          onSelectProgram={handleProgramSelect}
          currentChannel={selectedChannel}
        />
      </>
    );
  }

  // Show all channels when activeSection is 'all-channels'
  const showAllChannels = activeSection === "all-channels";

  // Icon size classes
  const sizeClasses = {
    small: "w-20 h-14",
    medium: "w-28 h-20",
    large: "w-36 h-24"
  };

  return (
    <div className="min-h-screen px-6 py-8">
      {/* Live indicator */}
      <div className="flex items-center justify-between mb-8">
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
      </div>

      {/* Home Section */}
      {!showAllChannels && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white/90">Mina Kanaler</h2>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white
                         bg-white/5 hover:bg-white/10 rounded-lg border border-white/10
                         transition-all duration-200 flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Inställningar
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {sortedHomeChannels.length > 0 ? (
              sortedHomeChannels.map((channel, index) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isFavorite={true}
                  isSelected={index === selectedIndex}
                  onClick={() => handleChannelSelect(channel)}
                  size={iconSize}
                />
              ))
            ) : (
              <div className="flex items-center justify-center w-full h-32 rounded-xl border border-dashed border-white/20 text-white/40">
                Inga kanaler ännu. Lägg till kanaler via inställningar.
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Channels Section */}
      {showAllChannels && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white/90">
                Alla Kanaler ({tvChannels.length})
              </h2>
              <div className="text-sm text-white/50">
                {categoryLabels.sports} ({getCategoryCount("sports")}) •{" "}
                {categoryLabels.news} ({getCategoryCount("news")}) •{" "}
                {categoryLabels.entertainment} ({getCategoryCount("entertainment")})
              </div>
            </div>
          </div>

          {/* Channel Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tvChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isFavorite={isOnHome(channel.id)}
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

      {/* Home Settings */}
      <TVHomeSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default TVContent;
