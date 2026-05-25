"use client";

import React from "react";

/**
 * A phone-frame mockup that renders a mini Vendle storefront
 * using the Midnight Luxe theme (dark purple / violet).
 * Floating social-style circles orbit the device for visual flair.
 */
export function ThemePhoneMockup() {
  return (
    <div className="relative w-[280px] sm:w-[320px] md:w-[340px] mx-auto select-none">
      {/* Floating social-style icons */}
      <div className="absolute -right-6 top-[18%] z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#1DB954] shadow-lg shadow-[#1DB954]/30 animate-bounce" style={{ animationDuration: "3s", animationDelay: "0s" }}>
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>

      <div className="absolute -right-4 top-[48%] z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0000] shadow-lg shadow-[#FF0000]/30 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>

      <div className="absolute -right-2 top-[72%] z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#E1306C] shadow-lg shadow-[#E1306C]/30 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      </div>

      {/* Play button circle - left side */}
      <div className="absolute -left-4 bottom-[30%] z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm">
        <svg className="h-5 w-5 text-slate-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[6px] border-[#2a2040] bg-[#0f0f14] p-0 shadow-2xl shadow-purple-900/40 rotate-3 hover:rotate-0 transition-transform duration-700 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-28 h-6 bg-[#0f0f14] rounded-b-2xl" />

        {/* Screen content — Midnight Luxe theme preview */}
        <div className="relative w-full overflow-hidden rounded-[2rem]" style={{ backgroundColor: "#0f0f14" }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-8 pb-2">
            <p className="text-[10px] font-bold text-white/60">9:41</p>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <div className="h-1.5 w-3 rounded-full bg-white/40" />
            </div>
          </div>

          {/* Store header */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center">
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <div>
                <p className="text-white text-xs font-bold">Luxe Boutique</p>
                <p className="text-white/40 text-[9px]">Premium Collection</p>
              </div>
            </div>
          </div>

          {/* Hero banner */}
          <div className="mx-3 rounded-2xl p-4 mb-3" style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>
            <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider mb-1">New Arrivals</p>
            <p className="text-white text-sm font-bold mb-2">Midnight Collection</p>
            <div className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5">
              <p className="text-white text-[9px] font-bold">Shop Now →</p>
            </div>
          </div>

          {/* Product grid */}
          <div className="px-3 pb-6 grid grid-cols-2 gap-2">
            {/* Product 1 */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1a1a24", border: "1px solid #2e2e3a" }}>
              <div className="w-full aspect-square" style={{ background: "linear-gradient(135deg, #a78bfa20, #7c3aed30)" }}>
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-10 w-10 rounded-lg bg-[#a78bfa]/30" />
                </div>
              </div>
              <div className="p-2">
                <div className="h-1.5 w-full rounded-full bg-white/15 mb-1" />
                <div className="h-1.5 w-8 rounded-full bg-[#a78bfa]/50" />
              </div>
            </div>

            {/* Product 2 */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1a1a24", border: "1px solid #2e2e3a" }}>
              <div className="w-full aspect-square" style={{ background: "linear-gradient(135deg, #7c3aed20, #a78bfa30)" }}>
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-[#7c3aed]/30" />
                </div>
              </div>
              <div className="p-2">
                <div className="h-1.5 w-full rounded-full bg-white/15 mb-1" />
                <div className="h-1.5 w-10 rounded-full bg-[#a78bfa]/50" />
              </div>
            </div>

            {/* Product 3 */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1a1a24", border: "1px solid #2e2e3a" }}>
              <div className="w-full aspect-square" style={{ background: "linear-gradient(180deg, #a78bfa10, #7c3aed20)" }}>
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-8 w-12 rounded-lg bg-[#a78bfa]/20" />
                </div>
              </div>
              <div className="p-2">
                <div className="h-1.5 w-full rounded-full bg-white/15 mb-1" />
                <div className="h-1.5 w-6 rounded-full bg-[#a78bfa]/50" />
              </div>
            </div>

            {/* Product 4 */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1a1a24", border: "1px solid #2e2e3a" }}>
              <div className="w-full aspect-square" style={{ background: "linear-gradient(135deg, #7c3aed10, #a78bfa20)" }}>
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-10 w-10 rounded-xl bg-[#7c3aed]/25 rotate-12" />
                </div>
              </div>
              <div className="p-2">
                <div className="h-1.5 w-full rounded-full bg-white/15 mb-1" />
                <div className="h-1.5 w-9 rounded-full bg-[#a78bfa]/50" />
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="px-4 py-3 flex items-center justify-around" style={{ borderTop: "1px solid #2e2e3a" }}>
            <div className="h-1.5 w-6 rounded-full bg-[#a78bfa]" />
            <div className="h-1.5 w-6 rounded-full bg-white/20" />
            <div className="h-1.5 w-6 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* Glow effect behind phone */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="absolute top-1/4 left-1/4 h-40 w-40 rounded-full bg-[#a78bfa]" />
        <div className="absolute bottom-1/4 right-1/4 h-32 w-32 rounded-full bg-[#7c3aed]" />
      </div>
    </div>
  );
}
