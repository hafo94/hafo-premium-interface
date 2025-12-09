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
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      
      {/* Animated mesh gradient */}
      <div 
        className="absolute inset-0 opacity-30 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at ${mousePos.x}% ${mousePos.y}%, 
              hsl(var(${accentColor || "--muted"}) / 0.15) 0%, 
              transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 80%, 
              hsl(var(--steam) / 0.08) 0%, 
              transparent 50%),
            radial-gradient(ellipse 50% 60% at 80% 20%, 
              hsl(var(--tv) / 0.06) 0%, 
              transparent 50%)
          `,
        }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-radial from-nipflix/5 to-transparent blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-radial from-spotify/5 to-transparent blur-3xl animate-float-slower" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-gradient-radial from-tv/5 to-transparent blur-3xl animate-float-medium" />
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-noise" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette" />
      
      {/* Shimmer sweep effect */}
      <div className="absolute inset-0 animate-shimmer-sweep opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent -skew-x-12" />
      </div>
    </div>
  );
};

export default AnimatedBackground;
