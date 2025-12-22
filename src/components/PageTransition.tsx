import { useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    // Initial mount animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-300 ease-out ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-2 scale-[0.99]"
      }`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
