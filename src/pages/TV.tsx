import { useState } from 'react';
import { tvChannels, TVChannel, TVProgram } from '@/data/tvChannels';
import LiveTVHome from '@/components/tv/LiveTVHome';
import TVPlayer from '@/components/tv/TVPlayer';
import ChannelListOverlay from '@/components/tv/ChannelListOverlay';
import EPGGrid from '@/components/tv/EPGGrid';
import ChannelSettings from '@/components/tv/ChannelSettings';

type ViewMode = 'home' | 'player';

const TV = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentChannel, setCurrentChannel] = useState<TVChannel | null>(null);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showEPG, setShowEPG] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleChannelSelect = (channel: TVChannel) => {
    setCurrentChannel(channel);
    setViewMode('player');
    setShowChannelList(false);
    setShowEPG(false);
  };

  const handleProgramSelect = (channel: TVChannel, program: TVProgram) => {
    if (program.isLive) {
      setCurrentChannel(channel);
      setViewMode('player');
      setShowEPG(false);
    }
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setCurrentChannel(null);
  };

  return (
    <>
      {viewMode === 'home' && (
        <LiveTVHome
          onChannelSelect={handleChannelSelect}
          onViewAll={() => setShowSettings(true)}
          onEditFavorites={() => setShowSettings(true)}
        />
      )}

      {viewMode === 'player' && currentChannel && (
        <TVPlayer
          channel={currentChannel}
          onOpenChannelList={() => setShowChannelList(true)}
          onOpenEPG={() => setShowEPG(true)}
          onBack={handleBackToHome}
        />
      )}

      <ChannelListOverlay
        isOpen={showChannelList}
        onClose={() => setShowChannelList(false)}
        onSelectChannel={handleChannelSelect}
        currentChannel={currentChannel || undefined}
      />

      <EPGGrid
        isOpen={showEPG}
        onClose={() => setShowEPG(false)}
        onSelectProgram={handleProgramSelect}
        currentChannel={currentChannel || undefined}
      />

      <ChannelSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default TV;
