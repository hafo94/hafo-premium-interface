import { useState, useEffect } from 'react';
import { X, Play, Plus, Check, ThumbsUp, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { WatchContent, Season, Episode } from '@/data/watchContent';
import { cn } from '@/lib/utils';

interface ContentDetailProps {
  content: WatchContent;
  isInList: boolean;
  onToggleList: (id: string) => void;
  onClose: () => void;
}

const ContentDetail = ({ content, isInList, onToggleList, onClose }: ContentDetailProps) => {
  const [expandedSeason, setExpandedSeason] = useState<string | null>(
    content.seasons?.[0]?.id || null
  );
  const [focusedButton, setFocusedButton] = useState(0);

  const buttons = ['play', 'add', 'like', 'mute'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedButton((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedButton((prev) => Math.min(buttons.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (buttons[focusedButton] === 'play') {
            // Play action
          } else if (buttons[focusedButton] === 'add') {
            onToggleList(content.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, focusedButton, content.id, onToggleList]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center py-8 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-4 bg-card rounded-lg overflow-hidden shadow-2xl animate-fade-in-scale">
        {/* Hero Backdrop */}
        <div className="relative aspect-video">
          <img
            src={content.backdrop}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-card/80 hover:bg-card transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs font-semibold text-nipflix tracking-widest mb-1">
              {content.type === 'movie' ? 'FILM' : 'SERIES'}
            </p>
            <h1 className="text-3xl font-bold text-foreground tracking-wide mb-4">
              {content.title.toUpperCase()}
            </h1>

            {/* Progress bar (if watching) */}
            {content.progress && content.progress > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-nipflix"
                    style={{ width: `${content.progress}%` }}
                  />
                </div>
                {content.runtime && content.runtime > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {Math.round((content.progress / 100) * content.runtime)}m of {formatRuntime(content.runtime)}
                  </span>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                className={cn(
                  'flex items-center gap-2 px-6 py-2 bg-foreground text-background font-semibold rounded transition-all',
                  focusedButton === 0 && 'ring-4 ring-foreground/50'
                )}
              >
                <Play className="w-5 h-5 fill-current" />
                {content.progress ? 'Resume' : 'Play'}
              </button>
              <button
                onClick={() => onToggleList(content.id)}
                className={cn(
                  'p-2 rounded-full border-2 transition-all',
                  isInList 
                    ? 'border-nipflix bg-nipflix/20 text-nipflix' 
                    : 'border-muted-foreground/50 hover:border-foreground',
                  focusedButton === 1 && 'ring-4 ring-foreground/50'
                )}
              >
                {isInList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              <button
                className={cn(
                  'p-2 rounded-full border-2 border-muted-foreground/50 hover:border-foreground transition-colors',
                  focusedButton === 2 && 'ring-4 ring-foreground/50 border-foreground'
                )}
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              <div className="flex-1" />
              <button
                className={cn(
                  'p-2 rounded-full border-2 border-muted-foreground/50 hover:border-foreground transition-colors',
                  focusedButton === 3 && 'ring-4 ring-foreground/50 border-foreground'
                )}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content info */}
        <div className="p-6">
          <div className="flex gap-8 mb-6">
            {/* Left column - metadata */}
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm mb-4">
                <span className="text-foreground">{content.year}</span>
                {content.runtime && content.runtime > 0 && (
                  <span className="text-muted-foreground">{formatRuntime(content.runtime)}</span>
                )}
                <span className="px-1.5 py-0.5 border border-muted-foreground/50 text-xs rounded">HD</span>
                {isInList && (
                  <span className="flex items-center gap-1 text-nipflix text-xs font-medium">
                    <Check className="w-3 h-3" />
                    In My List
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.plot}
              </p>
            </div>

            {/* Right column - genres */}
            <div className="w-48 text-sm">
              <p className="text-muted-foreground mb-2">
                <span className="text-foreground/60">Genres: </span>
                {content.genre.join(', ')}
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground/60">Rating: </span>
                {content.rating}/10
              </p>
            </div>
          </div>

          {/* Seasons & Episodes (for series) */}
          {content.type === 'series' && content.seasons && (
            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Episodes
              </h2>
              <div className="space-y-2">
                {content.seasons.map((season) => (
                  <SeasonAccordion
                    key={season.id}
                    season={season}
                    isExpanded={expandedSeason === season.id}
                    onToggle={() =>
                      setExpandedSeason(
                        expandedSeason === season.id ? null : season.id
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* More Like This */}
          <div className="border-t border-border pt-6 mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              More Like This
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=300&h=170&fit=crop`}
                    alt=""
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SeasonAccordionProps {
  season: Season;
  isExpanded: boolean;
  onToggle: () => void;
}

const SeasonAccordion = ({ season, isExpanded, onToggle }: SeasonAccordionProps) => {
  return (
    <div className="bg-secondary/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <span className="font-medium">Season {season.number}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {season.episodes.length} episodes
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {season.episodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} />
          ))}
        </div>
      )}
    </div>
  );
};

interface EpisodeRowProps {
  episode: Episode;
}

const EpisodeRow = ({ episode }: EpisodeRowProps) => {
  return (
    <button className="w-full flex items-start gap-4 p-4 hover:bg-accent/30 transition-colors text-left group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-nipflix transition-colors">
        <Play className="w-3 h-3 fill-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-muted-foreground text-sm">{episode.number}</span>
          <span className="font-medium text-foreground">{episode.title}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{episode.plot}</p>
      </div>
      <div className="flex-shrink-0 text-sm text-muted-foreground">
        {episode.runtime}m
      </div>
    </button>
  );
};

export default ContentDetail;
