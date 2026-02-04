import { useState, useEffect, useCallback, useMemo } from "react";
import ContentRow from "@/components/watch/ContentRow";
import ContentDetail from "@/components/watch/ContentDetail";
import FeaturedHero from "@/components/watch/FeaturedHero";
import SearchOverlay from "@/components/watch/SearchOverlay";
import { WatchContent } from "@/data/watchContent";
import { useMyList } from "@/hooks/useMyList";
import { useFocus } from "@/contexts/FocusContext";
import { useMoviesPageData } from "@/hooks/useTMDB";
import { Skeleton } from "@/components/ui/skeleton";

interface MoviesContentProps {
  activeSection: string;
}

const MoviesContent = ({ activeSection }: MoviesContentProps) => {
  const { myList, toggleInList, isInList } = useMyList();
  const { activeZone, contentIndex, setContentIndex, focusSidebar, focusHeader, setActiveZone } = useFocus();
  const isContentFocused = activeZone === "content";

  // Fetch TMDB data
  const { popularMovies, trendingMovies, topRatedMovies, nowPlaying, isLoading, error } = useMoviesPageData();

  // Featured content - use trending movies for hero
  const featuredItems = useMemo(() => {
    return trendingMovies.filter((item) => item.backdrop && item.backdrop !== "/placeholder.svg").slice(0, 5);
  }, [trendingMovies]);

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredContent = featuredItems[featuredIndex] || featuredItems[0];

  // Detail view
  const [selectedContent, setSelectedContent] = useState<WatchContent | null>(null);

  // Search overlay
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Open search when activeSection is 'search'
  useEffect(() => {
    if (activeSection === "search") {
      setIsSearchOpen(true);
    }
  }, [activeSection]);

  // Build categories including My List
  const visibleCategories = useMemo(() => {
    const allMovies = [...popularMovies, ...trendingMovies, ...topRatedMovies, ...nowPlaying];
    const myListItems = allMovies.filter((item) => myList.includes(item.id));

    const categories = [
      ...(myListItems.length > 0
        ? [{ id: "my-list", title: "My List", items: myListItems }]
        : []),
      ...(trendingMovies.length > 0
        ? [{ id: "trending", title: "Trending Now", items: trendingMovies }]
        : []),
      ...(popularMovies.length > 0
        ? [{ id: "popular", title: "Popular Movies", items: popularMovies }]
        : []),
      ...(topRatedMovies.length > 0
        ? [{ id: "top-rated", title: "Top Rated", items: topRatedMovies }]
        : []),
      ...(nowPlaying.length > 0
        ? [{ id: "now-playing", title: "Now Playing", items: nowPlaying }]
        : []),
    ];

    return categories;
  }, [myList, popularMovies, trendingMovies, topRatedMovies, nowPlaying]);

  // Auto-rotate featured content
  useEffect(() => {
    if (featuredItems.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedContent || isSearchOpen || !isContentFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) return;

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      const { row, col } = contentIndex;

      if (row === -1 && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter")) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (row < visibleCategories.length - 1) {
            setContentIndex({ row: row + 1, col: 0 });
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (row === -1) {
            focusHeader();
          } else if (row === 0) {
            setContentIndex({ row: -1, col: 0 });
          } else {
            setContentIndex({ row: row - 1, col });
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (row >= 0) {
            const maxIndex = visibleCategories[row]?.items.length - 1 || 0;
            if (col < maxIndex) {
              setContentIndex({ row, col: col + 1 });
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (row >= 0) {
            if (col === 0) {
              focusSidebar();
            } else {
              setContentIndex({ row, col: col - 1 });
            }
          } else {
            focusSidebar();
          }
          break;
        case "Enter":
          e.preventDefault();
          if (row >= 0) {
            const category = visibleCategories[row];
            const item = category?.items[col];
            if (item) {
              setSelectedContent(item);
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedContent, isSearchOpen, isContentFocused, contentIndex, visibleCategories, focusSidebar, focusHeader, setContentIndex]);

  const handleItemFocusChange = useCallback(
    (rowIndex: number, itemIndex: number) => {
      setActiveZone("content");
      setContentIndex({ row: rowIndex, col: itemIndex });
    },
    [setActiveZone, setContentIndex]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="relative h-[70vh]">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="py-4 px-6 space-y-8">
          {[1, 2, 3].map((row) => (
            <div key={row} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton key={item} className="w-[200px] h-[300px] rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">Failed to load movies</p>
          <p className="text-muted-foreground text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Featured Hero */}
      {featuredContent && (
        <FeaturedHero
          content={featuredContent}
          isActive={isContentFocused && contentIndex.row === -1}
          isInList={isInList(featuredContent.id)}
          onSelect={setSelectedContent}
          onInfo={setSelectedContent}
          onToggleList={toggleInList}
        />
      )}

      {/* Featured indicators */}
      {featuredItems.length > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-2 -mt-20 mb-6">
          {featuredItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setFeaturedIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === featuredIndex
                  ? "w-8 bg-nipflix"
                  : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content Rows */}
      <div className="py-4 relative z-10 px-6">
        {visibleCategories.map((category, rowIndex) => (
          <ContentRow
            key={category.id}
            title={category.title}
            items={category.items}
            rowIndex={rowIndex}
            isActiveRow={isContentFocused && contentIndex.row === rowIndex}
            focusedItemIndex={contentIndex.row === rowIndex ? contentIndex.col : 0}
            onItemSelect={setSelectedContent}
            onFocusChange={(itemIndex) => handleItemFocusChange(rowIndex, itemIndex)}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="mt-4 text-center pb-4">
        <p className="text-xs text-muted-foreground/50">
          ← Sidebar • ↑↓←→ Navigate • Enter Select • S Search
        </p>
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={setSelectedContent}
      />

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

export default MoviesContent;
