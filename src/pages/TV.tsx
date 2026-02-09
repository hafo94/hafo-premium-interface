import { useState, useCallback } from 'react';
import { useIPTVContext } from '@/contexts/IPTVContext';
import { useLiveStreams } from '@/hooks/useIPTV';
import { buildLiveStreamUrl } from '@/services/iptvService';
import LiveTVHome from '@/components/tv/LiveTVHome';
import TVPlayer, { BrowserChannel } from '@/components/tv/TVPlayer';
import SettingsModal from '@/components/SettingsModal';

type ViewMode = 'home' | 'player';

const TV = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentChannel, setCurrentChannel] = useState<BrowserChannel | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { iptvCredentials } = useIPTVContext();
  const { data: streams } = useLiveStreams();

  // Build all channels for channel switching in player
  const allChannels: BrowserChannel[] = (streams || []).map(s => ({
    id: s.stream_id,
    name: s.name,
    icon: s.stream_icon || '',
    category: s.category_id,
    streamUrl: iptvCredentials ? buildLiveStreamUrl(iptvCredentials, s.stream_id) : '',
    epgId: s.epg_channel_id || '',
    hasArchive: s.tv_archive > 0,
  }));

  const handleChannelSelect = useCallback((channel: BrowserChannel) => {
    setCurrentChannel(channel);
    setViewMode('player');
  }, []);

  const handleBackToHome = useCallback(() => {
    setViewMode('home');
    setCurrentChannel(null);
  }, []);

  return (
    <>
      {viewMode === 'home' && (
        <LiveTVHome
          onChannelSelect={handleChannelSelect}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {viewMode === 'player' && currentChannel && (
        <TVPlayer
          channel={currentChannel}
          allChannels={allChannels}
          onOpenChannelList={() => {}}
          onOpenEPG={() => {}}
          onBack={handleBackToHome}
          onChannelChange={handleChannelSelect}
        />
      )}

      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
};

export default TV;
