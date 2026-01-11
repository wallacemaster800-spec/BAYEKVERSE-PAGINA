import { motion } from 'framer-motion';

interface EightBallLogoProps {
  className?: string;
  animate?: boolean;
}

export function EightBallLogo({ className = "w-10 h-10", animate = true }: EightBallLogoProps) {
  const Logo = (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="black" stroke="hsl(var(--border))" strokeWidth="2" />
      <circle cx="50" cy="30" r="20" fill="white" opacity="0.1" />
      <circle cx="50" cy="50" r="22" fill="white" />
      <text x="50" y="58" fontSize="24" fontFamily="Arial" fontWeight="900" textAnchor="middle" fill="black">8</text>
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        {Logo}
      </motion.div>
    );
  }

  return Logo;
}
