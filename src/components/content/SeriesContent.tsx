import { useState, useEffect, useCallback, useMemo } from "react";
import ContentRow from "@/components/watch/ContentRow";
import ContentDetail from "@/components/watch/ContentDetail";
import FeaturedHero from "@/components/watch/FeaturedHero";
import SearchOverlay from "@/components/watch/SearchOverlay";
import ContentGrid, { useGridColumns2 } from "@/components/watch/ContentGrid";
import { WatchContent } from "@/data/watchContent";
import { useMyList } from "@/hooks/useMyList";
import { useFocus } from "@/contexts/FocusContext";
import { useSeriesPageData } from "@/hooks/useTMDB";
import { useIMDBSortedContent, selectFeaturedItems } from "@/hooks/useIMDBRatings";
import { useInfinitePopularSeries, useInfiniteOnTheAirSeries, useInfiniteSeriesByGenre } from "@/hooks/useInfiniteContent";
import { Skeleton } from "@/components/ui/skeleton";
import { getSeriesGenreLabel } from "@/data/genreConfig";

interface SeriesContentProps {
  activeSection: string;
}

const SeriesContent = ({ activeSection }: SeriesContentProps) => {
  const { myList, toggleInList, isInList } = useMyList();
  const { activeZone, contentIndex, setContentIndex, focusSidebar, focusHeader, setActiveZone } = useFocus();
  const isContentFocused = activeZone === "content";
  const gridColumns = useGridColumns2();

  // Determine if viewing grid mode
  const isGenreSelected = activeSection.startsWith("genre-");
  const selectedGenreId = isGenreSelected ? activeSection.replace("genre-", "") : undefined;
  const isGridView = activeSection === "popular" || activeSection === "on-air" || isGenreSelected;

  // Fetch TMDB data for home view
  const { trendingSeries: rawTrending, isLoading: homeLoading, error: homeError, popularSeries: rawPopular, topRatedSeries: rawTopRated, onTheAir: rawOnTheAir } = useSeriesPageData();

  // Sort each row by IMDb ratings
  const trendingSeries = useIMDBSortedContent(rawTrending, "trending-series");
  const popularSeries = useIMDBSortedContent(rawPopular, "popular-series");
  const topRatedSeries = useIMDBSortedContent(rawTopRated, "top-rated-series");
  const onTheAir = useIMDBSortedContent(rawOnTheAir, "on-the-air-series");

  // Infinite queries for grid views
  const { 
    data: popularData, 
    fetchNextPage: fetchNextPopular, 
    hasNextPage: hasMorePopular, 
    isFetchingNextPage: fetchingPopular,
    isLoading: popularLoading 
  } = useInfinitePopularSeries();

  const { 
    data: onAirData, 
    fetchNextPage: fetchNextOnAir, 
    hasNextPage: hasMoreOnAir, 
    isFetchingNextPage: fetchingOnAir,
    isLoading: onAirLoading 
  } = useInfiniteOnTheAirSeries();

  const { 
    data: genreData, 
    fetchNextPage: fetchNextGenre, 
    hasNextPage: hasMoreGenre, 
    isFetchingNextPage: fetchingGenre,
    isLoading: genreLoading 
  } = useInfiniteSeriesByGenre(selectedGenreId);

  // Flatten infinite query pages
  const gridItems = useMemo(() => {
    if (activeSection === "popular" && popularData) {
      return popularData.pages.flatMap((page) => page.items);
    }
    if (activeSection === "on-air" && onAirData) {
      return onAirData.pages.flatMap((page) => page.items);
    }
    if (isGenreSelected && genreData) {
      return genreData.pages.flatMap((page) => page.items);
    }
    return [];
  }, [activeSection, popularData, onAirData, genreData, isGenreSelected]);

  // Grid view props
  const gridProps = useMemo(() => {
    if (activeSection === "popular") {
      return { hasNextPage: hasMorePopular, isFetchingNextPage: fetchingPopular, onLoadMore: fetchNextPopular };
    }
    if (activeSection === "on-air") {
      return { hasNextPage: hasMoreOnAir, isFetchingNextPage: fetchingOnAir, onLoadMore: fetchNextOnAir };
    }
    if (isGenreSelected) {
      return { hasNextPage: hasMoreGenre, isFetchingNextPage: fetchingGenre, onLoadMore: fetchNextGenre };
    }
    return { hasNextPage: false, isFetchingNextPage: false, onLoadMore: () => {} };
  }, [activeSection, isGenreSelected, hasMorePopular, hasMoreOnAir, hasMoreGenre, fetchingPopular, fetchingOnAir, fetchingGenre, fetchNextPopular, fetchNextOnAir, fetchNextGenre]);

  // Grid focus index (flat index for 2D navigation)
  const [gridFocusIndex, setGridFocusIndex] = useState(0);

  // Featured content - prefer high IMDb-rated titles
  const featuredItems = useMemo(() => {
    if (isGridView && gridItems.length > 0) {
      return selectFeaturedItems(gridItems, 5);
    }
    return selectFeaturedItems(trendingSeries, 5);
  }, [trendingSeries, gridItems, isGridView]);

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredContent = featuredItems[featuredIndex] || featuredItems[0];

  // Detail view
  const [selectedContent, setSelectedContent] = useState<WatchContent | null>(null);

  // Search overlay
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get setSearchMode from focus context
  const { setSearchMode } = useFocus();

  // Open search when activeSection is 'search'
  useEffect(() => {
    if (activeSection === "search") {
      setIsSearchOpen(true);
    }
  }, [activeSection]);

  // Sync search mode with FocusContext
  useEffect(() => {
    setSearchMode(isSearchOpen);
  }, [isSearchOpen, setSearchMode]);

  // Reset focus when section changes
  useEffect(() => {
    setFeaturedIndex(0);
    setGridFocusIndex(0);
    setContentIndex({ row: -1, col: 0 });
  }, [activeSection, setContentIndex]);

  // Build categories for home view
  const visibleCategories = useMemo(() => {
    if (isGridView) return []; // Don't use categories in grid view

    const allSeries = [...popularSeries, ...trendingSeries, ...topRatedSeries, ...onTheAir];
    const myListItems = allSeries.filter((item) => myList.includes(item.id));

    const categories = [
      ...(myListItems.length > 0 ? [{ id: "my-list", title: "My List", items: myListItems }] : []),
      ...(trendingSeries.length > 0 ? [{ id: "trending", title: "Trending Now", items: trendingSeries }] : []),
      ...(popularSeries.length > 0 ? [{ id: "popular", title: "Popular Series", items: popularSeries }] : []),
      ...(topRatedSeries.length > 0 ? [{ id: "top-rated", title: "Top Rated", items: topRatedSeries }] : []),
      ...(onTheAir.length > 0 ? [{ id: "on-the-air", title: "Currently Airing", items: onTheAir }] : []),
    ];

    return categories;
  }, [myList, popularSeries, trendingSeries, topRatedSeries, onTheAir, isGridView]);

  // Auto-rotate featured content
  useEffect(() => {
    if (featuredItems.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  // Grid keyboard navigation
  useEffect(() => {
    if (!isGridView || selectedContent || isSearchOpen || !isContentFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) return;

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      const { row } = contentIndex;
      const totalItems = gridItems.length;

      // Handle hero focus (row === -1)
      if (row === -1) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setContentIndex({ row: 0, col: 0 });
          setGridFocusIndex(0);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          focusHeader();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          focusSidebar();
        }
        return;
      }

      // Grid navigation (row >= 0 means we're in the grid)
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const newIndex = gridFocusIndex + gridColumns;
          if (newIndex < totalItems) {
            setGridFocusIndex(newIndex);
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const newIndex = gridFocusIndex - gridColumns;
          if (newIndex >= 0) {
            setGridFocusIndex(newIndex);
          } else {
            setContentIndex({ row: -1, col: 0 });
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          if (gridFocusIndex < totalItems - 1) {
            setGridFocusIndex(gridFocusIndex + 1);
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const colPosition = gridFocusIndex % gridColumns;
          if (colPosition === 0) {
            focusSidebar();
          } else {
            setGridFocusIndex(gridFocusIndex - 1);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          const item = gridItems[gridFocusIndex];
          if (item) {
            setSelectedContent(item);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGridView, selectedContent, isSearchOpen, isContentFocused, contentIndex, gridFocusIndex, gridItems, gridColumns, focusSidebar, focusHeader, setContentIndex]);

  // Row-based keyboard navigation (home view)
  useEffect(() => {
    if (isGridView || selectedContent || isSearchOpen || !isContentFocused) return;

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
  }, [isGridView, selectedContent, isSearchOpen, isContentFocused, contentIndex, visibleCategories, focusSidebar, focusHeader, setContentIndex]);

  const handleItemFocusChange = useCallback(
    (rowIndex: number, itemIndex: number) => {
      setActiveZone("content");
      setContentIndex({ row: rowIndex, col: itemIndex });
    },
    [setActiveZone, setContentIndex]
  );

  const handleGridFocusChange = useCallback(
    (index: number) => {
      setActiveZone("content");
      setContentIndex({ row: 0, col: 0 });
      setGridFocusIndex(index);
    },
    [setActiveZone, setContentIndex]
  );

  // Determine loading state
  const isLoading = isGridView
    ? (activeSection === "popular" && popularLoading) ||
      (activeSection === "on-air" && onAirLoading) ||
      (isGenreSelected && genreLoading)
    : homeLoading;
  const error = homeError;

  // Get section title
  const sectionTitle = useMemo(() => {
    if (activeSection === "popular") return "Popular Series";
    if (activeSection === "on-air") return "Currently Airing";
    if (isGenreSelected) return `${getSeriesGenreLabel(selectedGenreId || "")} Series`;
    return "";
  }, [activeSection, isGenreSelected, selectedGenreId]);

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
          <p className="text-destructive text-lg">Failed to load series</p>
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
          onNavigateLeft={focusSidebar}
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

      {/* Grid View */}
      {isGridView && (
        <div className="py-4 relative z-10 px-6">
          <h2 className="text-xl font-semibold mb-4">{sectionTitle}</h2>
          <ContentGrid
            items={gridItems}
            focusedIndex={gridFocusIndex}
            isActive={isContentFocused && contentIndex.row >= 0}
            onFocusChange={handleGridFocusChange}
            onItemSelect={setSelectedContent}
            hasNextPage={gridProps.hasNextPage}
            isFetchingNextPage={gridProps.isFetchingNextPage}
            onLoadMore={gridProps.onLoadMore}
          />
        </div>
      )}

      {/* Content Rows (Home view) */}
      {!isGridView && (
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
      )}

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
        mediaFilter="tv"
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

export default SeriesContent;
