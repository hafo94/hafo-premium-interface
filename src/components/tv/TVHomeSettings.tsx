import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Home, GripVertical, X, Minus, Plus, Check } from 'lucide-react';
import { tvChannels, TVChannel, categoryLabels } from '@/data/tvChannels';
import { useTVHomeChannels, IconSize } from '@/hooks/useTVHomeChannels';
import { cn } from '@/lib/utils';

interface TVHomeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const TVHomeSettings = ({ isOpen, onClose }: TVHomeSettingsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TVChannel['category'] | 'all'>('all');
  const { homeChannels, iconSize, toggleChannel, isOnHome, reorderChannels, updateIconSize } = useTVHomeChannels();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const filteredChannels = useMemo(() => {
    return tvChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const homeChannelsList = useMemo(() => {
    return homeChannels.map(id => tvChannels.find(c => c.id === id)).filter(Boolean) as TVChannel[];
  }, [homeChannels]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderChannels(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!isOpen) return null;

  const logoColors: Record<string, string> = {
    sports: 'from-red-500 to-orange-500',
    news: 'from-blue-500 to-cyan-500',
    movies: 'from-purple-500 to-pink-500',
    entertainment: 'from-yellow-500 to-amber-500',
    documentary: 'from-green-500 to-emerald-500'
  };

  const categories: Array<TVChannel['category'] | 'all'> = ['all', 'sports', 'news', 'movies', 'entertainment', 'documentary'];

  const iconSizeOptions: { value: IconSize; label: string }[] = [
    { value: 'small', label: 'Liten' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Stor' }
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-background animate-fade-in overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">Startsida Inställningar</h1>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-tv hover:bg-tv/80 text-white font-medium rounded-lg transition-colors"
            >
              Spara
            </button>
          </div>

          {/* Icon Size Setting */}
          <div className="mb-4 p-4 bg-foreground/5 rounded-xl border border-border/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">Ikonstorlek</h3>
                <p className="text-xs text-muted-foreground">Välj storlek på kanalikonerna</p>
              </div>
              <div className="flex gap-2">
                {iconSizeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateIconSize(option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      iconSize === option.value
                        ? "bg-tv text-white"
                        : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Sök kanaler..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-foreground/5 border border-border/20 rounded-xl
                       text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tv/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category 
                    ? "bg-tv text-white" 
                    : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                )}
              >
                {category === 'all' ? 'Alla' : categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Home Channels Section */}
        {homeChannelsList.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground/90 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-tv" />
              På startsidan ({homeChannelsList.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Dra för att ändra ordning. Klicka minus för att ta bort.
            </p>
            <div className="space-y-2">
              {homeChannelsList.map((channel, index) => (
                <div
                  key={channel.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl bg-foreground/5 border border-border/20",
                    "transition-all duration-200 cursor-grab active:cursor-grabbing",
                    draggedIndex === index && "opacity-50 scale-95"
                  )}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground/50" />
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br text-white font-bold text-xs",
                    logoColors[channel.category]
                  )}>
                    {channel.shortName.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{channel.name}</p>
                    <p className="text-muted-foreground text-sm">{categoryLabels[channel.category]}</p>
                  </div>
                  <button
                    onClick={() => toggleChannel(channel.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                  >
                    <Minus className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Channels */}
        <section>
          <h2 className="text-lg font-semibold text-foreground/90 mb-4">
            {selectedCategory === 'all' ? 'Alla kanaler' : categoryLabels[selectedCategory]} 
            ({filteredChannels.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredChannels.map((channel) => {
              const onHome = isOnHome(channel.id);
              return (
                <div
                  key={channel.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl border transition-all duration-200",
                    onHome 
                      ? "bg-tv/10 border-tv/30" 
                      : "bg-foreground/5 border-border/20 hover:bg-foreground/10"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br text-white font-bold text-sm",
                    logoColors[channel.category]
                  )}>
                    {channel.shortName.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">{channel.number}</span>
                      <p className="text-foreground font-medium">{channel.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "px-2 py-0.5 text-xs rounded",
                        channel.category === 'sports' && "bg-red-500/20 text-red-400",
                        channel.category === 'news' && "bg-blue-500/20 text-blue-400",
                        channel.category === 'movies' && "bg-purple-500/20 text-purple-400",
                        channel.category === 'entertainment' && "bg-yellow-500/20 text-yellow-400",
                        channel.category === 'documentary' && "bg-green-500/20 text-green-400"
                      )}>
                        {categoryLabels[channel.category]}
                      </span>
                      {onHome && (
                        <span className="px-2 py-0.5 text-xs rounded bg-tv/20 text-tv flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          På startsidan
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleChannel(channel.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      onHome 
                        ? "text-red-400 hover:bg-red-500/10 hover:text-red-500" 
                        : "text-tv hover:bg-tv/10"
                    )}
                  >
                    {onHome ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TVHomeSettings;
