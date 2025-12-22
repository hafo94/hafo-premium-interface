import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { genres } from '@/data/watchContent';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WatchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  minRating: string;
  onRatingChange: (rating: string) => void;
}

const years = ['All Years', '2020s', '2010s', '2000s', '1990s', 'Before 1990'];
const ratings = ['All Ratings', '9+', '8+', '7+', '6+'];

const WatchFilters = ({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  minRating,
  onRatingChange,
}: WatchFiltersProps) => {
  const hasActiveFilters =
    selectedGenre !== 'All Genres' ||
    selectedYear !== 'All Years' ||
    minRating !== 'All Ratings';

  const clearFilters = () => {
    onGenreChange('All Genres');
    onYearChange('All Years');
    onRatingChange('All Ratings');
  };

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search movies & series..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Filters:</span>
          </div>

          {/* Genre */}
          <Select value={selectedGenre} onValueChange={onGenreChange}>
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Genres">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="w-[130px] bg-secondary border-border">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rating */}
          <Select value={minRating} onValueChange={onRatingChange}>
            <SelectTrigger className="w-[130px] bg-secondary border-border">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              {ratings.map((rating) => (
                <SelectItem key={rating} value={rating}>
                  {rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchFilters;
