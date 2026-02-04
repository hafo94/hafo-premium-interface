import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import retroButtonImage from "@/assets/retro_button.png";
import steamButtonImage from "@/assets/steam_button.png";
import { useFocus } from "@/contexts/FocusContext";
import { cn } from "@/lib/utils";

const GamesContent = () => {
  const navigate = useNavigate();
  const { activeZone, contentIndex, setContentIndex, focusHeader, setActiveZone } = useFocus();
  
  const isContentFocused = activeZone === "content";
  const focusedButtonIndex = contentIndex.row;

  // Set initial focus to first button
  useEffect(() => {
    if (isContentFocused && focusedButtonIndex < 0) {
      setContentIndex({ row: 0, col: 0 });
    }
  }, [isContentFocused, focusedButtonIndex, setContentIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if not content focused or in input
      if (!isContentFocused) return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Skip alt key combos (used by header for mode switching)
      if (e.altKey) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (focusedButtonIndex === 0) {
            // At top, go to header
            focusHeader();
          } else {
            setContentIndex({ row: 0, col: 0 });
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (focusedButtonIndex < 1) {
            setContentIndex({ row: 1, col: 0 });
          }
          break;
        case "Enter":
          e.preventDefault();
          if (focusedButtonIndex === 0) {
            navigate("/retro");
          } else if (focusedButtonIndex === 1) {
            navigate("/steam");
          }
          break;
      }
    },
    [isContentFocused, focusedButtonIndex, navigate, focusHeader, setContentIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const buttons = [
    { 
      id: "retro", 
      image: retroButtonImage, 
      alt: "Retro Games", 
      path: "/retro",
      color: "retro"
    },
    { 
      id: "steam", 
      image: steamButtonImage, 
      alt: "Steam Link", 
      path: "/steam",
      color: "steam"
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Gaming</h1>

      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {buttons.map((button, index) => {
          const isFocused = isContentFocused && focusedButtonIndex === index;
          
          return (
            <button
              key={button.id}
              onClick={() => {
                setActiveZone("content");
                setContentIndex({ row: index, col: 0 });
                navigate(button.path);
              }}
              onMouseEnter={() => {
                if (isContentFocused) {
                  setContentIndex({ row: index, col: 0 });
                }
              }}
              className={cn(
                "group rounded-2xl overflow-hidden border transition-all duration-300",
                "focus:outline-none",
                isFocused
                  ? `border-${button.color}/70 scale-[1.02] shadow-[0_0_50px_hsl(var(--${button.color})/0.4)] ring-2 ring-${button.color}/50`
                  : `border-border/30 hover:border-${button.color}/50 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--${button.color})/0.3)]`
              )}
            >
              <img src={button.image} alt={button.alt} className="w-full h-auto" />
            </button>
          );
        })}
      </div>

      {/* Keyboard hint */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground/50">
          ↑↓ Navigate • Enter Select
        </p>
      </div>
    </div>
  );
};

export default GamesContent;
