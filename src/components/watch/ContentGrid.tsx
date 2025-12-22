import { useRef, useEffect, useState } from 'react';
import { Star, Play, Flame } from 'lucide-react';
import { WatchContent } from '@/data/watchContent';
import { cn } from '@/lib/utils';

interface ContentGridProps {
  content: WatchContent[];
  onSelect: (item: WatchContent) => void;
  onNavigateLeft: () => void;
}

const ContentGrid = ({ content, onSelect, onNavigateLeft }: ContentGridProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const columns = 5; // Number of columns in grid

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = content.length;
      if (totalItems === 0) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, totalItems - 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedIndex % columns === 0) {
            onNavigateLeft();
          } else {
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + columns, totalItems - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - columns, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (content[focusedIndex]) {
            onSelect(content[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, focusedIndex, columns, onSelect, onNavigateLeft]);

  useEffect(() => {
    itemRefs.current[focusedIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [focusedIndex]);

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No content found</p>
        <p className="text-sm mt-2">Try adjusting your filters or search</p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6"
    >
      {content.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => (itemRefs.current[index] = el)}
          onClick={() => onSelect(item)}
          className={cn(
            'group relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 focus:outline-none',
            focusedIndex === index
              ? 'ring-2 ring-nipflix scale-105 z-10'
              : 'hover:scale-105'
          )}
        >
          {/* Poster */}
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hot badge */}
          {item.isHot && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-nipflix/90 rounded-full">
              <Flame className="w-3 h-3" />
              <span className="text-xs font-medium">Hot</span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full">
            <span className="text-xs font-medium capitalize">{item.type}</span>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.year}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{item.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-nipflix/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
            </div>
          </div>

          {/* Focus ring animation */}
          {focusedIndex === index && (
            <div className="absolute inset-0 rounded-xl ring-2 ring-nipflix animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ContentGrid;
