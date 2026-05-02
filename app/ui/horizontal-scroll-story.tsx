'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

const storyItems = [
  {
    title: 'Crafts',
    subtitle: 'Share your vibrant creativity.',
    description: 'Turn your local craft shop into a global boutique. Manage inventory effortlessly and let your artistry shine across borders.',
    image: '/images/story/user-image-1.jpg',
  },
  {
    title: 'Fashion',
    subtitle: 'Expand your boutique\'s reach.',
    description: 'Whether you sell from an outdoor market or a high-end studio, Vendle gives your fashion brand a premium digital storefront.',
    image: '/images/story/user-image-2.jpg',
  },
  {
    title: 'Decor',
    subtitle: 'Sell authentic lifestyle goods.',
    description: 'Showcase traditional woven baskets, intricate fans, and beautiful home accessories with immersive product pages.',
    image: '/images/story/user-image-3.jpg',
  },
  {
    title: 'Tech',
    subtitle: 'Power the digital age.',
    description: 'From phone accessories to the latest devices, build a trustworthy electronics store. Process payments securely.',
    image: '/images/story/user-image-4.jpg',
  },
];

export function HorizontalScrollStory() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Map the vertical scroll progress to horizontal translation for the main track
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%']);
  
  // Dynamic background colors transitioning through deep premium tones
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ['#0A1110', '#0f172a', '#1e1b4b', '#022c22']
  );

  // Parallax effect for the massive background typography
  // It moves slightly faster or slower than the main track to create depth
  const textX = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  // Progress bar width
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.section 
      ref={targetRef} 
      style={{ backgroundColor }}
      className="relative h-[400vh]"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* Scroll Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-50">
          <motion.div 
            className="h-full bg-emerald-500 origin-left"
            style={{ scaleX }}
          />
        </div>

        <motion.div style={{ x }} className="flex w-[400vw] h-full items-center">
          {storyItems.map((item, index) => {
            return (
              <div
                key={index}
                className="relative flex h-screen w-screen items-center justify-center p-6 md:p-12 lg:p-24 overflow-hidden"
              >
                {/* Huge Background Text with Parallax */}
                <motion.div 
                  style={{ x: textX }}
                  className="absolute top-1/2 left-1/2 -translate-y-1/2 pointer-events-none select-none mix-blend-overlay opacity-5 z-0 flex justify-center w-[150vw]"
                >
                  <h2 
                    className={`${lusitana.className} text-[22vw] leading-none font-bold tracking-tighter whitespace-nowrap text-white`}
                  >
                    {item.title.toUpperCase()}
                  </h2>
                </motion.div>

                <div className="flex w-full max-w-7xl flex-col md:flex-row items-center justify-between gap-12 lg:gap-24 relative z-10">
                  
                  {/* Left: Typography */}
                  <div className="w-full md:w-5/12 flex flex-col items-start mt-24 md:mt-0">
                    <span className="text-emerald-500 font-medium tracking-[0.2em] text-xs md:text-sm uppercase mb-6 flex items-center gap-4">
                      <span className="w-8 h-[1px] bg-emerald-500"></span>
                      0{index + 1}
                    </span>
                    <h3 className={`${lusitana.className} text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-8 leading-[1.1] tracking-tight`}>
                      {item.subtitle}
                    </h3>
                    <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-md">
                      {item.description}
                    </p>
                  </div>

                  {/* Right: Immersive Image with subtle mask effect */}
                  <div className="w-full md:w-6/12 relative">
                    <div className="relative aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10 group bg-slate-900">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover scale-110 transition-transform duration-[2s] ease-out group-hover:scale-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 transition-opacity duration-700 group-hover:opacity-20"></div>
                    </div>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
