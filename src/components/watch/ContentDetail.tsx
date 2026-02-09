import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Plus, Check, ThumbsUp, ChevronDown, ChevronUp, Volume2, ArrowLeft, Loader2 } from 'lucide-react';
import { WatchContent, Season, Episode } from '@/data/watchContent';
import { cn } from '@/lib/utils';
import { useMovieDetails, useSeriesDetails } from '@/hooks/useTMDB';
import { useToast } from '@/hooks/use-toast';
import StreamPlayer from '@/components/player/StreamPlayer';
import { useIPTVLibrary } from '@/hooks/useIPTVLibrary';

interface ContentDetailProps {
  content: WatchContent;
  isInList: boolean;
  onToggleList: (id: string) => void;
  onClose: () => void;
}

const ContentDetail = ({ content, isInList, onToggleList, onClose }: ContentDetailProps) => {
  const { enrichWithIPTV, isLoading: iptvLoading } = useIPTVLibrary();

  // Always enrich content with latest IPTV data so streamUrl is available
  const iptvContent = useMemo(() => {
    const enriched = enrichWithIPTV([content]);
    return enriched[0] || content;
  }, [content, enrichWithIPTV]);

  const [expandedSeason, setExpandedSeason] = useState<string | null>(
    content.seasons?.[0]?.id || null
  );
  const [focusedButton, setFocusedButton] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const contentScrollRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: movieDetails } = useMovieDetails(
    content.type === 'movie' ? content.tmdbId : undefined
  );
  const { data: seriesDetails } = useSeriesDetails(
    content.type === 'series' ? content.tmdbId : undefined
  );

  const enrichedContent = movieDetails || seriesDetails || content;

  const buttons = ['play', 'add', 'like', 'mute'];

  const handlePlay = () => {
    if (iptvLoading) {
      toast({
        title: "Loading IPTV catalog",
        description: "Please wait while the catalog finishes loading...",
      });
      return;
    }
    if (!iptvContent.streamUrl) {
      toast({
        title: "No stream available",
        description: "This title is not available for streaming yet.",
        variant: "destructive",
      });
      return;
    }
    setIsPlayerOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlayerOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsPlayerOpen(false);
        }
        return; // StreamPlayer handles its own keys
      }

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
        case 'ArrowUp':
          e.preventDefault();
          contentScrollRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
          break;
        case 'ArrowDown':
          e.preventDefault();
          contentScrollRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
          break;
        case 'Enter':
          e.preventDefault();
          if (buttons[focusedButton] === 'play') {
            handlePlay();
          } else if (buttons[focusedButton] === 'add') {
            onToggleList(content.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, focusedButton, content.id, onToggleList, isPlayerOpen]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Fullscreen player overlay
  if (isPlayerOpen && iptvContent.streamUrl) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col">
        <button
          onClick={() => setIsPlayerOpen(false)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/30 hover:bg-background/50 backdrop-blur-sm text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <StreamPlayer
          streamUrl={iptvContent.streamUrl}
          isPlaying={true}
          isMuted={false}
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col bg-card rounded-lg overflow-hidden shadow-2xl animate-fade-in-scale">
        {/* Hero Backdrop */}
        <div className="relative h-[300px] flex-shrink-0">
          <img src={content.posterLarge || content.backdrop} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-card/80 hover:bg-card transition-colors">
            <X className="w-6 h-6" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs font-semibold text-nipflix tracking-widest mb-1">
              {content.type === 'movie' ? 'FILM' : 'SERIES'}
            </p>
            <h1 className="text-3xl font-bold text-foreground tracking-wide mb-4">
              {content.title.toUpperCase()}
            </h1>

            {content.progress && content.progress > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-nipflix" style={{ width: `${content.progress}%` }} />
                </div>
                {content.runtime && content.runtime > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {Math.round((content.progress / 100) * content.runtime)}m of {formatRuntime(content.runtime)}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handlePlay}
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
                  isInList ? 'border-nipflix bg-nipflix/20 text-nipflix' : 'border-muted-foreground/50 hover:border-foreground',
                  focusedButton === 1 && 'ring-4 ring-foreground/50'
                )}
              >
                {isInList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              <button className={cn('p-2 rounded-full border-2 border-muted-foreground/50 hover:border-foreground transition-colors', focusedButton === 2 && 'ring-4 ring-foreground/50 border-foreground')}>
                <ThumbsUp className="w-5 h-5" />
              </button>
              <div className="flex-1" />
              <button className={cn('p-2 rounded-full border-2 border-muted-foreground/50 hover:border-foreground transition-colors', focusedButton === 3 && 'ring-4 ring-foreground/50 border-foreground')}>
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content info */}
        <div ref={contentScrollRef} className="p-6 flex-1 overflow-y-auto">
          <div className="flex gap-8 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm mb-4">
                <span className="text-foreground">{content.year}</span>
                {content.runtime && content.runtime > 0 && (
                  <span className="text-muted-foreground">{formatRuntime(content.runtime)}</span>
                )}
                <span className="px-1.5 py-0.5 border border-muted-foreground/50 text-xs rounded">HD</span>
                {isInList && (
                  <span className="flex items-center gap-1 text-nipflix text-xs font-medium">
                    <Check className="w-3 h-3" /> In My List
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{content.plot}</p>

              {/* Cast */}
              {enrichedContent.cast && enrichedContent.cast.length > 0 && (
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="text-foreground/60">Cast: </span>
                  {enrichedContent.cast.slice(0, 3).join(', ')}
                </p>
              )}

              {/* Director (movies only) */}
              {content.type === 'movie' && enrichedContent.director && (
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground/60">Director: </span>
                  {enrichedContent.director}
                </p>
              )}
            </div>

            <div className="w-48 text-sm">
              <p className="text-muted-foreground mb-2">
                <span className="text-foreground/60">Genres: </span>
                {content.genre.join(', ')}
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground/60">Rating: </span>
                {enrichedContent.imdbRating ? (
                  <span className="text-accent font-semibold">IMDb {enrichedContent.imdbRating}</span>
                ) : (
                  <>{content.rating}/10</>
                )}
              </p>
            </div>
          </div>

          {/* Seasons & Episodes */}
          {content.type === 'series' && content.seasons && (
            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Episodes</h2>
              <div className="space-y-2">
                {content.seasons.map((season) => (
                  <SeasonAccordion
                    key={season.id}
                    season={season}
                    isExpanded={expandedSeason === season.id}
                    onToggle={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* More Like This */}
          <div className="border-t border-border pt-6 mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">More Like This</h2>
            {enrichedContent.similarContent && enrichedContent.similarContent.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {enrichedContent.similarContent.slice(0, 6).map((item) => (
                  <div key={item.id} className="aspect-video bg-muted rounded-md overflow-hidden relative group cursor-pointer">
                    <img src={item.backdrop || item.poster} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-xs font-medium text-white line-clamp-2">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No similar content available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

interface SeasonAccordionProps {
  season: Season;
  isExpanded: boolean;
  onToggle: () => void;
}

const SeasonAccordion = ({ season, isExpanded, onToggle }: SeasonAccordionProps) => (
  <div className="bg-secondary/30 rounded-lg overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
      <span className="font-medium">Season {season.number}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{season.episodes.length} episodes</span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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

const EpisodeRow = ({ episode }: { episode: Episode }) => (
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
    <div className="flex-shrink-0 text-sm text-muted-foreground">{episode.runtime}m</div>
  </button>
);

export default ContentDetail;
