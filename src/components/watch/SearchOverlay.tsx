import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Delete } from 'lucide-react';
import { WatchContent, watchContent } from '@/data/watchContent';
import { cn } from '@/lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: WatchContent) => void;
}

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL', 'SPACE'],
];

type FocusArea = 'keyboard' | 'results' | 'close';

const SearchOverlay = ({ isOpen, onClose, onSelect }: SearchOverlayProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focusArea, setFocusArea] = useState<FocusArea>('keyboard');
  const [keyboardPos, setKeyboardPos] = useState({ row: 0, col: 0 });
  const [resultIndex, setResultIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter content based on search term
  const filteredContent = useMemo(() => {
    if (!searchTerm.trim()) return watchContent.slice(0, 12);
    const term = searchTerm.toLowerCase();
    return watchContent.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.genre.some((g) => g.toLowerCase().includes(term)) ||
        item.plot.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Reset state when overlay opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setFocusArea('keyboard');
      setKeyboardPos({ row: 1, col: 0 });
      setResultIndex(0);
    }
  }, [isOpen]);

  // Scroll selected result into view
  useEffect(() => {
    if (focusArea === 'results' && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('[data-result]');
      items[resultIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [resultIndex, focusArea]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Physical keyboard typing
      if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9 ]/)) {
        e.preventDefault();
        setSearchTerm((prev) => prev + e.key.toUpperCase());
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        setSearchTerm((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Navigation
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusArea === 'close') {
            setFocusArea('results');
            setResultIndex(Math.min(2, filteredContent.length - 1));
          } else if (focusArea === 'results') {
            if (resultIndex >= 3) {
              setResultIndex((prev) => prev - 3);
            } else {
              setFocusArea('keyboard');
              setKeyboardPos({ row: KEYBOARD_ROWS.length - 1, col: 0 });
            }
          } else {
            if (keyboardPos.row > 0) {
              setKeyboardPos((prev) => ({
                row: prev.row - 1,
                col: Math.min(prev.col, KEYBOARD_ROWS[prev.row - 1].length - 1),
              }));
            }
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (focusArea === 'keyboard') {
            if (keyboardPos.row < KEYBOARD_ROWS.length - 1) {
              setKeyboardPos((prev) => ({
                row: prev.row + 1,
                col: Math.min(prev.col, KEYBOARD_ROWS[prev.row + 1].length - 1),
              }));
            } else if (filteredContent.length > 0) {
              setFocusArea('results');
              setResultIndex(0);
            }
          } else if (focusArea === 'results') {
            if (resultIndex + 3 < filteredContent.length) {
              setResultIndex((prev) => prev + 3);
            } else {
              setFocusArea('close');
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (focusArea === 'keyboard') {
            setKeyboardPos((prev) => ({
              ...prev,
              col: Math.max(prev.col - 1, 0),
            }));
          } else if (focusArea === 'results') {
            if (resultIndex % 3 > 0) {
              setResultIndex((prev) => prev - 1);
            }
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (focusArea === 'keyboard') {
            setKeyboardPos((prev) => ({
              ...prev,
              col: Math.min(prev.col + 1, KEYBOARD_ROWS[prev.row].length - 1),
            }));
          } else if (focusArea === 'results') {
            if (resultIndex % 3 < 2 && resultIndex < filteredContent.length - 1) {
              setResultIndex((prev) => prev + 1);
            }
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (focusArea === 'close') {
            onClose();
          } else if (focusArea === 'results' && filteredContent[resultIndex]) {
            onSelect(filteredContent[resultIndex]);
            onClose();
          } else if (focusArea === 'keyboard') {
            const key = KEYBOARD_ROWS[keyboardPos.row][keyboardPos.col];
            if (key === 'DEL') {
              setSearchTerm((prev) => prev.slice(0, -1));
            } else if (key === 'SPACE') {
              setSearchTerm((prev) => prev + ' ');
            } else {
              setSearchTerm((prev) => prev + key);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusArea, keyboardPos, resultIndex, filteredContent, onClose, onSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="h-full flex flex-col p-8 max-w-6xl mx-auto">
        {/* Header with search input */}
        <div className="flex items-center gap-4 mb-8">
          <Search className="w-8 h-8 text-muted-foreground" />
          <div className="flex-1 relative">
            <div className="text-3xl font-light text-foreground tracking-wide min-h-[48px] border-b-2 border-nipflix pb-2">
              {searchTerm || <span className="text-muted-foreground">Search titles, genres...</span>}
              <span className="inline-block w-0.5 h-8 bg-nipflix animate-pulse ml-1 align-middle" />
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-3 rounded-full transition-all duration-200',
              focusArea === 'close'
                ? 'bg-nipflix text-white ring-4 ring-nipflix/50 scale-110'
                : 'bg-muted/40 text-foreground hover:bg-muted/60'
            )}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* On-screen keyboard */}
        <div className="mb-8 space-y-2">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-2">
              {row.map((key, colIdx) => {
                const isFocused = focusArea === 'keyboard' && keyboardPos.row === rowIdx && keyboardPos.col === colIdx;
                const isSpecial = key === 'DEL' || key === 'SPACE';

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => {
                      if (key === 'DEL') {
                        setSearchTerm((prev) => prev.slice(0, -1));
                      } else if (key === 'SPACE') {
                        setSearchTerm((prev) => prev + ' ');
                      } else {
                        setSearchTerm((prev) => prev + key);
                      }
                    }}
                    className={cn(
                      'h-12 rounded-lg font-medium transition-all duration-150',
                      'flex items-center justify-center',
                      isSpecial ? 'px-6 min-w-[80px]' : 'w-12',
                      isFocused
                        ? 'bg-nipflix text-white scale-110 ring-2 ring-nipflix/50'
                        : 'bg-muted/30 text-foreground hover:bg-muted/50'
                    )}
                  >
                    {key === 'DEL' ? <Delete className="w-5 h-5" /> : key === 'SPACE' ? '⎵' : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto" ref={resultsRef}>
          {filteredContent.length > 0 ? (
            <>
              <h3 className="text-lg text-muted-foreground mb-4">
                {searchTerm ? `Results for "${searchTerm}"` : 'Popular Titles'}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {filteredContent.map((item, idx) => {
                  const isFocused = focusArea === 'results' && resultIndex === idx;
                  return (
                    <button
                      key={item.id}
                      data-result
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className={cn(
                        'relative aspect-video rounded-lg overflow-hidden transition-all duration-200',
                        'group focus:outline-none',
                        isFocused
                          ? 'ring-4 ring-nipflix scale-105 z-10'
                          : 'hover:ring-2 hover:ring-foreground/50'
                      )}
                    >
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent',
                          'flex flex-col justify-end p-3 transition-opacity',
                          isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.year} • {item.type === 'movie' ? 'Movie' : 'Series'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg">No results found for "{searchTerm}"</p>
              <p className="text-sm">Try different keywords</p>
            </div>
          )}
        </div>

        {/* Navigation hint */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>↑↓←→ Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
