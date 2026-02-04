import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { WatchContent } from '@/data/watchContent';
import { cn } from '@/lib/utils';

interface FeaturedHeroProps {
  content: WatchContent;
  isActive: boolean;
  isInList: boolean;
  onSelect: (content: WatchContent) => void;
  onInfo: (content: WatchContent) => void;
  onToggleList: (id: string) => void;
}

const FeaturedHero = ({ content, isActive, isInList, onSelect, onInfo, onToggleList }: FeaturedHeroProps) => {
  const [focusedButton, setFocusedButton] = useState(0);
  const buttons = ['play', 'info', 'list'];

  // Handle keyboard navigation when hero is active
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedButton(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedButton(prev => Math.min(prev + 1, buttons.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedButton === 0) {
          onSelect(content);
        } else if (focusedButton === 1) {
          onInfo(content);
        } else {
          onToggleList(content.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, focusedButton, content, onSelect, onInfo, onToggleList]);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[700px]">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <img
          src={content.backdrop}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-12 max-w-2xl space-y-6">
          {/* Type badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-nipflix text-white text-xs font-semibold rounded uppercase tracking-wider">
              {content.type === 'series' ? 'Series' : 'Film'}
            </span>
            {content.isHot && (
              <span className="flex items-center gap-1 text-nipflix text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-nipflix animate-pulse" />
                Top 10
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-none">
            {content.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {content.rating}
            </span>
            <span>{content.year}</span>
            <span>
              {content.type === 'movie' 
                ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`
                : `${content.seasons?.length || 1} Season${(content.seasons?.length || 1) > 1 ? 's' : ''}`
              }
            </span>
            <span className="px-2 py-0.5 border border-muted-foreground/30 rounded text-xs">
              {content.genre[0]}
            </span>
          </div>

          {/* Plot */}
          <p className="text-foreground/80 text-base md:text-lg leading-relaxed line-clamp-3">
            {content.plot}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onSelect(content)}
              className={cn(
                'flex items-center gap-2 px-8 py-3 rounded-md font-semibold transition-all duration-200',
                'bg-foreground text-background hover:bg-foreground/90',
                isActive && focusedButton === 0 && 'ring-4 ring-nipflix scale-110 z-10'
              )}
              style={{
                boxShadow: isActive && focusedButton === 0 
                  ? '0 0 30px hsl(var(--nipflix) / 0.6), 0 0 60px hsl(var(--nipflix) / 0.3)'
                  : undefined
              }}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              {content.progress ? 'Resume' : 'Play'}
            </button>
            
            <button
              onClick={() => onInfo(content)}
              className={cn(
                'flex items-center gap-2 px-8 py-3 rounded-md font-semibold transition-all duration-200',
                'bg-muted/60 text-foreground hover:bg-muted/80',
                isActive && focusedButton === 1 && 'ring-4 ring-nipflix scale-110 z-10'
              )}
              style={{
                boxShadow: isActive && focusedButton === 1 
                  ? '0 0 30px hsl(var(--nipflix) / 0.6), 0 0 60px hsl(var(--nipflix) / 0.3)'
                  : undefined
              }}
            >
              <Info className="w-5 h-5" />
              More Info
            </button>

            <button 
              onClick={() => onToggleList(content.id)}
              className={cn(
                'p-3 rounded-full border-2 transition-all duration-200',
                isInList 
                  ? 'border-nipflix bg-nipflix/20 text-nipflix' 
                  : 'border-muted-foreground/40 text-foreground hover:border-foreground',
                isActive && focusedButton === 2 && 'ring-4 ring-nipflix scale-110 z-10'
              )}
              style={{
                boxShadow: isActive && focusedButton === 2 
                  ? '0 0 30px hsl(var(--nipflix) / 0.6), 0 0 60px hsl(var(--nipflix) / 0.3)'
                  : undefined
              }}
            >
              {isInList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress bar for continue watching */}
          {content.progress && content.progress > 0 && (
            <div className="max-w-xs space-y-1">
              <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-nipflix rounded-full"
                  style={{ width: `${content.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{content.progress}% watched</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom fade for smooth transition to content rows */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default FeaturedHero;
