import { useNavigate } from "react-router-dom";
import retroButtonImage from "@/assets/retro_button.png";
import steamButtonImage from "@/assets/steam_button.png";

const GamesContent = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Gaming</h1>

      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {/* Retro Games Button */}
        <button
          onClick={() => navigate("/retro")}
          className="group rounded-2xl overflow-hidden border border-border/30 hover:border-retro/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--retro)/0.3)] focus:outline-none focus:ring-2 focus:ring-retro/50"
        >
          <img src={retroButtonImage} alt="Retro Games" className="w-full h-auto" />
        </button>

        {/* Steam Link Button */}
        <button
          onClick={() => navigate("/steam")}
          className="group rounded-2xl overflow-hidden border border-border/30 hover:border-steam/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--steam)/0.3)] focus:outline-none focus:ring-2 focus:ring-steam/50"
        >
          <img src={steamButtonImage} alt="Steam Link" className="w-full h-auto" />
        </button>
      </div>
    </div>
  );
};

export default GamesContent;
