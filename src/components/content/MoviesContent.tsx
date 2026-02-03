import { useState, useEffect, useCallback, useMemo } from "react";
import ContentRow from "@/components/watch/ContentRow";
import ContentDetail from "@/components/watch/ContentDetail";
import FeaturedHero from "@/components/watch/FeaturedHero";
import SearchOverlay from "@/components/watch/SearchOverlay";
import { watchContent, contentCategories, WatchContent } from "@/data/watchContent";
import { useMyList } from "@/hooks/useMyList";

interface MoviesContentProps {
  activeSection: string;
}

const MoviesContent = ({ activeSection }: MoviesContentProps) => {
  const { myList, toggleInList, isInList } = useMyList();

  // Featured content - rotate through hot/recommended items
  const featuredItems = watchContent.filter(
    (item) => item.isHot || item.isRecommended
  );
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredContent = featuredItems[featuredIndex] || featuredItems[0];

  // Navigation state
  const [focusedRow, setFocusedRow] = useState(-1);
  const [focusedItems, setFocusedItems] = useState<number[]>([]);

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

  // Initialize focused items when categories change
  useEffect(() => {
    setFocusedItems(visibleCategories.map(() => 0));
  }, [visibleCategories.length]);

  // Auto-rotate featured content
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedContent || isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with 's' key
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // If hero is active, let FeaturedHero handle left/right/enter
      if (
        focusedRow === -1 &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter")
      ) {
        return;
      }

      // Skip alt key combos (used by header)
      if (e.altKey) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedRow((prev) =>
            Math.min(prev + 1, visibleCategories.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedRow((prev) => prev - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusedItems((prev) => {
            const newItems = [...prev];
            const maxIndex =
              visibleCategories[focusedRow]?.items.length - 1 || 0;
            newItems[focusedRow] = Math.min(
              (newItems[focusedRow] || 0) + 1,
              maxIndex
            );
            return newItems;
          });
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedItems((prev) => {
            const newItems = [...prev];
            newItems[focusedRow] = Math.max((newItems[focusedRow] || 0) - 1, 0);
            return newItems;
          });
          break;
        case "Enter":
          e.preventDefault();
          const category = visibleCategories[focusedRow];
          const item = category?.items[focusedItems[focusedRow] || 0];
          if (item) {
            setSelectedContent(item);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedContent, isSearchOpen, focusedRow, focusedItems, visibleCategories]);

  const handleItemFocusChange = useCallback(
    (rowIndex: number, itemIndex: number) => {
      setFocusedRow(rowIndex);
      setFocusedItems((prev) => {
        const newItems = [...prev];
        newItems[rowIndex] = itemIndex;
        return newItems;
      });
    },
    []
  );

  return (
    <div className="min-h-screen">
      {/* Featured Hero */}
      <FeaturedHero
        content={featuredContent}
        isActive={focusedRow === -1}
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
            isActiveRow={focusedRow === rowIndex}
            focusedItemIndex={focusedItems[rowIndex] || 0}
            onItemSelect={setSelectedContent}
            onFocusChange={(itemIndex) =>
              handleItemFocusChange(rowIndex, itemIndex)
            }
          />
        ))}
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
