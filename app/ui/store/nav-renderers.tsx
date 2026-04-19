'use client';

import React, { useState, useEffect } from 'react';
import { StoreTheme, User } from '@/app/lib/definitions';
import { FONT_MAP } from '@/app/lib/template-presets';
import StoreIcon from './storefront-icons';

interface NavProps {
  vendor: User;
  theme: StoreTheme;
  cartCount: number;
  handleShare: () => void;
  setIsCartOpen: (open: boolean) => void;
  layoutWidthClass: string;
}

// ─── Luxe Boutique Nav ───
export function LuxeBoutiqueNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(250,250,250,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #e4e4e7' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.accent_color}, transparent)`,
          opacity: scrolled ? 1 : 0.6,
          transition: 'opacity 0.5s',
        }}
      />
      <div className={`mx-auto px-6 md:px-10 ${layoutWidthClass}`}>
        <div className="relative flex h-16 md:h-20 items-center justify-between">
          <button
            type="button"
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 hover:opacity-60"
            style={{ color: scrolled ? theme.text_color : '#ffffff', ['--tw-ring-color' as any]: theme.accent_color }}
          >
            <StoreIcon name="share" theme={theme} className="w-5 h-5" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 btq-fade-down">
            {theme.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.logo_url} alt="" className="h-8 object-contain" />
            ) : (
              <>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.3em] leading-none mb-1"
                  style={{ color: scrolled ? theme.accent_color : 'rgba(196,154,63,0.9)' }}
                >
                  ✦ collection
                </span>
                <h1
                  className="text-lg md:text-xl font-bold leading-none tracking-[0.12em] uppercase"
                  style={{
                    fontFamily: FONT_MAP['playfair'],
                    color: scrolled ? theme.heading_color : '#ffffff',
                    textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  {vendor.store_name || vendor.name}
                </h1>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center transition-all duration-200 hover:opacity-75 focus-visible:outline-none focus-visible:ring-1"
            style={{ color: scrolled ? theme.text_color : '#ffffff', ['--tw-ring-color' as any]: theme.accent_color }}
          >
            <StoreIcon name="cart" theme={theme} className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: theme.accent_color, color: scrolled ? '#ffffff' : theme.heading_color }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Tech Store Nav ───
export function TechStoreNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-200"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 15, 28, 0.95)' : theme.surface_color || '#0a0f1c',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${theme.border_color}30`,
        boxShadow: scrolled ? `0 4px 30px ${theme.primary_color}15` : 'none',
      }}
    >
      <div className="h-0.5 w-full tch-scan" style={{ background: `linear-gradient(90deg, ${theme.primary_color}, ${theme.accent_color}, ${theme.primary_color})` }} />
      <div className={`mx-auto px-4 md:px-8 ${layoutWidthClass}`}>
        <div className="flex h-14 md:h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.accent_color})`, boxShadow: `0 0 12px ${theme.primary_color}60` }}>
              {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-full w-full object-contain p-1" /> : <span style={{ fontFamily: FONT_MAP['spaceGrotesk'] }}>{(vendor.store_name || vendor.name).charAt(0).toUpperCase()}</span>}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold leading-none tracking-tight truncate" style={{ color: '#f1f5f9', fontFamily: FONT_MAP['spaceGrotesk'] }}>{vendor.store_name || vendor.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-px rounded" style={{ color: theme.accent_color, backgroundColor: `${theme.accent_color}18`, border: `1px solid ${theme.accent_color}40` }}>Tech</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ color: '#94a3b8', backgroundColor: 'rgba(148,163,184,0.08)' }}>
              <StoreIcon name="share" theme={theme} className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider" style={{ color: '#ffffff', background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`, boxShadow: cartCount > 0 ? `0 0 16px ${theme.primary_color}60` : 'none' }}>
              <StoreIcon name="cart" theme={theme} className="w-4 h-4" />
              <span className="hidden sm:inline" style={{ fontFamily: FONT_MAP['spaceGrotesk'] }}>Cart</span>
              {cartCount > 0 && <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-black tch-cart-bounce" style={{ backgroundColor: theme.accent_color, color: '#0a0f1c' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Default Store Nav ───
export function StandardNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const isDarkSurface = (() => {
    const hex = (theme.surface_color || '#ffffff').replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return ((0.299 * r + 0.587 * g + 0.114 * b) / 255) < 0.4;
  })();

  const isTransparentHeader = theme.header_style === 'transparent';
  const headerIconColor = isTransparentHeader ? 'rgba(255,255,255,0.92)' : theme.text_color;
  
  return (
    <header
      className={`${theme.header_style === 'sticky' ? 'sticky top-0 z-[100]' : theme.header_style === 'transparent' ? 'absolute top-0 left-0 right-0 z-[100] bg-transparent' : 'relative z-[100]'}`}
      style={!isTransparentHeader ? { backgroundColor: theme.surface_color, borderBottom: `1px solid ${theme.border_color}` } : {}}
    >
      <div className={`mx-auto px-4 sm:px-6 md:px-8 py-4 ${layoutWidthClass}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold truncate" style={{ fontFamily: FONT_MAP[theme.heading_font] || theme.heading_font, color: isTransparentHeader ? '#fff' : theme.heading_color }}>
              {vendor.store_name || vendor.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5" style={{ color: headerIconColor }}>
              <StoreIcon name="share" theme={theme} className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative flex h-10 px-4 items-center gap-2 rounded-full font-bold text-sm tracking-wide transition transform hover:scale-105 active:scale-95" style={{ backgroundColor: theme.primary_color, color: '#fff' }}>
              <StoreIcon name="cart" theme={theme} className="w-5 h-5" />
              <span>Cart</span>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Beauty & Glow Nav ───
export function BeautyGlowNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${theme.border_color}` : '1px solid transparent',
        color: scrolled ? theme.heading_color : '#ffffff',
      }}
    >
      <div className={`mx-auto px-6 md:px-10 ${layoutWidthClass}`}>
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button type="button" onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-black/5" style={{ color: scrolled ? theme.heading_color : '#ffffff' }}>
              <StoreIcon name="share" theme={theme} className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 object-contain" /> : <h1 className="text-xl md:text-2xl font-normal tracking-wide transition-colors duration-500" style={{ fontFamily: FONT_MAP['playfair'], color: scrolled ? theme.heading_color : '#ffffff' }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex-1 flex justify-end">
            <button type="button" onClick={() => setIsCartOpen(true)} className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-black/5" style={{ color: scrolled ? theme.heading_color : '#ffffff' }}>
              <StoreIcon name="cart" theme={theme} className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute top-1 right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: theme.accent_color }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Midnight Luxe Nav ───
export function MidnightLuxeNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,14,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      <div className={`mx-auto px-6 md:px-12 ${layoutWidthClass}`}>
        <div className="flex h-16 md:h-24 items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button type="button" onClick={handleShare} className="group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-white/5" style={{ color: '#e2e0ea' }}>
              <StoreIcon name="share" theme={theme} className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 md:h-12 object-contain mdn-reveal" /> : <h1 className="text-xl md:text-3xl font-light tracking-widest text-[#f5f3ff] uppercase mdn-reveal" style={{ fontFamily: FONT_MAP['outfit'], textShadow: scrolled ? 'none' : '0 4px 12px rgba(0,0,0,0.5)' }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex-1 flex justify-end">
            <button type="button" onClick={() => setIsCartOpen(true)} className="group relative flex h-10 px-4 items-center gap-3 rounded-full transition-all duration-300 hover:bg-white/5" style={{ color: '#e2e0ea', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="hidden md:block text-xs font-semibold tracking-widest uppercase">Cart</span>
              <div className="relative">
                <StoreIcon name="cart" theme={theme} className="w-5 h-5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-[#0f0f14] shadow-lg" style={{ backgroundColor: theme.accent_color }}>{cartCount}</span>}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Vogue Minimal Nav ───
export function VogueMinimalNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
      style={{
        backgroundColor: scrolled ? '#ffffff' : 'transparent',
        borderBottom: scrolled ? '1px solid #e5e5e5' : '1px solid transparent',
        color: '#000000',
      }}
    >
      <div className="w-full px-4 md:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button type="button" onClick={handleShare} className="group flex h-10 w-10 items-center justify-start transition-all" style={{ color: '#000000' }}>
              <StoreIcon name="share" theme={theme} className="w-4 h-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-8 md:h-10 object-contain transition-transform hover:scale-105" /> : <h1 className="text-lg md:text-2xl font-bold tracking-[0.15em] text-center uppercase" style={{ fontFamily: FONT_MAP['playfair'], color: '#000000' }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex-1 flex justify-end">
            <button type="button" onClick={() => setIsCartOpen(true)} className="group relative flex h-10 items-center justify-end transition-all" style={{ color: '#000000' }}>
              <span className="hidden md:inline-block mr-3 text-xs tracking-widest font-bold uppercase" style={{ fontFamily: FONT_MAP['dmSans'] }}>Cart</span>
              <div className="relative">
                <StoreIcon name="cart" theme={theme} className="w-4 h-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-sm text-[9px] font-bold text-white bg-black">{cartCount}</span>}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Dynamic Registry ───
export const NAV_RENDERERS: Record<string, React.FC<NavProps>> = {
  'luxe-boutique': LuxeBoutiqueNav,
  'tech-store': TechStoreNav,
  'beauty-glow': BeautyGlowNav,
  'midnight-luxe': MidnightLuxeNav,
  'vogue-minimal': VogueMinimalNav,
  'default': StandardNav,
};

export default function DynamicNav(props: NavProps) {
  const Renderer = NAV_RENDERERS[props.theme.template_id] || NAV_RENDERERS['default'];
  return <Renderer {...props} />;
}
