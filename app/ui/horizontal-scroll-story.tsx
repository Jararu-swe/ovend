"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { lusitana } from "@/app/ui/fonts";

const storyItems = [
  {
    title: "Crafts",
    subtitle: "Share your vibrant creativity.",
    description:
      "Turn your local craft shop into a global boutique. Manage inventory effortlessly and let your artistry shine across borders.",
    image: "/images/story/user-image-1.jpg",
  },
  {
    title: "Fashion",
    subtitle: "Expand your boutique's reach.",
    description:
      "Whether you sell from an outdoor market or a high-end studio, Vendle gives your fashion brand a premium digital storefront.",
    image: "/images/story/user-image-2.jpg",
  },
  {
    title: "Decor",
    subtitle: "Sell authentic lifestyle goods.",
    description:
      "Showcase traditional woven baskets, intricate fans, and beautiful home accessories with immersive product pages.",
    image: "/images/story/user-image-4.jpg",
  },
  {
    title: "Tech",
    subtitle: "Power the digital age.",
    description:
      "From phone accessories to the latest devices, build a trustworthy electronics store. Process payments securely.",
    image: "/images/story/user-image-tech.jpg",
  },
  {
    title: "Cuisine",
    subtitle: "Share authentic local flavors.",
    description:
      "From hot jollof rice combos to traditional delicacies, build a mouth-watering menu and accept orders seamlessly.",
    image: "/images/story/afro-box.jpg",
  },
];

export function HorizontalScrollStory() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 0.8, 1], ["0%", "-80%", "-80%"]);
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    ["#0A1110", "#0f172a", "#1e1b4b", "#022c22", "#450a0a", "#450a0a"],
  );
  const textX = useTransform(
    scrollYProgress,
    [0, 0.8, 1],
    ["0%", "20%", "20%"],
  );
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.section
      ref={targetRef}
      style={{ backgroundColor }}
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-50">
          <motion.div
            className="h-full bg-emerald-500 origin-left"
            style={{ scaleX }}
          />
        </div>

        {/* Horizontal scroll for all sizes */}
        <motion.div
          style={{ x }}
          className="flex w-[500vw] h-full items-center"
        >
          {storyItems.map((item, index) => (
            <div
              key={index}
              className="relative flex h-screen w-screen flex-col md:flex-row items-center justify-center overflow-hidden"
            >
              {/* Giant background word */}
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

              {/* MOBILE layout (horizontal with overlay) */}
              <div className="flex md:hidden h-full w-full relative z-10">
                {/* Full image background */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Text overlay - bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-5 py-8 flex flex-col justify-end h-full">
                  {/* Index */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="w-6 h-[1px] bg-emerald-400" />
                    <span className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`${lusitana.className} text-xl sm:text-2xl text-white font-bold mb-2 leading-tight`}
                  >
                    {item.subtitle}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed max-w-xs">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* DESKTOP layout (side-by-side) */}
              <div className="hidden md:flex w-full max-w-7xl flex-row items-center justify-between gap-24 px-12 lg:px-24 relative z-10">
                {/* Left: text */}
                <div className="w-5/12 flex flex-col items-start">
                  <span className="text-emerald-500 font-medium tracking-[0.2em] text-sm uppercase mb-6 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-emerald-500" />0{index + 1}
                  </span>
                  <h3
                    className={`${lusitana.className} text-5xl lg:text-6xl text-white font-bold mb-8 leading-[1.1] tracking-tight`}
                  >
                    {item.subtitle}
                  </h3>
                  <p className="text-slate-400 text-xl font-light leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </div>

                {/* Right: image */}
                <div className="w-6/12 relative">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10 group bg-slate-900">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover scale-110 transition-transform duration-[2s] ease-out group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 transition-opacity duration-700 group-hover:opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
