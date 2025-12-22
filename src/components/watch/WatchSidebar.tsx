import { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Flame, Star, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface WatchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  contentType: 'all' | 'movie' | 'series';
  onContentTypeChange: (type: 'all' | 'movie' | 'series') => void;
  activeFilter: 'all' | 'recommended' | 'hot';
  onFilterChange: (filter: 'all' | 'recommended' | 'hot') => void;
}

const menuItems = [
  { id: 'all', label: 'All Content', icon: null },
  { id: 'movie', label: 'Movies', icon: Film },
  { id: 'series', label: 'Series', icon: Tv },
] as const;

const filterItems = [
  { id: 'all', label: 'All', icon: null },
  { id: 'recommended', label: 'Recommended', icon: Star },
  { id: 'hot', label: 'Hot', icon: Flame },
] as const;

const WatchSidebar = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  contentType,
  onContentTypeChange,
  activeFilter,
  onFilterChange,
}: WatchSidebarProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allItems = [...menuItems, ...filterItems];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'ArrowRight':
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Enter':
          e.preventDefault();
          const item = allItems[focusedIndex];
          if (menuItems.find((m) => m.id === item.id)) {
            onContentTypeChange(item.id as 'all' | 'movie' | 'series');
          } else {
            onFilterChange(item.id as 'all' | 'recommended' | 'hot');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, onClose, onContentTypeChange, onFilterChange, allItems]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 h-full w-80 bg-sidebar-background border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-foreground">Library</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-sidebar-accent border-sidebar-border"
            />
          </div>

          {/* Content Type */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Content Type
            </h3>
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onContentTypeChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                    contentType === item.id
                      ? 'bg-nipflix/20 text-nipflix'
                      : focusedIndex === index
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {!item.icon && <div className="w-5" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Browse By
            </h3>
            <div className="space-y-1">
              {filterItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onFilterChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                    activeFilter === item.id
                      ? 'bg-nipflix/20 text-nipflix'
                      : focusedIndex === menuItems.length + index
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {!item.icon && <div className="w-5" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="mt-auto pt-6 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-foreground">←</kbd> to open sidebar
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WatchSidebar;
