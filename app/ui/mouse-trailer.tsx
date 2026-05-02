'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { MudclothStar } from '@/app/ui/landing-patterns';

export function MouseTrailer() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Use framer-motion springs for that smooth, delayed "trailing" effect
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only show on devices with a fine pointer (mouse), not touch screens
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const targetX = e.clientX - 16;
      const targetY = e.clientY - 16;

      // Prevent the cursor from flying in from 0,0 on the first move
      if (!hasMoved) {
        springX.jump(targetX);
        springY.jump(targetY);
        setHasMoved(true);
      }

      mouseX.set(targetX);
      mouseY.set(targetY);
      
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible, hasMoved, springX, springY]);

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        opacity: isVisible && hasMoved ? 1 : 0,
      }}
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden lg:block transition-opacity duration-300"
    >
      {/* Removed mix-blend-screen so it's visible on the light hero section */}
      <div className="relative flex items-center justify-center w-7 h-7 opacity-90 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-spin-slow">
        <MudclothStar className="w-full h-full" />
      </div>
    </motion.div>
  );
}
