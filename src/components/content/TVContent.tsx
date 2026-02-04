import { useState, useCallback, useEffect } from "react";
import { tvChannels, TVChannel, TVProgram, categoryLabels, getCategoryCount } from "@/data/tvChannels";
import { useTVHomeChannels } from "@/hooks/useTVHomeChannels";
import ChannelCard from "@/components/tv/ChannelCard";
import TVPlayer from "@/components/tv/TVPlayer";
import ChannelListOverlay from "@/components/tv/ChannelListOverlay";
import EPGGrid from "@/components/tv/EPGGrid";
import TVHomeSettings from "@/components/tv/TVHomeSettings";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocus } from "@/contexts/FocusContext";

interface TVContentProps {
  activeSection: string;
}

const TVContent = ({ activeSection }: TVContentProps) => {
  const { homeChannels, iconSize, isOnHome } = useTVHomeChannels();
  const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showEPG, setShowEPG] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { activeZone, contentIndex, setContentIndex, focusSidebar, focusHeader, setActiveZone } = useFocus();
  const isContentFocused = activeZone === "content";

  const homeChannelsList = tvChannels.filter((c) => homeChannels.includes(c.id));
  const sortedHomeChannels = homeChannels
    .map(id => tvChannels.find(c => c.id === id))
    .filter(Boolean) as TVChannel[];

  // Show all channels when activeSection is 'all-channels'
  const showAllChannels = activeSection === "all-channels";

  // Calculate visible channels
  const visibleChannels = showAllChannels ? tvChannels : sortedHomeChannels;
  const columnsPerRow = showAllChannels ? 6 : visibleChannels.length; // Single row for home

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

  // Keyboard navigation for content area
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isContentFocused || selectedChannel) return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Skip alt key combos
      if (e.altKey) return;

      const { row, col } = contentIndex;
      const totalChannels = visibleChannels.length;

      if (showAllChannels) {
        // Grid navigation for all channels
        const currentIndex = row * columnsPerRow + col;

        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            if (col === 0) {
              focusSidebar();
            } else {
              setContentIndex({ row, col: col - 1 });
            }
            break;
          case "ArrowRight":
            e.preventDefault();
            const nextCol = col + 1;
            const nextIndex = row * columnsPerRow + nextCol;
            if (nextCol < columnsPerRow && nextIndex < totalChannels) {
              setContentIndex({ row, col: nextCol });
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            if (row === 0) {
              focusHeader();
            } else {
              const prevRowIndex = (row - 1) * columnsPerRow + col;
              if (prevRowIndex >= 0) {
                setContentIndex({ row: row - 1, col });
              }
            }
            break;
          case "ArrowDown":
            e.preventDefault();
            const nextRowIndex = (row + 1) * columnsPerRow + col;
            if (nextRowIndex < totalChannels) {
              setContentIndex({ row: row + 1, col: Math.min(col, (totalChannels - 1) % columnsPerRow) });
            }
            break;
          case "Enter":
            e.preventDefault();
            if (currentIndex < totalChannels) {
              handleChannelSelect(visibleChannels[currentIndex]);
            }
            break;
        }
      } else {
        // Horizontal navigation for home channels
        const currentIndex = col;

        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            if (col === 0) {
              focusSidebar();
            } else {
              setContentIndex({ row: 0, col: col - 1 });
            }
            break;
          case "ArrowRight":
            e.preventDefault();
            if (col < totalChannels - 1) {
              setContentIndex({ row: 0, col: col + 1 });
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            focusHeader();
            break;
          case "Enter":
            e.preventDefault();
            if (currentIndex < totalChannels) {
              handleChannelSelect(visibleChannels[currentIndex]);
            }
            break;
        }
      }
    },
    [isContentFocused, selectedChannel, contentIndex, visibleChannels, showAllChannels, columnsPerRow, focusSidebar, setContentIndex, handleChannelSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  // Calculate focused index based on layout
  const getFocusedIndex = () => {
    if (showAllChannels) {
      return contentIndex.row * columnsPerRow + contentIndex.col;
    }
    return contentIndex.col;
  };

  const focusedIndex = getFocusedIndex();

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
                  isSelected={isContentFocused && focusedIndex === index}
                  onClick={() => {
                    setActiveZone("content");
                    setContentIndex({ row: 0, col: index });
                    handleChannelSelect(channel);
                  }}
                  onMouseEnter={() => {
                    if (isContentFocused) {
                      setContentIndex({ row: 0, col: index });
                    }
                  }}
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
            {tvChannels.map((channel, index) => {
              const row = Math.floor(index / columnsPerRow);
              const col = index % columnsPerRow;
              const isFocused = isContentFocused && contentIndex.row === row && contentIndex.col === col;
              
              return (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isFavorite={isOnHome(channel.id)}
                  isSelected={isFocused}
                  onClick={() => {
                    setActiveZone("content");
                    setContentIndex({ row, col });
                    handleChannelSelect(channel);
                  }}
                  onMouseEnter={() => {
                    if (isContentFocused) {
                      setContentIndex({ row, col });
                    }
                  }}
                  size="small"
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Keyboard hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground/50">
          ← Sidebar • ↑↓←→ Navigate • Enter Select
        </p>
      </div>

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
