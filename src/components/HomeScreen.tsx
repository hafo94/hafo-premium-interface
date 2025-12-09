import { useState, useEffect } from "react";
import { Film, Tv, Gamepad2, Monitor, Music, Youtube, LogOut, Play, Clock, LucideIcon } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface HomeScreenProps {
  profile: Profile;
  onLogout: () => void;
}

interface AppTile {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  glowClass: string;
  bgGradient: string;
}

interface FeaturedContent {
  type: "game" | "series" | "music";
  title: string;
  subtitle: string;
  gradient: string;
  accentColor: string;
}

const apps: AppTile[] = [
  {
    id: "nipflix",
    name: "Nipflix",
    icon: Film,
    color: "text-nipflix",
    glowClass: "glow-nipflix",
    bgGradient: "from-nipflix/20 to-nipflix/5",
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
    subtitle: "Breaking Bad • S5 E14",
    gradient: "from-nipflix/30 via-nipflix/10 to-transparent",
    accentColor: "text-nipflix",
  },
  {
    type: "game",
    title: "Last Played",
    subtitle: "Elden Ring • 47h played",
    gradient: "from-steam/30 via-steam/10 to-transparent",
    accentColor: "text-steam",
  },
  {
    type: "music",
    title: "Recently Played",
    subtitle: "Chill Vibes Playlist",
    gradient: "from-spotify/30 via-spotify/10 to-transparent",
    accentColor: "text-spotify",
  },
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

  return (
    <div
      className={`min-h-screen flex flex-col transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background ambient glow */}
      <div className={`fixed inset-0 bg-gradient-to-br ${featured.gradient} opacity-40 transition-all duration-1000 pointer-events-none`} />
      
      {/* Header */}
      <header className="relative flex items-center justify-between px-8 md:px-16 py-6 animate-fade-in-scale">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-extralight tracking-[0.2em] text-gradient">hafo</h1>
        </div>
        
        {/* Time Display */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <div className="text-4xl md:text-5xl font-extralight tracking-wider text-foreground">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm font-light text-muted-foreground tracking-wide mt-1">
            {formatDate(currentTime)}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-full glass hover:bg-secondary/80 transition-all duration-200 group"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors font-light">
            {profile.name}
          </span>
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
        </button>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col px-8 md:px-16 pb-8">
        {/* Featured Content Hero */}
        <div className="mb-8 md:mb-12 animate-fade-in-scale" style={{ animationDelay: "0.1s" }}>
          <div 
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${featured.gradient} border border-border/30 p-8 md:p-12 transition-all duration-700`}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
              <div className={`absolute inset-0 bg-gradient-to-l ${featured.gradient}`} />
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  <span className={`text-sm font-medium uppercase tracking-wider ${featured.accentColor}`}>
                    {featured.title}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-light text-foreground tracking-wide">
                  {featured.subtitle}
                </h2>
                <div className="flex gap-3 pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all duration-200">
                    <Play className="w-4 h-4" fill="currentColor" />
                    Resume
                  </button>
                  <button className="px-6 py-3 rounded-full glass hover:bg-secondary transition-all duration-200 font-light">
                    Details
                  </button>
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="hidden md:flex items-center gap-2">
                {featuredContent.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeaturedIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === featuredIndex ? "w-8 bg-foreground" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Apps Section */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6 animate-fade-in-scale" style={{ animationDelay: "0.2s" }}>
            Your Apps
          </h3>
          
          {/* Apps Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {apps.map((app, index) => (
              <button
                key={app.id}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                className="group animate-slide-up"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div
                  className={`relative aspect-square rounded-2xl md:rounded-3xl bg-gradient-to-br ${app.bgGradient} 
                    border border-border/40 flex flex-col items-center justify-center gap-2 md:gap-4
                    transition-all duration-500 ease-out
                    ${hoveredApp === app.id ? `scale-110 ${app.glowClass} border-border` : ""}
                    ${hoveredApp && hoveredApp !== app.id ? "opacity-40 scale-95" : ""}
                  `}
                >
                  {/* Background glow effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br ${app.bgGradient} blur-2xl 
                      transition-opacity duration-500 ${hoveredApp === app.id ? "opacity-60" : "opacity-0"}`}
                  />
                  
                  <app.icon
                    className={`relative w-8 h-8 md:w-12 md:h-12 ${app.color} transition-all duration-300
                      ${hoveredApp === app.id ? "scale-110" : ""}`}
                    strokeWidth={1.2}
                  />
                  <span
                    className={`relative text-xs md:text-sm font-light tracking-wide transition-colors duration-300
                      ${hoveredApp === app.id ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {app.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative px-8 md:px-16 py-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground/50">
          <span className="font-light tracking-wider">hafo media hub</span>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="font-light">v1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
