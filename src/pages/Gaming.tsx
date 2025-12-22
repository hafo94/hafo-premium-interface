import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import steamLinkImage from "@/assets/steam_link.png";
import retroGamesImage from "@/assets/retro_games.png";

const Gaming = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground accentColor="hsl(var(--retro))" />
      
      <div className="relative z-10 p-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-4xl font-bold mb-12 text-center">Gaming</h1>

        <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto justify-center items-stretch">
          {/* Retro Games Button */}
          <button
            onClick={() => navigate("/retro")}
            className="group relative flex-1 min-h-[200px] md:min-h-[300px] rounded-2xl overflow-hidden border border-border/30 hover:border-retro/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--retro)/0.3)]"
          >
            <img 
              src={retroGamesImage} 
              alt="Retro Games" 
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-6 left-6 text-left">
              <h2 className="text-2xl font-bold text-foreground">Retro Games</h2>
              <p className="text-foreground/60 text-sm mt-1">Classic gaming nostalgia</p>
            </div>
          </button>

          {/* Steam Link Button */}
          <button
            onClick={() => navigate("/steam")}
            className="group relative flex-1 min-h-[200px] md:min-h-[300px] rounded-2xl overflow-hidden border border-border/30 hover:border-steam/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--steam)/0.3)] bg-foreground/5"
          >
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <img 
                src={steamLinkImage} 
                alt="Steam Link" 
                className="max-w-[80%] max-h-[60%] object-contain opacity-80 group-hover:opacity-100 transition-opacity invert"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-6 left-6 text-left">
              <h2 className="text-2xl font-bold text-foreground">Steam Link</h2>
              <p className="text-foreground/60 text-sm mt-1">Stream PC games</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gaming;
