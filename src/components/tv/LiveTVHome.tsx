import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronDown, Search, Loader2, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIPTVContext } from '@/contexts/IPTVContext';
import { useLiveCategories, useLiveStreams } from '@/hooks/useIPTV';
import { buildLiveStreamUrl } from '@/services/iptvService';
import { BrowserChannel } from './TVPlayer';
import { cn } from '@/lib/utils';

interface LiveTVHomeProps {
  onChannelSelect: (channel: BrowserChannel) => void;
  onOpenSettings: () => void;
}

const LiveTVHome = ({ onChannelSelect, onOpenSettings }: LiveTVHomeProps) => {
  const { iptvCredentials, iptvConnected } = useIPTVContext();
  const { data: categories } = useLiveCategories();
  const { data: streams, isLoading } = useLiveStreams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Map IPTV streams to BrowserChannel format
  const allChannels: BrowserChannel[] = (streams || []).map(s => ({
    id: s.stream_id,
    name: s.name,
    icon: s.stream_icon || '',
    category: s.category_id,
    streamUrl: iptvCredentials ? buildLiveStreamUrl(iptvCredentials, s.stream_id) : '',
    epgId: s.epg_channel_id || '',
    hasArchive: s.tv_archive > 0,
  }));

  const filteredChannels = selectedCategory
    ? allChannels.filter(c => c.category === selectedCategory)
    : allChannels;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      setSelectedIndex(prev => Math.min(prev + 1, filteredChannels.length - 1));
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredChannels[selectedIndex]) {
      onChannelSelect(filteredChannels[selectedIndex]);
    }
  }, [filteredChannels, selectedIndex, onChannelSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Not connected state
  if (!iptvCredentials || !iptvConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground p-6 flex flex-col">
        <header className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Live TV</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <Wifi className="w-16 h-16 text-foreground/20" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground/80 mb-2">Connect your IPTV service</h2>
            <p className="text-foreground/50 max-w-md">
              Enter your Xtream Codes credentials in Settings to start watching live TV channels.
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Open Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground p-6">
      {/* Header */}
      <header className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>
          </span>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Live TV
          </h1>
          <span className="text-foreground/40 text-sm ml-2">({allChannels.length} channels)</span>
        </div>
      </header>

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedIndex(0); }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg border transition-all whitespace-nowrap",
              !selectedCategory
                ? "border-primary bg-primary/20 text-primary"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => { setSelectedCategory(cat.category_id); setSelectedIndex(0); }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg border transition-all whitespace-nowrap",
                selectedCategory === cat.category_id
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Channel Grid */}
      {!isLoading && filteredChannels.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredChannels.map((channel, index) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={cn(
                "relative group flex flex-col items-center justify-center gap-2",
                "rounded-xl p-3 h-32",
                "bg-gradient-to-br from-white/5 to-white/[0.02]",
                "backdrop-blur-md border transition-all duration-300 ease-out",
                "focus:outline-none",
                index === selectedIndex
                  ? "border-primary/60 scale-110 shadow-[0_0_40px_hsl(var(--primary)/0.4)] ring-2 ring-primary/50 z-10"
                  : "border-white/10 hover:scale-105 hover:border-white/20"
              )}
            >
              {/* Live dot */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>

              {channel.icon ? (
                <img src={channel.icon} alt={channel.name} className="w-12 h-12 rounded-lg object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                  {channel.name.slice(0, 3).toUpperCase()}
                </div>
              )}
              <span className="text-white font-medium text-xs truncate max-w-full text-center">{channel.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredChannels.length === 0 && allChannels.length > 0 && (
        <div className="flex items-center justify-center h-64 text-foreground/40">
          No channels in this category
        </div>
      )}
    </div>
  );
};

export default LiveTVHome;
