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
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {PATTERNS.map((Pattern, index) => {
        const isActive = index === activeIndex;
        return (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${isActive ? 'opacity-30' : 'opacity-0'}`}
          >
            {/* Super visible organized pattern layout */}
            <div className="absolute top-10 left-10 opacity-0.5">
               <Pattern className="w-10 h-10 md:w-20 md:h-20 text-emerald-600" />
            </div>
            <div className="absolute top-10 right-10 opacity-0.5">
               <Pattern className="w-20 h-20 md:w-32 md:h-32 text-emerald-400" />
            </div>
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 opacity-0.45">
               <Pattern className="w-24 h-24 md:w-36 md:h-36 text-emerald-600" />
            </div>
            <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-0.45">
               <Pattern className="w-24 h-24 md:w-36 md:h-36 text-emerald-500" />
            </div>
            <div className="absolute bottom-10 left-10 opacity-0.5">
               <Pattern className="w-20 h-20 md:w-32 md:h-32 text-emerald-600" />
            </div>
            <div className="absolute bottom-10 right-10 opacity-0.5">
               <Pattern className="w-20 h-20 md:w-32 md:h-32 text-emerald-500" />
            </div>
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 opacity-0.48">
               <Pattern className="w-28 h-28 md:w-40 md:h-40 text-emerald-600" />
            </div>
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 opacity-0.48">
               <Pattern className="w-28 h-28 md:w-40 md:h-40 text-emerald-500" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
