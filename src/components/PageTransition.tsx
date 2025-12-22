import { useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface PageTransitionProps {
  children: ReactNode;
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background p-6 animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-8">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
    
    {/* Hero skeleton */}
    <Skeleton className="h-64 w-full rounded-xl mb-8" />
    
    {/* Content rows skeleton */}
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-48 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-48 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [phase, setPhase] = useState<"loading" | "entering" | "visible">("entering");
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // On route change, show skeleton briefly
    setPhase("loading");
    
    const skeletonTimer = setTimeout(() => {
      setDisplayChildren(children);
      setPhase("entering");
    }, 150);

    const visibleTimer = setTimeout(() => {
      setPhase("visible");
    }, 300);

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(visibleTimer);
    };
  }, [location.pathname]);

  useEffect(() => {
    // Initial mount - skip skeleton
    const timer = setTimeout(() => setPhase("visible"), 100);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "loading") {
    return <LoadingSkeleton />;
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ease-out ${
        phase === "visible" 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-2 scale-[0.99]"
      }`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
