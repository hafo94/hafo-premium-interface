import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { WatchContent } from "@/data/watchContent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader2 } from "lucide-react";

interface ContentGridProps {
  items: WatchContent[];
  focusedIndex: number;
  isActive: boolean;
  onFocusChange: (index: number) => void;
  onItemSelect: (item: WatchContent) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

// Responsive column counts based on screen width
const useGridColumns = () => {
  const [columns, setColumns] = useState(5);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(2);
      else if (width < 768) setColumns(3);
      else if (width < 1024) setColumns(4);
      else if (width < 1280) setColumns(5);
      else setColumns(6);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return columns;
};

const ContentGrid = ({
  items,
  focusedIndex,
  isActive,
  onFocusChange,
  onItemSelect,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ContentGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevFocusIndex = useRef(focusedIndex);
  const columns = useGridColumns();

  // Scroll focused item into view - only when focus actually changes
  useEffect(() => {
    if (!isActive || focusedIndex < 0) return;
    
    // Only scroll if focusedIndex actually changed (not just a re-render)
    if (prevFocusIndex.current === focusedIndex) return;
    prevFocusIndex.current = focusedIndex;
    
    const grid = gridRef.current;
    if (!grid) return;

    const focusedElement = grid.children[focusedIndex] as HTMLElement;
    if (focusedElement) {
      focusedElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusedIndex, isActive]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasNextPage) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasNextPage, isFetchingNextPage]);

  const handleItemClick = useCallback(
    (item: WatchContent, index: number) => {
      onFocusChange(index);
      onItemSelect(item);
    },
    [onFocusChange, onItemSelect]
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (isActive) {
        onFocusChange(index);
      }
    },
    [isActive, onFocusChange]
  );

  return (
    <div className="space-y-4">
      <div
        ref={gridRef}
        className={cn(
          "grid gap-3",
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        )}
      >
        {items.map((item, index) => {
          const isFocused = isActive && focusedIndex === index;

          return (
            <button
              key={`${item.id}-${index}`}
              onClick={() => handleItemClick(item, index)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={cn(
                "relative group rounded-lg overflow-hidden transition-all duration-300",
                "focus:outline-none",
                isFocused && "ring-2 ring-primary scale-105 z-10"
              )}
            >
              <AspectRatio ratio={2 / 3}>
                <img
                  src={item.poster || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    isFocused && "opacity-100"
                  )}
                />
                {/* Title */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 p-2",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    isFocused && "opacity-100"
                  )}
                >
                  <p className="text-sm font-medium text-white line-clamp-2">
                    {item.title}
                  </p>
                  {item.year && (
                    <p className="text-xs text-muted-foreground">{item.year}</p>
                  )}
                </div>
              </AspectRatio>
            </button>
          );
        })}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* End message */}
      {!hasNextPage && items.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          That's all for now
        </p>
      )}
    </div>
  );
};

export default ContentGrid;

// Helper hook to get grid column count for keyboard navigation
export const useGridColumns2 = useGridColumns;
