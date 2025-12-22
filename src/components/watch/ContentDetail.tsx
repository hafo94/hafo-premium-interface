import { useState, useEffect } from 'react';
import { X, Star, Clock, Calendar, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { WatchContent, Season, Episode } from '@/data/watchContent';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentDetailProps {
  content: WatchContent;
  onClose: () => void;
}

const ContentDetail = ({ content, onClose }: ContentDetailProps) => {
  const [expandedSeason, setExpandedSeason] = useState<string | null>(
    content.seasons?.[0]?.id || null
  );
  const [focusedElement, setFocusedElement] = useState<'close' | 'play' | 'season' | 'episode'>('play');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden rounded-2xl glass-strong animate-fade-in-scale">
        {/* Backdrop image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={content.backdrop}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/70 transition-colors',
            focusedElement === 'close' && 'ring-2 ring-nipflix'
          )}
        >
          <X className="w-5 h-5" />
        </button>

        <ScrollArea className="max-h-[90vh]">
          <div className="p-8">
            {/* Header */}
            <div className="flex gap-6 mb-8">
              {/* Poster */}
              <div className="flex-shrink-0 w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-elevated">
                <img
                  src={content.poster}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {content.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{content.year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {content.type === 'movie'
                        ? formatRuntime(content.runtime)
                        : `${content.runtime}m avg`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-foreground font-medium">
                      {content.rating.toFixed(1)}
                    </span>
                    <span>/ 10</span>
                  </div>
                  <span className="px-2 py-0.5 bg-nipflix/20 text-nipflix rounded-full text-xs font-medium capitalize">
                    {content.type}
                  </span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {content.genre.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-secondary rounded-full text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Plot */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {content.plot}
                </p>

                {/* Play button */}
                <button
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 bg-nipflix hover:bg-nipflix/90 text-foreground font-medium rounded-xl transition-colors',
                    focusedElement === 'play' && 'ring-2 ring-foreground ring-offset-2 ring-offset-card'
                  )}
                >
                  <Play className="w-5 h-5 fill-foreground" />
                  <span>{content.type === 'movie' ? 'Play Movie' : 'Play S1 E1'}</span>
                </button>
              </div>
            </div>

            {/* Seasons & Episodes (for series) */}
            {content.type === 'series' && content.seasons && (
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Seasons & Episodes
                </h2>
                <div className="space-y-3">
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
          </div>
        </ScrollArea>
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
    <div className="bg-secondary/50 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/70 transition-colors"
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
    <button className="w-full flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors text-left group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-nipflix transition-colors">
        <Play className="w-4 h-4 fill-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-muted-foreground text-sm">E{episode.number}</span>
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
