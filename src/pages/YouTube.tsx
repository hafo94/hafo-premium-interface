import { ArrowLeft, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";

const YouTubePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground accentColor="--youtube" />
      
      <header className="relative z-10 p-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="text-youtube mb-6">
          <Youtube className="w-20 h-20" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">YouTube</h1>
        <p className="text-foreground/60 text-lg text-center max-w-md">
          Watch your favorite YouTube videos and channels.
        </p>
      </main>
    </div>
  );
};

export default YouTubePage;