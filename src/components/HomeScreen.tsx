import { useState, useEffect } from "react";
import { Film, Tv, Gamepad2, Monitor, Music, Youtube, ChevronDown, Wifi, Settings, LogOut, Users, LucideIcon } from "lucide-react";
import breakingBadHeader from "@/assets/breaking_bad_header.png";
import eldenRingHeader from "@/assets/elden_ring_header.png";
import chillVibesHeader from "@/assets/chill_vibes_header.png";
// Continue Watching images
import cwBreakingBad from "@/assets/cw_breakingbad.png";
import cwDark from "@/assets/cw_dark.png";
import cwStrangerThings from "@/assets/cw_strangerthings.png";
import cwTheOffice from "@/assets/cw_theoffice.png";
// Recent Games images
import rgCyberpunk from "@/assets/rg_cyberpunk.png";
import rgEldenRing from "@/assets/rg_eldenring.png";
import rgHades from "@/assets/rg_hades.png";
import rgHollowKnight from "@/assets/rg_hollowknight.png";
import AnimatedBackground from "./AnimatedBackground";
import ContentCarousel from "./ContentCarousel";
import FeaturedHero from "./FeaturedHero";
import AppTile from "./AppTile";
import SettingsModal from "./SettingsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    bgGradient: "from-nipflix/25 to-nipflix/5",
    badge: "New",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-youtube",
    glowClass: "glow-youtube",
    bgGradient: "from-youtube/25 to-youtube/5",
  },
  {
    id: "tv",
    name: "TV",
    icon: Tv,
    color: "text-tv",
    glowClass: "glow-tv",
    bgGradient: "from-tv/25 to-tv/5",
  },
  {
    id: "retro",
    name: "Retro Gaming",
    icon: Gamepad2,
    color: "text-retro",
    glowClass: "glow-retro",
    bgGradient: "from-retro/25 to-retro/5",
  },
  {
    id: "steam",
    name: "Steam Link",
    icon: Monitor,
    color: "text-steam",
    glowClass: "glow-steam",
    bgGradient: "from-steam/25 to-steam/5",
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: Music,
    color: "text-spotify",
    glowClass: "glow-spotify",
    bgGradient: "from-spotify/25 to-spotify/5",
  },
];

const featuredContent: FeaturedContent[] = [
  {
    type: "series",
    title: "Continue Watching",
    subtitle: "Breaking Bad",
    gradient: "from-nipflix/40 via-nipflix/15 to-transparent",
    accentColor: "text-nipflix",
    image: breakingBadHeader,
  },
  {
    type: "game",
    title: "Last Played",
    subtitle: "Elden Ring",
    gradient: "from-steam/40 via-steam/15 to-transparent",
    accentColor: "text-steam",
    image: eldenRingHeader,
  },
  {
    type: "music",
    title: "Now Playing",
    subtitle: "Chill Vibes",
    gradient: "from-spotify/40 via-spotify/15 to-transparent",
    accentColor: "text-spotify",
    image: chillVibesHeader,
  },
];

const continueWatchingItems = [
  { id: "1", title: "Breaking Bad", subtitle: "S5 E14", image: cwBreakingBad, progress: 65, accentColor: "--nipflix" },
  { id: "2", title: "The Office", subtitle: "S3 E12", image: cwTheOffice, progress: 30, accentColor: "--nipflix" },
  { id: "3", title: "Stranger Things", subtitle: "S4 E7", image: cwStrangerThings, progress: 80, accentColor: "--nipflix" },
  { id: "4", title: "Dark", subtitle: "S2 E5", image: cwDark, progress: 45, accentColor: "--nipflix" },
];

const recentGamesItems = [
  { id: "1", title: "Elden Ring", subtitle: "47h played", image: rgEldenRing, accentColor: "--steam" },
  { id: "2", title: "Cyberpunk 2077", subtitle: "23h played", image: rgCyberpunk, accentColor: "--steam" },
  { id: "3", title: "Hades", subtitle: "89h played", image: rgHades, accentColor: "--retro" },
  { id: "4", title: "Hollow Knight", subtitle: "34h played", image: rgHollowKnight, accentColor: "--retro" },
];

const HomeScreen = ({ profile, onLogout }: HomeScreenProps) => {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        {/* Logo - Left Side */}
        <div className="flex items-center">
          <h1 className="text-2xl font-light tracking-[0.35em] text-gradient animate-breathe text-shadow-lg">
            hafo
          </h1>
        </div>
        
        {/* Right Side - Status + Time/Date + Profile */}
        <div className="flex items-center gap-5">
          {/* Status Indicators */}
          <div className="flex items-center gap-3 text-foreground/40">
            <Wifi className="w-4 h-4" strokeWidth={1.5} />
            <Settings className="w-4 h-4 hover:text-foreground/60 cursor-pointer transition-colors" strokeWidth={1.5} />
          </div>

          {/* Subtle Divider */}
          <div className="h-5 w-px bg-border/30 hidden sm:block" />

          {/* Discrete Time/Date Display */}
          <div className="text-right hidden sm:block">
            <div className="text-lg font-normal tracking-wide text-foreground/70 tabular-nums">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs font-normal text-foreground/40 tracking-wider">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 px-4 py-2.5 rounded-full glass-premium hover:bg-secondary/60 transition-all duration-300 group hover:ring-2 hover:ring-foreground/10 focus:outline-none"
              >
                {/* Avatar Circle */}
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white/90 shadow-lg"
                  style={{ backgroundColor: profile.avatar }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground/80 group-hover:text-foreground transition-colors font-normal">
                  {profile.name}
                </span>
                <ChevronDown className="w-4 h-4 text-foreground/40 group-hover:text-foreground/60 transition-colors" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-border/50">
              <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer gap-2">
                <Settings className="w-4 h-4" strokeWidth={1.5} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Users className="w-4 h-4" strokeWidth={1.5} />
                <span>Switch Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Header Separator */}
      <div className="header-separator mx-8 md:mx-16" />

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
          <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-widest mb-4 animate-fade-in-scale" style={{ animationDelay: "0.3s" }}>
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
        <div className="flex items-center justify-between text-xs text-foreground/30">
          <span className="font-normal tracking-wider">hafo media hub</span>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="font-normal">v1.0</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default HomeScreen;