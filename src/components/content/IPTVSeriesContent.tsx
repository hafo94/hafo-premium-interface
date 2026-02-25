import { useState, useMemo } from 'react';
import { useDirectSeriesCategories, useDirectSeries, seriesToWatchContent } from '@/hooks/useIPTVDirect';
import { useIPTVContext } from '@/contexts/IPTVContext';
import { useMyList } from '@/hooks/useMyList';
import { WatchContent } from '@/data/watchContent';
import ContentDetail from '@/components/watch/ContentDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tv, Loader2 } from 'lucide-react';

const IPTVSeriesContent = () => {
  const { iptvCredentials } = useIPTVContext();
  const { isInList, toggleInList } = useMyList();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedContent, setSelectedContent] = useState<WatchContent | null>(null);

  const { data: categories, isLoading: catLoading } = useDirectSeriesCategories();
  const { data: seriesList, isLoading: seriesLoading } = useDirectSeries(selectedCategoryId);

  const categoryName = useMemo(() => {
    if (!selectedCategoryId || !categories) return undefined;
    return categories.find(c => c.category_id === selectedCategoryId)?.category_name;
  }, [selectedCategoryId, categories]);

  const items = useMemo(() => {
    if (!seriesList || !iptvCredentials) return [];
    return seriesList.map(s => seriesToWatchContent(s, iptvCredentials, categoryName));
  }, [seriesList, iptvCredentials, categoryName]);

  // Auto-select first category
  useMemo(() => {
    if (!selectedCategoryId && categories && categories.length > 0) {
      setSelectedCategoryId(categories[0].category_id);
    }
  }, [categories, selectedCategoryId]);

  if (catLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Category Sidebar */}
      <ScrollArea className="w-56 shrink-0 border-r border-border/30 bg-background/50">
        <div className="p-3 space-y-1">
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              !selectedCategoryId
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            All Series
          </button>
          {categories?.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCategoryId(cat.category_id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate ${
                selectedCategoryId === cat.category_id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Content Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          {categoryName || 'All Series'}
          {seriesLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>

        {!seriesLoading && items.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No series found in this category</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedContent(item)}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-muted transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Tv className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8">
                <p className="text-xs font-medium text-white line-clamp-2">{item.title}</p>
                {item.rating && (
                  <p className="text-[10px] text-yellow-400 mt-0.5">★ {item.rating.toFixed(1)}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {seriesLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContent && (
        <ContentDetail
          content={selectedContent}
          isInList={isInList(selectedContent.id)}
          onToggleList={toggleInList}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
};

export default IPTVSeriesContent;
