import { Play, Clock, Info } from "lucide-react";

interface FeaturedContent {
  type: "game" | "series" | "music";
  title: string;
  subtitle: string;
  gradient: string;
  accentColor: string;
  image: string;
}

interface FeaturedHeroProps {
  content: FeaturedContent;
  allContent: FeaturedContent[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const FeaturedHero = ({ content, allContent, currentIndex, onIndexChange }: FeaturedHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/30 transition-all duration-700">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={content.image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out scale-105 hover:scale-100"
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        <div className={`absolute inset-0 bg-gradient-to-br ${content.gradient} opacity-50`} />
      </div>
      
      {/* Animated glow */}
      <div 
        className="absolute inset-0 opacity-30 animate-pulse-slow"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, hsl(var(${content.accentColor.replace('text-', '--')}) / 0.3) 0%, transparent 60%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 min-h-[280px] md:min-h-[320px] flex flex-col justify-between">
        <div className="space-y-4">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <div 
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: `hsl(var(${content.accentColor.replace('text-', '--')}))` }}
            />
            <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className={`text-xs font-medium uppercase tracking-widest ${content.accentColor}`}>
              {content.title}
            </span>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-light text-foreground tracking-wide max-w-lg leading-tight">
            {content.subtitle}
          </h2>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button className="group flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <Play className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" />
              Resume
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-full glass hover:bg-secondary/80 transition-all duration-300 font-light hover:scale-105">
              <Info className="w-4 h-4" strokeWidth={1.5} />
              Details
            </button>
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="flex items-center gap-3 mt-8">
          {allContent.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className="group relative h-1 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: idx === currentIndex ? "3rem" : "0.5rem" }}
            >
              <div className="absolute inset-0 bg-muted-foreground/30" />
              {idx === currentIndex && (
                <div 
                  className="absolute inset-0 rounded-full animate-progress"
                  style={{ backgroundColor: `hsl(var(${content.accentColor.replace('text-', '--')}))` }}
                />
              )}
              <div 
                className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                  idx === currentIndex ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{ backgroundColor: `hsl(var(--foreground) / 0.5)` }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedHero;
