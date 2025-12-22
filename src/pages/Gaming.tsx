import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import retroButtonImage from "@/assets/retro_button.png";
import steamButtonImage from "@/assets/steam_button.png";

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

        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {/* Retro Games Button */}
          <button
            onClick={() => navigate("/retro")}
            className="group rounded-2xl overflow-hidden border border-border/30 hover:border-retro/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--retro)/0.3)] focus:outline-none focus:ring-2 focus:ring-retro/50"
          >
            <img 
              src={retroButtonImage} 
              alt="Retro Games" 
              className="w-full h-auto"
            />
          </button>

          {/* Steam Link Button */}
          <button
            onClick={() => navigate("/steam")}
            className="group rounded-2xl overflow-hidden border border-border/30 hover:border-steam/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--steam)/0.3)] focus:outline-none focus:ring-2 focus:ring-steam/50"
          >
            <img 
              src={steamButtonImage} 
              alt="Steam Link" 
              className="w-full h-auto"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gaming;
