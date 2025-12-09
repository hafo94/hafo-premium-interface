import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface AppTileProps {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  glowClass: string;
  bgGradient: string;
  isHovered: boolean;
  isOtherHovered: boolean;
  onHover: (id: string | null) => void;
  previewImage?: string;
  badge?: string;
  index: number;
}

const AppTile = ({
  id,
  name,
  icon: Icon,
  color,
  glowClass,
  bgGradient,
  isHovered,
  isOtherHovered,
  onHover,
  previewImage,
  badge,
  index,
}: AppTileProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className="group animate-slide-up focus:outline-none"
      style={{ animationDelay: `${0.4 + index * 0.05}s` }}
    >
      <div
        className={`relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden
          flex flex-col items-center justify-center gap-2 md:gap-4
          transition-all duration-500 ease-out tile-premium
          ${isHovered ? `scale-110 ${glowClass}` : ""}
          ${isOtherHovered ? "opacity-40 scale-95" : ""}
          ${isPressed ? "scale-105" : ""}
        `}
        style={{
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-60'}`} />
        
        {/* Top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        
        {/* Inner glow at top */}
        <div className={`absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-50'}`} />
        
        {/* Preview image (shows on hover for supported apps) */}
        {previewImage && (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isHovered ? "opacity-30" : "opacity-0"
            }`}
          >
            <img src={previewImage} alt="" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />
          </div>
        )}
        
        {/* Animated background glow */}
        <div
          className={`absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br ${bgGradient} blur-2xl 
            transition-all duration-500 ${isHovered ? "opacity-70 scale-150" : "opacity-0 scale-100"}`}
        />
        
        {/* Focus ring animation */}
        <div
          className={`absolute inset-0 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 ${
            isHovered ? "border-foreground/30 scale-105" : "border-transparent scale-100"
          }`}
        />
        
        {/* Badge */}
        {badge && (
          <div className="absolute top-2 right-2 z-20">
            <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-foreground text-background shadow-lg">
              {badge}
            </div>
          </div>
        )}
        
        {/* Icon */}
        <div className={`relative transition-all duration-300 ${isHovered ? "scale-110 -translate-y-1" : ""}`}>
          <Icon
            className={`w-8 h-8 md:w-12 md:h-12 ${color} transition-all duration-300
              ${isHovered ? "drop-shadow-lg" : ""}`}
            strokeWidth={1.2}
          />
          {/* Icon glow */}
          <div
            className={`absolute inset-0 blur-xl transition-opacity duration-500 ${
              isHovered ? "opacity-70" : "opacity-0"
            }`}
          >
            <Icon className={`w-8 h-8 md:w-12 md:h-12 ${color}`} strokeWidth={1.2} />
          </div>
        </div>
        
        {/* Name */}
        <span
          className={`relative text-xs md:text-sm font-normal tracking-wide transition-all duration-300
            ${isHovered ? "text-foreground translate-y-0.5" : "text-foreground/70"}`}
        >
          {name}
        </span>
        
        {/* Shimmer effect on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-foreground/8 to-transparent 
            -translate-x-full transition-transform duration-700 ${isHovered ? "translate-x-full" : ""}`}
        />
      </div>
    </button>
  );
};

export default AppTile;