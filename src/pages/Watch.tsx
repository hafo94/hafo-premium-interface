import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import ContentRow from '@/components/watch/ContentRow';
import ContentDetail from '@/components/watch/ContentDetail';
import FeaturedHero from '@/components/watch/FeaturedHero';
import SearchOverlay from '@/components/watch/SearchOverlay';
import { watchContent, contentCategories, WatchContent } from '@/data/watchContent';
import { useMyList } from '@/hooks/useMyList';

const Watch = () => {
  const { myList, toggleInList, isInList } = useMyList();

  // Featured content - rotate through hot/recommended items
  const featuredItems = watchContent.filter(item => item.isHot || item.isRecommended);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredContent = featuredItems[featuredIndex] || featuredItems[0];

  // Navigation state - -1 means hero is focused
  const [focusedRow, setFocusedRow] = useState(-1);
  const [focusedItems, setFocusedItems] = useState<number[]>([]);
  
  // Detail view
  const [selectedContent, setSelectedContent] = useState<WatchContent | null>(null);
  
  // Search overlay
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Build categories including My List
  const visibleCategories = useMemo(() => {
    const myListItems = watchContent.filter(item => myList.includes(item.id));
    
    const allCategories = [
      // My List first if it has items
      ...(myListItems.length > 0 ? [{
        id: 'my-list',
        title: 'My List',
        items: myListItems,
      }] : []),
      // Then the other categories
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
      setFeaturedIndex(prev => (prev + 1) % featuredItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedContent || isSearchOpen) return; // Don't handle if modal is open

    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with 's' key
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // If hero is active, let FeaturedHero handle left/right/enter
      if (focusedRow === -1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter')) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRow((prev) => Math.min(prev + 1, visibleCategories.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRow((prev) => prev - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedItems((prev) => {
            const newItems = [...prev];
            const maxIndex = visibleCategories[focusedRow]?.items.length - 1 || 0;
            newItems[focusedRow] = Math.min((newItems[focusedRow] || 0) + 1, maxIndex);
            return newItems;
          });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedItems((prev) => {
            const newItems = [...prev];
            newItems[focusedRow] = Math.max((newItems[focusedRow] || 0) - 1, 0);
            return newItems;
          });
          break;
        case 'Enter':
          e.preventDefault();
          const category = visibleCategories[focusedRow];
          const item = category?.items[focusedItems[focusedRow] || 0];
          if (item) {
            setSelectedContent(item);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedContent, isSearchOpen, focusedRow, focusedItems, visibleCategories]);

  const handleItemFocusChange = useCallback((rowIndex: number, itemIndex: number) => {
    setFocusedRow(rowIndex);
    setFocusedItems((prev) => {
      const newItems = [...prev];
      newItems[rowIndex] = itemIndex;
      return newItems;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground accentColor="--nipflix" />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header - overlaid on hero */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-nipflix">Library</h1>
            
            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-foreground font-medium">Home</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">TV Shows</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Movies</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">New & Popular</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">My List</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors"
              title="Press 'S' to search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

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
                  ? 'w-8 bg-nipflix' 
                  : 'w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>

        {/* Content Rows */}
        <div className="py-4 relative z-10">
          {visibleCategories.map((category, rowIndex) => (
            <ContentRow
              key={category.id}
              title={category.title}
              items={category.items}
              rowIndex={rowIndex}
              isActiveRow={focusedRow === rowIndex}
              focusedItemIndex={focusedItems[rowIndex] || 0}
              onItemSelect={setSelectedContent}
              onFocusChange={(itemIndex) => handleItemFocusChange(rowIndex, itemIndex)}
            />
          ))}
        </div>
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

export default Watch;
