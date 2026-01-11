import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const [glitchText, setGlitchText] = useState("404");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Glitch effect interval
    const interval = setInterval(() => {
      const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const randomGlitch = Array.from({ length: 3 }, () => 
        Math.random() > 0.7 
          ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
          : "404"[Math.floor(Math.random() * 3)]
      ).join("");
      setGlitchText(Math.random() > 0.3 ? "404" : randomGlitch);
    }, 100);

    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Static noise overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scan lines */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Glitch bars */}
      <motion.div 
        className="absolute left-0 right-0 h-2 bg-destructive/30"
        animate={{ 
          y: [0, 200, -100, 400, 0],
          opacity: [0, 1, 1, 0, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          repeatDelay: 2
        }}
      />

      <div className="relative z-10 text-center px-4">
        {/* Glitched 404 */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-[150px] md:text-[200px] font-bold leading-none tracking-tighter select-none"
            style={{
              textShadow: `
                2px 0 #ff0040,
                -2px 0 #00ff40,
                0 0 20px rgba(255,255,255,0.3)
              `,
            }}
          >
            {glitchText}
          </h1>
          
          {/* Glitch layers */}
          <span 
            className="absolute inset-0 text-[150px] md:text-[200px] font-bold leading-none tracking-tighter opacity-70"
            style={{
              clipPath: 'polygon(0 45%, 100% 45%, 100% 55%, 0 55%)',
              transform: 'translateX(-4px)',
              color: '#ff0040',
            }}
          >
            404
          </span>
          <span 
            className="absolute inset-0 text-[150px] md:text-[200px] font-bold leading-none tracking-tighter opacity-70"
            style={{
              clipPath: 'polygon(0 65%, 100% 65%, 100% 75%, 0 75%)',
              transform: 'translateX(4px)',
              color: '#00ff40',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            SEÑAL PERDIDA
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            La transmisión ha sido interrumpida. La ruta que buscas no existe 
            en el universo Bayekverse.
          </p>
          <code className="block text-xs text-destructive/70 font-mono">
            ERROR: {location.pathname} not found in broadcast signal
          </code>
        </motion.div>

        {/* Return button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors glow-red"
          >
            <span className="relative">
              <span className="animate-pulse">◉</span>
            </span>
            Reconectar al Home
          </Link>
        </motion.div>

        {/* VCR timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 font-mono text-xs text-muted-foreground/50"
        >
          ▶ REC {new Date().toLocaleTimeString()} | NO SIGNAL | CH-404
        </motion.div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-xs font-mono text-muted-foreground/30">
        ┌ BAYEKVERSE BROADCAST SYSTEM
      </div>
      <div className="absolute bottom-4 right-4 text-xs font-mono text-muted-foreground/30">
        TRANSMISSION ERROR ┘
      </div>
    </div>
  );
};

export default NotFound;
