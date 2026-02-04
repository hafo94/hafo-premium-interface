import { useState, useEffect, useCallback, useMemo } from "react";
import ContentRow from "@/components/watch/ContentRow";
import ContentDetail from "@/components/watch/ContentDetail";
import FeaturedHero from "@/components/watch/FeaturedHero";
import SearchOverlay from "@/components/watch/SearchOverlay";
import { watchContent, contentCategories, WatchContent } from "@/data/watchContent";
import { useMyList } from "@/hooks/useMyList";
import { useFocus } from "@/contexts/FocusContext";

interface MoviesContentProps {
  activeSection: string;
}

const MoviesContent = ({ activeSection }: MoviesContentProps) => {
  const { myList, toggleInList, isInList } = useMyList();
  const { activeZone, contentIndex, setContentIndex, focusSidebar, setActiveZone } = useFocus();
  const isContentFocused = activeZone === "content";

  // Featured content - rotate through hot/recommended items
  const featuredItems = watchContent.filter(
    (item) => item.isHot || item.isRecommended
  );
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredContent = featuredItems[featuredIndex] || featuredItems[0];

  // Detail view
  const [selectedContent, setSelectedContent] = useState<WatchContent | null>(
    null
  );

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
    const myListItems = watchContent.filter((item) => myList.includes(item.id));

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
      ...contentCategories
        .map((cat) => ({
          id: cat.id,
          title: cat.title,
          items: cat.filter(watchContent),
        }))
        .filter((cat) => cat.items.length > 0),
    ];

    return allCategories;
  }, [myList]);

  // Auto-rotate featured content
  useEffect(() => {
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
            // From hero, go to sidebar
            focusSidebar();
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
  }, [selectedContent, isSearchOpen, isContentFocused, contentIndex, visibleCategories, focusSidebar, setContentIndex]);

  const handleItemFocusChange = useCallback(
    (rowIndex: number, itemIndex: number) => {
      setActiveZone("content");
      setContentIndex({ row: rowIndex, col: itemIndex });
    },
    [setActiveZone, setContentIndex]
  );

  return (
    <div className="min-h-screen">
      {/* Featured Hero */}
      <FeaturedHero
        content={featuredContent}
        isActive={isContentFocused && contentIndex.row === -1}
        isInList={isInList(featuredContent.id)}
        onSelect={setSelectedContent}
        onInfo={setSelectedContent}
        onToggleList={toggleInList}
      />

      {/* Featured indicators */}
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

export default MoviesContent;
