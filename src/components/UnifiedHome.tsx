import { useState, useCallback } from "react";
import AnimatedBackground from "./AnimatedBackground";
import ModeHeader, { AppMode } from "./ModeHeader";
import ModeSidebar from "./ModeSidebar";
import MoviesContent from "./content/MoviesContent";
import SeriesContent from "./content/SeriesContent";
import TVContent from "./content/TVContent";
import GamesContent from "./content/GamesContent";
import { FocusProvider, useFocus } from "@/contexts/FocusContext";

const modeAccentColors: Record<AppMode, string> = {
  movies: "--nipflix",
  series: "--nipflix",
  tv: "--tv",
  games: "--retro",
};

// Inner component that can access focus context
const UnifiedHomeContent = ({ 
  mode, 
  activeNavItem, 
  hasSidebar,
  accentColor,
  onModeChange,
  onNavItemSelect
}: {
  mode: AppMode;
  activeNavItem: string;
  hasSidebar: boolean;
  accentColor: string;
  onModeChange: (mode: AppMode) => void;
  onNavItemSelect: (itemId: string) => void;
}) => {
  const { isSidebarExpanded } = useFocus();
  
  // Content padding based on sidebar expansion state
  const contentPadding = hasSidebar 
    ? (isSidebarExpanded ? "pl-52" : "pl-16") 
    : "";

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground accentColor={accentColor} />

      {/* Header */}
      <ModeHeader activeMode={mode} onModeChange={onModeChange} />

      {/* Sidebar */}
      {hasSidebar && (
        <ModeSidebar
          mode={mode}
          activeItem={activeNavItem}
          onItemSelect={onNavItemSelect}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`relative z-10 transition-all duration-300 ${contentPadding}`}
      >
        {mode === "movies" && (
          <MoviesContent activeSection={activeNavItem} />
        )}
        {mode === "series" && (
          <SeriesContent activeSection={activeNavItem} />
        )}
        {mode === "tv" && (
          <TVContent activeSection={activeNavItem} />
        )}
        {mode === "games" && <GamesContent />}
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 px-6 py-4 transition-all duration-300 ${contentPadding}`}
      >
        <div className="flex items-center justify-between text-xs text-foreground/30">
          <span className="font-normal tracking-wider">hafo media hub</span>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="font-normal">v1.0</span>
        </div>
      </footer>
    </div>
  );
};

const UnifiedHome = () => {
  const [mode, setMode] = useState<AppMode>("movies");
  const [activeNavItem, setActiveNavItem] = useState("home");

  // Get accent color based on mode
  const accentColor = modeAccentColors[mode];

  // Handle mode change
  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
    setActiveNavItem("home"); // Reset to home when switching modes
  }, []);

  // Handle sidebar item selection
  const handleNavItemSelect = useCallback((itemId: string) => {
    setActiveNavItem(itemId);
  }, []);

  // Determine if sidebar should be visible
  const hasSidebar = mode !== "games";

  return (
    <FocusProvider mode={mode} hasSidebar={hasSidebar}>
      <UnifiedHomeContent
        mode={mode}
        activeNavItem={activeNavItem}
        hasSidebar={hasSidebar}
        accentColor={accentColor}
        onModeChange={handleModeChange}
        onNavItemSelect={handleNavItemSelect}
      />
    </FocusProvider>
  );
};

export default UnifiedHome;
