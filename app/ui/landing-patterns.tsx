'use client';

import React from 'react';

// Authentic Arewa Knot Symbol
export function ArewaSymbol({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="22" y="22" width="56" height="56" rx="16" stroke="currentColor" strokeWidth="6" />
      <rect x="22" y="22" width="56" height="56" rx="16" stroke="currentColor" strokeWidth="6" transform="rotate(45 50 50)" />
      <polygon points="50,25 75,50 50,75 25,50" fill="currentColor" />
      <circle cx="50" cy="50" r="8" fill="#FDFBF7" />
    </svg>
  );
}

// Cowrie-like symbol (Image 4 inspired)
export function CowrieSymbol({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="50" cy="50" rx="35" ry="45" fill="currentColor" />
      <path d="M50 15 Q40 50 50 85 Q60 50 50 15 Z" fill="#FDFBF7" />
      <path d="M35 40 L25 50 L35 60 M65 40 L75 50 L65 60" stroke="#FDFBF7" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 30 L30 40 M60 30 L70 40 M40 70 L30 60 M60 70 L70 60" stroke="#FDFBF7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 1. Mudcloth Diamond
export function MudclothDiamond({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="10" fill="currentColor" />
    </svg>
  );
}

// 2. Mudcloth Crosses
export function MudclothCross({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M10 10 L45 45 M45 10 L10 45" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M55 55 L90 90 M90 55 L55 90" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M10 90 L45 55 M10 55 L45 90" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M90 10 L55 45 M90 45 L55 10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

// 3. Mudcloth ZigZag
export function MudclothZigZag({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M10 30 L30 50 L50 30 L70 50 L90 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 60 L30 80 L50 60 L70 80 L90 60" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 4. Mudcloth Arrows
export function MudclothArrows({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M20 20 L50 50 L80 20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 50 L50 80 L80 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 5. Mudcloth Hourglass
export function MudclothHourglass({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M20 20 L80 20 L50 50 L80 80 L20 80 L50 50 Z" fill="currentColor" />
    </svg>
  );
}

// 6. Mudcloth Concentric Squares
export function MudclothSquares({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="6" />
      <rect x="30" y="30" width="40" height="40" stroke="currentColor" strokeWidth="6" />
      <rect x="45" y="45" width="10" height="10" fill="currentColor" />
    </svg>
  );
}

// 7. Mudcloth Sun/Star
export function MudclothStar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 10 L50 90 M10 50 L90 50 M20 20 L80 80 M20 80 L80 20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <circle cx="50" cy="50" r="15" fill="#FDFBF7" stroke="currentColor" strokeWidth="8" />
    </svg>
  );
}

// 8. Mudcloth Parallel Lines
export function MudclothLines({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <line x1="20" y1="10" x2="20" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="40" y1="10" x2="40" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="60" y1="10" x2="60" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="80" y1="10" x2="80" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

// 9. Mudcloth Triangles
export function MudclothTriangles({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <polygon points="10,90 50,20 90,90" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <polygon points="30,90 50,55 70,90" fill="currentColor" />
    </svg>
  );
}

// 10. Mudcloth Checkerboard
export function MudclothChecker({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <rect x="10" y="10" width="40" height="40" fill="currentColor" />
      <rect x="50" y="50" width="40" height="40" fill="currentColor" />
      <rect x="50" y="10" width="40" height="40" stroke="currentColor" strokeWidth="4" />
      <rect x="10" y="50" width="40" height="40" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

// 11. Mudcloth Wavy Dots
export function MudclothDots({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="20" cy="20" r="6" fill="currentColor" />
      <circle cx="50" cy="20" r="6" fill="currentColor" />
      <circle cx="80" cy="20" r="6" fill="currentColor" />
      <circle cx="35" cy="50" r="6" fill="currentColor" />
      <circle cx="65" cy="50" r="6" fill="currentColor" />
      <circle cx="20" cy="80" r="6" fill="currentColor" />
      <circle cx="50" cy="80" r="6" fill="currentColor" />
      <circle cx="80" cy="80" r="6" fill="currentColor" />
    </svg>
  );
}

// 12. Mudcloth Compound Grid
export function MudclothCompound({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M10 10 L90 10 L90 90 L10 90 Z" stroke="currentColor" strokeWidth="4" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="4" />
      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" />
      <circle cx="30" cy="30" r="8" fill="currentColor" />
      <circle cx="70" cy="70" r="8" fill="currentColor" />
      <path d="M60 20 L80 40 M80 20 L60 40" stroke="currentColor" strokeWidth="4" />
      <path d="M20 60 L40 80 M40 60 L20 80" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

// ==========================================
// Hausa Mythical Roots Patterns
// ==========================================

// Dagin Arewa (Hausa Star of Destiny)
export function HausaStar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <polygon points="50,10 90,75 10,75" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <polygon points="50,90 90,25 10,25" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// Tambari (Hausa Royal Drum)
export function Tambari({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M20 20 L80 20 L60 50 L80 80 L20 80 L40 50 Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <line x1="20" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="4" />
      <line x1="20" y1="70" x2="80" y2="70" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}

// ==========================================
// Comprehensive Numbered Tribal Patterns (1-40)
// Generates 40 distinct variations based on the index
// ==========================================
export function NumberedTribalPattern({ index, className = '' }: { index: number, className?: string }) {
  // Use index to deterministically pick shapes and modifiers
  const shapeType = index % 5;
  const modifier = Math.floor((index - 1) / 5) % 8;

  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      {shapeType === 0 && (
        <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 50 L30 20 L50 50 L70 20 L90 50" strokeDasharray={modifier % 2 === 0 ? 'none' : '10 10'} />
          <path d="M10 80 L30 50 L50 80 L70 50 L90 80" strokeDasharray={modifier > 3 ? 'none' : '10 10'} />
        </g>
      )}
      {shapeType === 1 && (
        <g stroke="currentColor" strokeWidth="6">
          <rect x="20" y="20" width="60" height="60" fill={modifier % 2 === 0 ? 'currentColor' : 'none'} opacity={modifier % 2 === 0 ? 0.3 : 1} />
          {modifier > 3 && <circle cx="50" cy="50" r="10" fill="currentColor" />}
        </g>
      )}
      {shapeType === 2 && (
        <g stroke="currentColor" strokeWidth="6">
          <circle cx="50" cy="50" r={30 + (modifier * 2)} strokeDasharray={modifier % 2 === 0 ? 'none' : '5 5'} />
          {modifier > 2 && <circle cx="50" cy="50" r="15" fill="currentColor" />}
        </g>
      )}
      {shapeType === 3 && (
        <g stroke="currentColor" strokeWidth="6">
          <path d={`M10 10 L90 90 M10 90 L90 10`} strokeDasharray={modifier % 2 === 0 ? 'none' : '15 15'} />
          {modifier > 4 && <rect x="35" y="35" width="30" height="30" fill="currentColor" />}
        </g>
      )}
      {shapeType === 4 && (
        <g stroke="currentColor" strokeWidth="6">
          <polygon points="50,10 90,90 10,90" fill={modifier % 2 === 0 ? 'none' : 'currentColor'} opacity={modifier % 2 === 0 ? 1 : 0.4} />
          {modifier > 3 && <polygon points="50,30 70,70 30,70" fill="currentColor" />}
        </g>
      )}
      
      {/* Decorative dots based on modifier */}
      {modifier % 3 === 0 && <circle cx="15" cy="15" r="4" fill="currentColor" />}
      {modifier % 3 === 0 && <circle cx="85" cy="85" r="4" fill="currentColor" />}
      {modifier % 4 === 0 && <circle cx="85" cy="15" r="4" fill="currentColor" />}
      {modifier % 4 === 0 && <circle cx="15" cy="85" r="4" fill="currentColor" />}
    </svg>
  );
}

// Background pattern for hero
export function MudclothPattern({ className = '', opacity = 0.3 }: { className?: string, opacity?: number }) {
  // Generate unique ID for pattern to avoid duplicates
  const patternId = React.useId();
  
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }}>
      <svg className={`w-full h-full text-slate-300`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M0,20 L20,0 L40,20 L60,0 L80,20 M0,60 L20,40 L40,60 L60,40 L80,60" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="5" fill="currentColor" />
            <circle cx="60" cy="20" r="5" fill="currentColor" />
            <circle cx="40" cy="40" r="5" fill="currentColor" />
            <circle cx="20" cy="60" r="5" fill="currentColor" />
            <circle cx="60" cy="60" r="5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

// Vertical Tribal Band
export function TribalBand({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
      <path d="M10 0 L10 200 M30 0 L30 200" stroke="currentColor" strokeWidth="2" />
      <path d="M20 10 L10 20 L20 30 L30 20 Z" fill="currentColor" />
      <path d="M20 50 L10 60 L20 70 L30 60 Z" fill="currentColor" />
      <path d="M20 90 L10 100 L20 110 L30 100 Z" fill="currentColor" />
      <path d="M20 130 L10 140 L20 150 L30 140 Z" fill="currentColor" />
      <path d="M20 170 L10 180 L20 190 L30 180 Z" fill="currentColor" />
    </svg>
  );
}
