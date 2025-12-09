import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  progress?: number;
  accentColor: string;
}

interface ContentCarouselProps {
  title: string;
  items: ContentItem[];
}

const ContentCarousel = ({ title, items }: ContentCarouselProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group/carousel">
      <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-widest mb-4 px-1">
        {title}
      </h3>
      
      {/* Navigation Arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-14 h-28 flex items-center justify-center bg-gradient-to-r from-background via-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
      >
        <div className="w-10 h-10 rounded-full glass-premium flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </div>
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-14 h-28 flex items-center justify-center bg-gradient-to-l from-background via-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
      >
        <div className="w-10 h-10 rounded-full glass-premium flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </div>
      </button>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative flex-shrink-0 w-48 md:w-56 group/item cursor-pointer"
          >
            {/* Card */}
            <div
              className={`relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-500 ease-out ${
                hoveredItem === item.id ? "scale-105 z-10" : ""
              } ${hoveredItem && hoveredItem !== item.id ? "opacity-50 scale-95" : ""}`}
              style={{
                boxShadow: hoveredItem === item.id 
                  ? `0 20px 50px -15px hsl(0 0% 0% / 0.6), 0 0 40px -10px hsl(var(${item.accentColor}) / 0.3)`
                  : '0 10px 30px -10px hsl(0 0% 0% / 0.4)',
              }}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover brightness-105"
              />
              
              {/* Top edge highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              
              {/* Border */}
              <div className="absolute inset-0 rounded-xl border border-white/10" />
              
              {/* Glow effect on hover */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  hoveredItem === item.id ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  boxShadow: `inset 0 0 80px hsl(var(${item.accentColor}) / 0.25)`,
                }}
              />
              
              {/* Play button on hover */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  hoveredItem === item.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-foreground/95 backdrop-blur-sm flex items-center justify-center transform transition-transform duration-300 hover:scale-110 shadow-xl">
                  <Play className="w-6 h-6 text-background ml-1" fill="currentColor" />
                </div>
              </div>
              
              {/* Content info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-sm font-medium text-foreground truncate text-shadow-sm">{item.title}</h4>
                <p className="text-xs text-foreground/70 truncate mt-0.5">{item.subtitle}</p>
                
                {/* Progress bar - enhanced */}
                {item.progress !== undefined && (
                  <div className="mt-3 h-1 bg-foreground/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: `hsl(var(${item.accentColor}))`,
                        boxShadow: `0 0 8px hsl(var(${item.accentColor}) / 0.5)`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentCarousel;