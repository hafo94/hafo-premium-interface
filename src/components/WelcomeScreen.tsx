import { useEffect, useState } from "react";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [phase, setPhase] = useState<"fadeIn" | "visible" | "fadeOut">("fadeIn");

  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setPhase("visible");
    }, 100);

    const visibleTimer = setTimeout(() => {
      setPhase("fadeOut");
    }, 2500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(visibleTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-background z-50 transition-opacity duration-700 ease-out ${
        phase === "fadeIn" ? "opacity-0" : phase === "fadeOut" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-muted-foreground/20 rounded-full animate-pulse-glow" />
          <h1 className="relative text-7xl md:text-8xl font-extralight tracking-[0.3em] text-gradient">
            hafo
          </h1>
        </div>
        
        {/* Subtle loading indicator */}
        <div className="flex gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
              style={{
                animation: "pulse-glow 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
