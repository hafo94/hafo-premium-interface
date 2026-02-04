import { useRef, useEffect, useState, useCallback } from 'react';
import { WatchContent } from '@/data/watchContent';
import { cn } from '@/lib/utils';

interface ContentRowProps {
  title: string;
  items: WatchContent[];
  rowIndex: number;
  isActiveRow: boolean;
  focusedItemIndex: number;
  onItemSelect: (item: WatchContent) => void;
  onFocusChange: (itemIndex: number) => void;
}

const ContentRow = ({
  title,
  items,
  rowIndex,
  isActiveRow,
  focusedItemIndex,
  onItemSelect,
  onFocusChange,
}: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll focused item into view
  useEffect(() => {
    if (isActiveRow && itemRefs.current[focusedItemIndex]) {
      itemRefs.current[focusedItemIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [isActiveRow, focusedItemIndex]);

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Row Title */}
      <h2 className="text-lg font-semibold text-foreground mb-3 px-12">
        {title}
      </h2>

      {/* Scrollable Row - with padding to prevent ring clipping */}
      <div className="overflow-x-auto overflow-y-visible scrollbar-hide -my-4">
        <div
          ref={scrollRef}
          className="flex gap-2 px-12 py-4"
        >
          {items.map((item, index) => {
            const isFocused = isActiveRow && focusedItemIndex === index;
            
            return (
              <button
                key={item.id}
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => onItemSelect(item)}
                onFocus={() => onFocusChange(index)}
                className={cn(
                  'flex-shrink-0 relative group transition-all duration-300 focus:outline-none',
                  'w-[200px] aspect-video rounded-md overflow-hidden',
                  isFocused 
                    ? 'scale-110 z-20 ring-4 ring-foreground' 
                    : 'hover:scale-105'
                )}
                style={{
                  boxShadow: isFocused 
                    ? '0 0 30px hsl(var(--foreground) / 0.3), 0 8px 32px hsl(var(--background) / 0.8)'
                    : undefined
                }}
              >
                {/* Thumbnail */}
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Progress Bar (for continue watching) */}
                {item.progress && item.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                    <div
                      className="h-full bg-nipflix"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {/* Hover/Focus overlay */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent',
                    'flex flex-col justify-end p-3 transition-opacity duration-200',
                    isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.year} • {item.type === 'movie' ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : 'Series'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContentRow;
