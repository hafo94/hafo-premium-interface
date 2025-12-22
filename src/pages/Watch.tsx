import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import WatchSidebar from '@/components/watch/WatchSidebar';
import WatchFilters from '@/components/watch/WatchFilters';
import ContentGrid from '@/components/watch/ContentGrid';
import ContentDetail from '@/components/watch/ContentDetail';
import { watchContent, WatchContent } from '@/data/watchContent';

const Watch = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState<'all' | 'movie' | 'series'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recommended' | 'hot'>('all');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [minRating, setMinRating] = useState('All Ratings');
  
  // Detail view
  const [selectedContent, setSelectedContent] = useState<WatchContent | null>(null);

  // Filter content based on all criteria
  const filteredContent = useMemo(() => {
    let result = [...watchContent];

    // Content type filter
    if (contentType !== 'all') {
      result = result.filter((item) => item.type === contentType);
    }

    // Special filters (hot/recommended)
    if (activeFilter === 'hot') {
      result = result.filter((item) => item.isHot);
    } else if (activeFilter === 'recommended') {
      result = result.filter((item) => item.isRecommended);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.genre.some((g) => g.toLowerCase().includes(query)) ||
          item.plot.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (selectedGenre !== 'All Genres') {
      result = result.filter((item) => item.genre.includes(selectedGenre));
    }

    // Year filter
    if (selectedYear !== 'All Years') {
      result = result.filter((item) => {
        const year = item.year;
        switch (selectedYear) {
          case '2020s':
            return year >= 2020;
          case '2010s':
            return year >= 2010 && year < 2020;
          case '2000s':
            return year >= 2000 && year < 2010;
          case '1990s':
            return year >= 1990 && year < 2000;
          case 'Before 1990':
            return year < 1990;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (minRating !== 'All Ratings') {
      const ratingThreshold = parseInt(minRating.replace('+', ''));
      result = result.filter((item) => item.rating >= ratingThreshold);
    }

    return result;
  }, [watchContent, contentType, activeFilter, searchQuery, selectedGenre, selectedYear, minRating]);

  // Keyboard navigation to open sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedContent) return; // Don't handle if detail view is open
      
      if (e.key === 'ArrowLeft' && !sidebarOpen) {
        // Check if we're at the leftmost column
        setSidebarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, selectedContent]);

  const handleNavigateLeft = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground accentColor="--nipflix" />

      {/* Sidebar */}
      <WatchSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        contentType={contentType}
        onContentTypeChange={setContentType}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-border/50">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-nipflix">Library</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </header>

        {/* Filters */}
        <WatchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          minRating={minRating}
          onRatingChange={setMinRating}
        />

        {/* Content Grid */}
        <ContentGrid
          content={filteredContent}
          onSelect={setSelectedContent}
          onNavigateLeft={handleNavigateLeft}
        />
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
