import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  accentColor?: string;
}

const AnimatedBackground = ({ accentColor }: AnimatedBackgroundProps) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient - brighter */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
      
      {/* Ambient light at top */}
      <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-muted/30 to-transparent" />
      
      {/* Animated mesh gradient - more visible */}
      <div 
        className="absolute inset-0 opacity-50 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at ${mousePos.x}% ${mousePos.y}%, 
              hsl(var(${accentColor || "--muted"}) / 0.25) 0%, 
              transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 80%, 
              hsl(var(--steam) / 0.12) 0%, 
              transparent 50%),
            radial-gradient(ellipse 50% 60% at 80% 20%, 
              hsl(var(--tv) / 0.10) 0%, 
              transparent 50%)
          `,
        }}
      />
      
      {/* Floating orbs - increased opacity */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial from-nipflix/12 to-transparent blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-spotify/10 to-transparent blur-3xl animate-float-slower" />
      <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-radial from-tv/10 to-transparent blur-3xl animate-float-medium" />
      
      {/* Subtle ambient color shift */}
      <div className="absolute inset-0 animate-pulse-slow opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, hsl(var(${accentColor || "--muted"}) / 0.15) 0%, transparent 60%)`,
        }}
      />
      
      {/* Noise texture overlay - increased opacity */}
      <div className="absolute inset-0 opacity-[0.035] bg-noise" />
      
      {/* Scanline effect for TV aesthetic */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.02] pointer-events-none">
        <div className="absolute inset-x-0 h-[2px] bg-foreground/50 animate-scanline" />
      </div>
      
      {/* Vignette effect - reduced intensity */}
      <div className="absolute inset-0 bg-radial-vignette" />
      
      {/* Shimmer sweep effect */}
      <div className="absolute inset-0 animate-shimmer-sweep opacity-[0.04]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent -skew-x-12" />
      </div>
      
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </div>
  );
};

export default AnimatedBackground;