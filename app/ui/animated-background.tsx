'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArewaSymbol, 
  CowrieSymbol, 
  MudclothDiamond,
  MudclothCross,
  MudclothZigZag,
  MudclothArrows,
  MudclothHourglass,
  MudclothSquares,
  MudclothStar,
  MudclothLines,
  MudclothTriangles,
  MudclothChecker,
  MudclothDots,
  MudclothCompound,
  HausaStar,
  Tambari,
  NumberedTribalPattern
} from './landing-patterns';

// Generate wrappers for all 40 numbered tribal patterns
const NUMBERED_PATTERNS = Array.from({ length: 40 }).map((_, i) => {
  const PatternWrapper = ({ className }: { className?: string }) => (
    <NumberedTribalPattern index={i + 1} className={className} />
  );
  // Assign a display name for React DevTools
  PatternWrapper.displayName = `NumberedTribalPattern${i + 1}`;
  return PatternWrapper;
});

const PATTERNS = [
  ArewaSymbol,
  HausaStar,
  Tambari,
  CowrieSymbol,
  MudclothDiamond,
  MudclothCross,
  MudclothZigZag,
  MudclothArrows,
  MudclothHourglass,
  MudclothSquares,
  MudclothStar,
  MudclothLines,
  MudclothTriangles,
  MudclothChecker,
  MudclothDots,
  MudclothCompound,
  ...NUMBERED_PATTERNS
];

export function AnimatedBackground() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % PATTERNS.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {PATTERNS.map((Pattern, index) => {
        const isActive = index === activeIndex;
        // Using ease-in-out and a slow duration for a soft, premium transition
        return (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Multiple clones of the same pattern spread across the background, scaled down */}
            <div className="absolute top-[5%] left-[5%] opacity-10">
               <Pattern className="w-16 h-16 md:w-24 md:h-24 text-emerald-600" />
            </div>
            <div className="absolute top-[15%] right-[10%] opacity-10">
               <Pattern className="w-12 h-12 md:w-20 md:h-20 text-emerald-600" />
            </div>
            <div className="absolute top-[40%] left-[20%] opacity-5 md:opacity-10">
               <Pattern className="w-20 h-20 md:w-32 md:h-32 text-emerald-600" />
            </div>
            <div className="absolute top-[60%] right-[5%] opacity-[0.07]">
               <Pattern className="w-24 h-24 md:w-36 md:h-36 text-emerald-600" />
            </div>
            <div className="absolute bottom-[10%] left-[10%] opacity-10">
               <Pattern className="w-16 h-16 md:w-28 md:h-28 text-emerald-600" />
            </div>
            <div className="absolute bottom-[20%] right-[25%] opacity-5 md:opacity-10">
               <Pattern className="w-12 h-12 md:w-16 md:h-16 text-emerald-600" />
            </div>
            <div className="absolute top-[30%] right-[30%] opacity-[0.05]">
               <Pattern className="w-10 h-10 md:w-20 md:h-20 text-emerald-600" />
            </div>
            <div className="absolute bottom-[5%] right-[40%] opacity-[0.06]">
               <Pattern className="w-14 h-14 md:w-24 md:h-24 text-emerald-600" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
