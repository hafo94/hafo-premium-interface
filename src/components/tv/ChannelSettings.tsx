import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Star, GripVertical, X } from 'lucide-react';
import { tvChannels, TVChannel, categoryLabels } from '@/data/tvChannels';
import { useTVFavorites } from '@/hooks/useTVFavorites';

interface ChannelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChannelSettings = ({ isOpen, onClose }: ChannelSettingsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TVChannel['category'] | 'all'>('all');
  const { favorites, toggleFavorite, isFavorite, reorderFavorites } = useTVFavorites();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const filteredChannels = useMemo(() => {
    return tvChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const favoriteChannels = useMemo(() => {
    return favorites.map(id => tvChannels.find(c => c.id === id)).filter(Boolean) as TVChannel[];
  }, [favorites]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderFavorites(draggedIndex, index);
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

  return (
    <div className="fixed inset-0 z-[60] bg-background animate-fade-in overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/60" />
              </button>
              <h1 className="text-2xl font-bold text-white">Manage Channels</h1>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors"
            >
              Save
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl
                       text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                  ${selectedCategory === category 
                    ? 'bg-primary text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                `}
              >
                {category === 'all' ? 'All' : categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Favorites Section */}
        {favoriteChannels.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Favorites ({favoriteChannels.length})
            </h2>
            <div className="space-y-2">
              {favoriteChannels.map((channel, index) => (
                <div
                  key={channel.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10
                    transition-all duration-200 cursor-grab active:cursor-grabbing
                    ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                  `}
                >
                  <GripVertical className="w-5 h-5 text-white/30" />
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${logoColors[channel.category]}
                    text-white font-bold text-xs
                  `}>
                    {channel.shortName.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{channel.name}</p>
                    <p className="text-white/40 text-sm">{categoryLabels[channel.category]}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(channel.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Channels */}
        <section>
          <h2 className="text-lg font-semibold text-white/90 mb-4">
            {selectedCategory === 'all' ? 'All Channels' : categoryLabels[selectedCategory]} 
            ({filteredChannels.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10
                         hover:bg-white/10 transition-all duration-200"
              >
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  bg-gradient-to-br ${logoColors[channel.category]}
                  text-white font-bold text-sm
                `}>
                  {channel.shortName.slice(0, 3)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">{channel.number}</span>
                    <p className="text-white font-medium">{channel.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`
                      px-2 py-0.5 text-xs rounded
                      ${channel.category === 'sports' ? 'bg-red-500/20 text-red-400' :
                        channel.category === 'news' ? 'bg-blue-500/20 text-blue-400' :
                        channel.category === 'movies' ? 'bg-purple-500/20 text-purple-400' :
                        channel.category === 'entertainment' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'}
                    `}>
                      {categoryLabels[channel.category]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(channel.id)}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isFavorite(channel.id) 
                      ? 'text-yellow-500 hover:bg-yellow-500/10' 
                      : 'text-white/30 hover:text-white/60 hover:bg-white/10'}
                  `}
                >
                  <Star className={`w-5 h-5 ${isFavorite(channel.id) ? 'fill-yellow-500' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChannelSettings;
