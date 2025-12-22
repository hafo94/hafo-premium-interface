import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import ContentRow from '@/components/watch/ContentRow';
import ContentDetail from '@/components/watch/ContentDetail';
import { watchContent, contentCategories, WatchContent } from '@/data/watchContent';

const Watch = () => {
  // Navigation state
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedItems, setFocusedItems] = useState<number[]>(
    contentCategories.map(() => 0)
  );
  
  // Detail view
  const [selectedContent, setSelectedContent] = useState<WatchContent | null>(null);

  // Get visible categories (those with content)
  const visibleCategories = contentCategories
    .map((cat) => ({
      ...cat,
      items: cat.filter(watchContent),
    }))
    .filter((cat) => cat.items.length > 0);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedContent) return; // Don't handle if detail view is open

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRow((prev) => Math.min(prev + 1, visibleCategories.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRow((prev) => Math.max(prev - 1, 0));
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
  }, [selectedContent, focusedRow, focusedItems, visibleCategories]);

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
        {/* Header */}
        <header className="flex items-center justify-between p-6 pb-4">
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
            <button className="p-2 text-foreground/60 hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Category hint */}
        <div className="px-12 py-2 text-sm text-muted-foreground">
          Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">↓</kbd> to navigate rows, <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">←</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">→</kbd> for items, <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Enter</kbd> to select
        </div>

        {/* Content Rows */}
        <div className="py-4">
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

      {/* Detail Modal */}
      {selectedContent && (
        <ContentDetail
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
};

export default Watch;
