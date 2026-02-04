import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Delete, Loader2, User, Film, ArrowLeft } from 'lucide-react';
import { WatchContent, watchContent } from '@/data/watchContent';
import { useTMDBSearch, useTMDBPersonSearch, usePersonCredits } from '@/hooks/useTMDB';
import { TMDBPerson } from '@/services/tmdbService';
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

type FocusArea = 'searchType' | 'keyboard' | 'results' | 'close' | 'back';
type SearchType = 'content' | 'person';

const SearchOverlay = ({ isOpen, onClose, onSelect }: SearchOverlayProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('content');
  const [selectedPerson, setSelectedPerson] = useState<TMDBPerson | null>(null);
  const [focusArea, setFocusArea] = useState<FocusArea>('keyboard');
  const [keyboardPos, setKeyboardPos] = useState({ row: 0, col: 0 });
  const [resultIndex, setResultIndex] = useState(0);
  const [searchTypeIndex, setSearchTypeIndex] = useState(0); // 0 = content, 1 = person
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search term - reduced for faster response
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Track if we're waiting for debounce (immediate visual feedback)
  const isWaitingForDebounce = searchTerm !== debouncedTerm && searchTerm.trim().length > 0;

  // Use TMDB search hooks
  const { data: tmdbResults, isLoading: isSearchingContent } = useTMDBSearch(
    searchType === 'content' ? debouncedTerm : ''
  );
  const { data: personResults, isLoading: isSearchingPerson } = useTMDBPersonSearch(
    searchType === 'person' && !selectedPerson ? debouncedTerm : ''
  );
  const { data: personCredits, isLoading: isLoadingCredits } = usePersonCredits(
    selectedPerson?.id
  );

  const isSearching = isWaitingForDebounce || isSearchingContent || isSearchingPerson || isLoadingCredits;

  // Filter content based on search term - fallback to local data if no TMDB results
  const filteredContent = useMemo(() => {
    // If viewing person's filmography
    if (selectedPerson && personCredits) {
      return personCredits;
    }

    // Person search mode
    if (searchType === 'person') {
      return []; // Person results are handled separately
    }

    // If we have TMDB results, use those
    if (tmdbResults && tmdbResults.length > 0) {
      return tmdbResults;
    }
    
    // Fallback to local content
    if (!searchTerm.trim()) return watchContent.slice(0, 12);
    const term = searchTerm.toLowerCase();
    return watchContent.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.genre.some((g) => g.toLowerCase().includes(term)) ||
        item.plot.toLowerCase().includes(term)
    );
  }, [searchTerm, tmdbResults, searchType, selectedPerson, personCredits]);

  // Reset state when overlay opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setDebouncedTerm('');
      setSearchType('content');
      setSelectedPerson(null);
      setFocusArea('keyboard');
      setKeyboardPos({ row: 1, col: 0 });
      setResultIndex(0);
      setSearchTypeIndex(0);
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
        if (selectedPerson) {
          setSelectedPerson(null);
          setFocusArea('results');
        } else {
          onClose();
        }
        return;
      }

      const resultsToShow = searchType === 'person' && !selectedPerson 
        ? (personResults || []) 
        : filteredContent;
      const resultsLength = resultsToShow.length;

      // Navigation
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusArea === 'close') {
            setFocusArea('results');
            setResultIndex(Math.min(2, resultsLength - 1));
          } else if (focusArea === 'back') {
            setFocusArea('searchType');
          } else if (focusArea === 'results') {
            if (resultIndex >= 3) {
              setResultIndex((prev) => prev - 3);
            } else if (selectedPerson) {
              setFocusArea('back');
            } else {
              setFocusArea('keyboard');
              setKeyboardPos({ row: KEYBOARD_ROWS.length - 1, col: 0 });
            }
          } else if (focusArea === 'keyboard') {
            if (keyboardPos.row > 0) {
              setKeyboardPos((prev) => ({
                row: prev.row - 1,
                col: Math.min(prev.col, KEYBOARD_ROWS[prev.row - 1].length - 1),
              }));
            } else {
              setFocusArea('searchType');
            }
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (focusArea === 'searchType') {
            if (selectedPerson) {
              setFocusArea('back');
            } else {
              setFocusArea('keyboard');
              setKeyboardPos({ row: 0, col: 0 });
            }
          } else if (focusArea === 'back') {
            if (resultsLength > 0) {
              setFocusArea('results');
              setResultIndex(0);
            }
          } else if (focusArea === 'keyboard') {
            if (keyboardPos.row < KEYBOARD_ROWS.length - 1) {
              setKeyboardPos((prev) => ({
                row: prev.row + 1,
                col: Math.min(prev.col, KEYBOARD_ROWS[prev.row + 1].length - 1),
              }));
            } else if (resultsLength > 0) {
              setFocusArea('results');
              setResultIndex(0);
            }
          } else if (focusArea === 'results') {
            if (resultIndex + 3 < resultsLength) {
              setResultIndex((prev) => prev + 3);
            } else {
              setFocusArea('close');
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (focusArea === 'searchType') {
            if (searchTypeIndex > 0) {
              setSearchTypeIndex(0);
              setSearchType('content');
              setSelectedPerson(null);
            }
          } else if (focusArea === 'keyboard') {
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
          if (focusArea === 'searchType') {
            if (searchTypeIndex < 1) {
              setSearchTypeIndex(1);
              setSearchType('person');
              setSelectedPerson(null);
            }
          } else if (focusArea === 'keyboard') {
            setKeyboardPos((prev) => ({
              ...prev,
              col: Math.min(prev.col + 1, KEYBOARD_ROWS[prev.row].length - 1),
            }));
          } else if (focusArea === 'results') {
            if (resultIndex % 3 < 2 && resultIndex < resultsLength - 1) {
              setResultIndex((prev) => prev + 1);
            }
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (focusArea === 'close') {
            onClose();
          } else if (focusArea === 'back') {
            setSelectedPerson(null);
            setFocusArea('results');
          } else if (focusArea === 'searchType') {
            const newType = searchTypeIndex === 0 ? 'content' : 'person';
            setSearchType(newType);
            setSelectedPerson(null);
          } else if (focusArea === 'results') {
            if (searchType === 'person' && !selectedPerson) {
              // Select a person to view their filmography
              const person = personResults?.[resultIndex];
              if (person) {
                setSelectedPerson(person);
                setResultIndex(0);
                setFocusArea('back');
              }
            } else if (filteredContent[resultIndex]) {
              onSelect(filteredContent[resultIndex]);
              onClose();
            }
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
  }, [isOpen, focusArea, keyboardPos, resultIndex, filteredContent, personResults, searchType, selectedPerson, onClose, onSelect, searchTypeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-background animate-in fade-in duration-200 pt-16">
      <div className="h-full flex flex-col p-8 ml-52">
        {/* Search Type Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm text-muted-foreground mr-2">Search for:</span>
          <button
            onClick={() => {
              setSearchType('content');
              setSearchTypeIndex(0);
              setSelectedPerson(null);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200',
              focusArea === 'searchType' && searchTypeIndex === 0
                ? 'bg-nipflix text-white ring-4 ring-nipflix/50 scale-105'
                : searchType === 'content'
                ? 'bg-nipflix/80 text-white'
                : 'bg-muted/40 text-foreground hover:bg-muted/60'
            )}
          >
            <Film className="w-4 h-4" />
            Titles
          </button>
          <button
            onClick={() => {
              setSearchType('person');
              setSearchTypeIndex(1);
              setSelectedPerson(null);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200',
              focusArea === 'searchType' && searchTypeIndex === 1
                ? 'bg-nipflix text-white ring-4 ring-nipflix/50 scale-105'
                : searchType === 'person'
                ? 'bg-nipflix/80 text-white'
                : 'bg-muted/40 text-foreground hover:bg-muted/60'
            )}
          >
            <User className="w-4 h-4" />
            People
          </button>
        </div>

        {/* Header with search input */}
        <div className="flex items-center gap-4 mb-8">
          {isSearching ? (
            <Loader2 className="w-8 h-8 text-nipflix animate-spin" />
          ) : (
            <Search className="w-8 h-8 text-muted-foreground" />
          )}
          <div className="flex-1 relative">
            <div className="text-3xl font-light text-foreground tracking-wide min-h-[48px] border-b-2 border-nipflix pb-2">
              {searchTerm || (
                <span className="text-muted-foreground">
                  {searchType === 'content' ? 'Search titles, genres...' : 'Search actors, actresses...'}
                </span>
              )}
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

        {/* Selected Person Header */}
        {selectedPerson && (
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedPerson(null);
                setFocusArea('results');
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-4',
                focusArea === 'back'
                  ? 'bg-nipflix text-white ring-4 ring-nipflix/50'
                  : 'bg-muted/40 text-foreground hover:bg-muted/60'
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to search</span>
            </button>
            <div className="flex items-center gap-4">
              {selectedPerson.profile_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w185${selectedPerson.profile_path}`}
                  alt={selectedPerson.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{selectedPerson.name}</h2>
                <p className="text-muted-foreground">{selectedPerson.known_for_department}</p>
              </div>
            </div>
          </div>
        )}

        {/* On-screen keyboard (hidden when viewing filmography) */}
        {!selectedPerson && (
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
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto" ref={resultsRef}>
          {/* Person Search Results */}
          {searchType === 'person' && !selectedPerson && (
            <>
              {personResults && personResults.length > 0 ? (
                <>
                  <h3 className="text-lg text-muted-foreground mb-4">
                    {searchTerm ? `People matching "${searchTerm}"` : 'Popular People'}
                    {isSearchingPerson && <span className="ml-2 text-nipflix">(searching...)</span>}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {personResults.map((person, idx) => {
                      const isFocused = focusArea === 'results' && resultIndex === idx;
                      return (
                        <button
                          key={person.id}
                          data-result
                          onClick={() => {
                            setSelectedPerson(person);
                            setResultIndex(0);
                            setFocusArea('back');
                          }}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-lg transition-all duration-200',
                            'focus:outline-none',
                            isFocused
                              ? 'bg-nipflix/20 ring-4 ring-nipflix scale-[1.02]'
                              : 'bg-muted/20 hover:bg-muted/40'
                          )}
                        >
                        {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              alt={person.name}
                              className="w-16 h-20 rounded-lg object-cover transition-opacity duration-300 bg-muted/50"
                              style={{ opacity: 0 }}
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '1';
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '1';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-20 rounded-lg bg-muted/50 flex items-center justify-center">
                              <User className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="text-left flex-1">
                            <p className="font-semibold text-foreground">{person.name}</p>
                            <p className="text-sm text-muted-foreground">{person.known_for_department}</p>
                            {person.known_for && person.known_for.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                Known for: {person.known_for.map(k => k.title || k.name).slice(0, 2).join(', ')}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : searchTerm ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <User className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg">No people found for "{searchTerm}"</p>
                  <p className="text-sm">Try a different name</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <User className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg">Search for actors and actresses</p>
                  <p className="text-sm">Type a name to find their filmography</p>
                </div>
              )}
            </>
          )}

          {/* Content Results (including person filmography) */}
          {(searchType === 'content' || selectedPerson) && (
            <>
              {filteredContent.length > 0 ? (
                <>
                  <h3 className="text-lg text-muted-foreground mb-4">
                    {selectedPerson
                      ? `${selectedPerson.name}'s Filmography`
                      : searchTerm
                      ? `Results for "${searchTerm}"`
                      : 'Popular Titles'}
                    {(isSearchingContent || isLoadingCredits) && (
                      <span className="ml-2 text-nipflix">(loading...)</span>
                    )}
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
                            'group focus:outline-none bg-muted/50',
                            isFocused
                              ? 'ring-4 ring-nipflix scale-105 z-10'
                              : 'hover:ring-2 hover:ring-foreground/50'
                          )}
                        >
                          <img
                            src={item.backdrop || item.poster}
                            alt={item.title}
                            className="w-full h-full object-cover transition-opacity duration-300"
                            style={{ opacity: 0 }}
                            onLoad={(e) => {
                              (e.target as HTMLImageElement).style.opacity = '1';
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                              (e.target as HTMLImageElement).style.opacity = '1';
                            }}
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
                              {item.rating && ` • ⭐ ${item.rating}`}
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
            </>
          )}
        </div>

        {/* Navigation hint */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>↑↓←→ Navigate</span>
          <span>Enter Select</span>
          <span>Esc {selectedPerson ? 'Back' : 'Close'}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;