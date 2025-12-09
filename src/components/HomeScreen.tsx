import { useState, useEffect } from "react";
import { Film, Tv, Gamepad2, Monitor, Music, Youtube, LogOut, LucideIcon } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import ContentCarousel from "./ContentCarousel";
import FeaturedHero from "./FeaturedHero";
import AppTile from "./AppTile";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface HomeScreenProps {
  profile: Profile;
  onLogout: () => void;
}

interface AppTileData {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  glowClass: string;
  bgGradient: string;
  badge?: string;
}

interface FeaturedContent {
  type: "game" | "series" | "music";
  title: string;
  subtitle: string;
  gradient: string;
  accentColor: string;
  image: string;
}

const apps: AppTileData[] = [
  {
    id: "nipflix",
    name: "Nipflix",
    icon: Film,
    color: "text-nipflix",
    glowClass: "glow-nipflix",
    bgGradient: "from-nipflix/20 to-nipflix/5",
    badge: "New",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-youtube",
    glowClass: "glow-youtube",
    bgGradient: "from-youtube/20 to-youtube/5",
  },
  {
    id: "tv",
    name: "TV",
    icon: Tv,
    color: "text-tv",
    glowClass: "glow-tv",
    bgGradient: "from-tv/20 to-tv/5",
  },
  {
    id: "retro",
    name: "Retro Gaming",
    icon: Gamepad2,
    color: "text-retro",
    glowClass: "glow-retro",
    bgGradient: "from-retro/20 to-retro/5",
  },
  {
    id: "steam",
    name: "Steam Link",
    icon: Monitor,
    color: "text-steam",
    glowClass: "glow-steam",
    bgGradient: "from-steam/20 to-steam/5",
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: Music,
    color: "text-spotify",
    glowClass: "glow-spotify",
    bgGradient: "from-spotify/20 to-spotify/5",
  },
];

const featuredContent: FeaturedContent[] = [
  {
    type: "series",
    title: "Continue Watching",
    subtitle: "Breaking Bad",
    gradient: "from-nipflix/30 via-nipflix/10 to-transparent",
    accentColor: "text-nipflix",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=600&fit=crop",
  },
  {
    type: "game",
    title: "Last Played",
    subtitle: "Elden Ring",
    gradient: "from-steam/30 via-steam/10 to-transparent",
    accentColor: "text-steam",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=600&fit=crop",
  },
  {
    type: "music",
    title: "Now Playing",
    subtitle: "Chill Vibes",
    gradient: "from-spotify/30 via-spotify/10 to-transparent",
    accentColor: "text-spotify",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop",
  },
];

const continueWatchingItems = [
  { id: "1", title: "Breaking Bad", subtitle: "S5 E14", image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=600&fit=crop", progress: 65, accentColor: "--nipflix" },
  { id: "2", title: "The Office", subtitle: "S3 E12", image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=600&fit=crop", progress: 30, accentColor: "--nipflix" },
  { id: "3", title: "Stranger Things", subtitle: "S4 E7", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop", progress: 80, accentColor: "--nipflix" },
  { id: "4", title: "Dark", subtitle: "S2 E5", image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop", progress: 45, accentColor: "--nipflix" },
  { id: "5", title: "Better Call Saul", subtitle: "S6 E3", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop", progress: 15, accentColor: "--nipflix" },
];

const recentGamesItems = [
  { id: "1", title: "Elden Ring", subtitle: "47h played", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0b?w=400&h=600&fit=crop", accentColor: "--steam" },
  { id: "2", title: "Cyberpunk 2077", subtitle: "23h played", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop", accentColor: "--steam" },
  { id: "3", title: "Hades", subtitle: "89h played", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop", accentColor: "--retro" },
  { id: "4", title: "Hollow Knight", subtitle: "34h played", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop", accentColor: "--retro" },
];

const HomeScreen = ({ profile, onLogout }: HomeScreenProps) => {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const rotateTimer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredContent.length);
    }, 8000);
    return () => clearInterval(rotateTimer);
  }, []);

  const handleLogout = () => {
    setIsVisible(false);
    setTimeout(onLogout, 500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const featured = featuredContent[featuredIndex];
  const activeAccentColor = hoveredApp 
    ? `--${hoveredApp}` 
    : featured.accentColor.replace("text-", "--");

  return (
    <div
      className={`min-h-screen flex flex-col transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Animated Background */}
      <AnimatedBackground accentColor={activeAccentColor} />
      
      {/* Header */}
      <header className="relative flex items-center justify-between px-8 md:px-16 py-6 animate-fade-in-scale z-10">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-extralight tracking-[0.2em] text-gradient animate-breathe">hafo</h1>
        </div>
        
        {/* Time Display */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <div className="text-4xl md:text-6xl font-extralight tracking-wider text-foreground tabular-nums">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm font-light text-muted-foreground tracking-wide mt-1">
            {formatDate(currentTime)}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-full glass hover:bg-secondary/60 transition-all duration-300 group hover:scale-105"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors font-light">
            {profile.name}
          </span>
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
        </button>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col px-8 md:px-16 pb-8 z-10 overflow-hidden">
        {/* Featured Content Hero */}
        <div className="mb-6 md:mb-8 animate-fade-in-scale" style={{ animationDelay: "0.1s" }}>
          <FeaturedHero 
            content={featured}
            allContent={featuredContent}
            currentIndex={featuredIndex}
            onIndexChange={setFeaturedIndex}
          />
        </div>

        {/* Content Carousels */}
        <div className="space-y-6 mb-8 animate-fade-in-scale" style={{ animationDelay: "0.2s" }}>
          <ContentCarousel title="Continue Watching" items={continueWatchingItems} />
          <ContentCarousel title="Recent Games" items={recentGamesItems} />
        </div>

        {/* Apps Section */}
        <div className="mt-auto">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 animate-fade-in-scale" style={{ animationDelay: "0.3s" }}>
            Your Apps
          </h3>
          
          {/* Apps Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5">
            {apps.map((app, index) => (
              <AppTile
                key={app.id}
                {...app}
                index={index}
                isHovered={hoveredApp === app.id}
                isOtherHovered={hoveredApp !== null && hoveredApp !== app.id}
                onHover={setHoveredApp}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 md:px-16 py-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground/40">
          <span className="font-light tracking-wider">hafo media hub</span>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <span className="font-light">v1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
