import { useState, useEffect, useCallback, useMemo } from "react";
import ContentRow from "@/components/watch/ContentRow";
import ContentDetail from "@/components/watch/ContentDetail";
import FeaturedHero from "@/components/watch/FeaturedHero";
import SearchOverlay from "@/components/watch/SearchOverlay";
import { watchContent, WatchContent } from "@/data/watchContent";
import { useMyList } from "@/hooks/useMyList";
import { useFocus } from "@/contexts/FocusContext";

interface SeriesContentProps {
  activeSection: string;
}

// Series-specific categories
const seriesCategories = [
  {
    id: "continue",
    title: "Continue Watching",
    filter: (items: WatchContent[]) => items.filter((i) => i.progress && i.progress > 0),
  },
  {
    id: "trending",
    title: "Trending Series",
    filter: (items: WatchContent[]) => items.filter((i) => i.isHot),
  },
  {
    id: "recommended",
    title: "Recommended For You",
    filter: (items: WatchContent[]) => items.filter((i) => i.isRecommended),
  },
  {
    id: "drama",
    title: "Drama Series",
    filter: (items: WatchContent[]) => items.filter((i) => i.genre?.includes("Drama")),
  },
  {
    id: "comedy",
    title: "Comedy Series",
    filter: (items: WatchContent[]) => items.filter((i) => i.genre?.includes("Comedy")),
  },
  {
    id: "scifi",
    title: "Sci-Fi & Fantasy",
    filter: (items: WatchContent[]) =>
      items.filter((i) => i.genre?.includes("Sci-Fi") || i.genre?.includes("Fantasy")),
  },
  {
    id: "all-series",
    title: "All Series",
    filter: (items: WatchContent[]) => items,
  },
];

const SeriesContent = ({ activeSection }: SeriesContentProps) => {
  const { myList, toggleInList, isInList } = useMyList();
  const { activeZone, contentIndex, setContentIndex, focusSidebar, focusHeader, setActiveZone } = useFocus();
  const isContentFocused = activeZone === "content";

  // Filter to only series content
  const seriesContent = useMemo(
    () => watchContent.filter((item) => item.type === "series"),
    []
  );

  // Featured content - rotate through hot/recommended series
  const featuredItems = useMemo(
    () => seriesContent.filter((item) => item.isHot || item.isRecommended),
    [seriesContent]
  );
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
    const myListItems = seriesContent.filter((item) => myList.includes(item.id));

    const allCategories = [
      ...(myListItems.length > 0
        ? [
            {
              id: "my-list",
              title: "My List",
              items: myListItems,
            },
          ]
        : []),
      ...seriesCategories
        .map((cat) => ({
          id: cat.id,
          title: cat.title,
          items: cat.filter(seriesContent),
        }))
        .filter((cat) => cat.items.length > 0),
    ];

    return allCategories;
  }, [myList, seriesContent]);

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
      // Skip alt key combos (used by header)
      if (e.altKey) return;

      // Open search with 's' key
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      const { row, col } = contentIndex;

      // If hero is active (row === -1), let FeaturedHero handle left/right/enter
      if (
        row === -1 &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter")
      ) {
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
            // From hero, go directly to header
            focusHeader();
          } else if (row === 0) {
            // From first row, go to hero
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
              // At first item, go to sidebar
              focusSidebar();
            } else {
              setContentIndex({ row, col: col - 1 });
            }
          } else {
            // In hero, go to sidebar
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

  // Handle case where there's no series content
  if (seriesContent.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No series content available</p>
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
          {featuredItems.slice(0, 5).map((_, idx) => (
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
            onFocusChange={(itemIndex) =>
              handleItemFocusChange(rowIndex, itemIndex)
            }
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

export default SeriesContent;
