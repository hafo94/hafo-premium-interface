import { useState } from "react";
import { Film, Tv, Gamepad2, Monitor, Music, LogOut, LucideIcon } from "lucide-react";

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

const HomeScreen = ({ profile, onLogout }: HomeScreenProps) => {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleLogout = () => {
    setIsVisible(false);
    setTimeout(onLogout, 500);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 md:px-16 py-6 animate-fade-in-scale">
        <h1 className="text-2xl font-extralight tracking-[0.2em] text-gradient">hafo</h1>
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
      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-16">
        <div className="w-full max-w-6xl">
          {/* Apps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {apps.map((app, index) => (
              <button
                key={app.id}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div
                  className={`relative aspect-square rounded-3xl bg-gradient-to-br ${app.bgGradient} 
                    border border-border/40 flex flex-col items-center justify-center gap-4
                    transition-all duration-500 ease-out
                    ${hoveredApp === app.id ? `scale-105 ${app.glowClass} border-border` : ""}
                    ${hoveredApp && hoveredApp !== app.id ? "opacity-50 scale-95" : ""}
                  `}
                >
                  {/* Background glow effect */}
                  <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${app.bgGradient} blur-2xl 
                      transition-opacity duration-500 ${hoveredApp === app.id ? "opacity-60" : "opacity-0"}`}
                  />
                  
                  <app.icon
                    className={`relative w-12 h-12 md:w-16 md:h-16 ${app.color} transition-all duration-300
                      ${hoveredApp === app.id ? "scale-110" : ""}`}
                    strokeWidth={1.2}
                  />
                  <span
                    className={`relative text-sm md:text-base font-light tracking-wide transition-colors duration-300
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
      <footer className="px-8 md:px-16 py-6">
        <div className="flex items-center justify-center">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
