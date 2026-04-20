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

// ─── Fresh Market Nav ───
export function FreshMarketNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300" style={{ backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : theme.surface_color || '#ffffff', backdropFilter: scrolled ? 'blur(10px)' : 'none', borderBottom: `1px solid ${theme.border_color}`, borderTop: `4px solid ${theme.primary_color}`, boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.04)' : 'none' }}>
      <div className={`mx-auto px-4 md:px-8 ${layoutWidthClass}`}>
        <div className="flex h-14 md:h-16 items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors" style={{ color: theme.primary_color }}>
              <StoreIcon name="share" theme={theme} className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-8 md:h-10 object-contain" /> : <h1 className="text-xl md:text-2xl font-bold tracking-tight text-center" style={{ fontFamily: FONT_MAP['poppins'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center justify-end gap-3 flex-1">
            <button onClick={() => setIsCartOpen(true)} className="relative flex h-10 px-5 items-center gap-2 rounded-full font-bold transition transform hover:scale-105" style={{ backgroundColor: theme.primary_color, color: '#fff', boxShadow: `0 4px 10px ${theme.primary_color}40` }}>
              <StoreIcon name="cart" theme={theme} className="w-5 h-5" />
              <span className="hidden sm:inline">Basket</span>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-black text-green-900 border-2 border-white">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Quick Bites Nav ───
export function QuickBitesNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="sticky top-0 z-[100]" style={{ backgroundColor: theme.surface_color, borderBottom: `3px solid ${theme.text_color}` }}>
      <div className={`mx-auto px-4 md:px-6 ${layoutWidthClass}`}>
        <div className="flex h-16 md:h-20 items-center justify-between">
          <h1 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter truncate" style={{ fontFamily: FONT_MAP['montserrat'], color: theme.primary_color, textShadow: `2px 2px 0px ${theme.text_color}` }}>
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 object-contain" /> : vendor.store_name || vendor.name}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center border-2 rounded" style={{ borderColor: theme.text_color, color: theme.text_color, backgroundColor: theme.surface_color, boxShadow: `2px 2px 0px ${theme.text_color}` }}>
              <StoreIcon name="share" theme={theme} className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative flex h-12 px-6 items-center gap-3 border-2 rounded font-black uppercase tracking-wider transition-transform active:translate-x-1 active:translate-y-1 hover:-translate-y-1" style={{ backgroundColor: theme.accent_color, borderColor: theme.text_color, color: theme.text_color, boxShadow: `4px 4px 0px ${theme.text_color}` }}>
              <StoreIcon name="cart" theme={theme} className="w-6 h-6" />
              <span className="hidden sm:inline">Order</span>
              {cartCount > 0 && <span className="absolute -top-3 -right-3 flex h-7 min-w-[28px] items-center justify-center rounded-full border-2 text-[12px] font-black" style={{ backgroundColor: theme.primary_color, color: '#fff', borderColor: theme.text_color }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Handmade Craft Nav ───
export function HandmadeCraftNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="relative z-[100]" style={{ backgroundColor: theme.surface_color, borderBottom: `1px solid ${theme.border_color}` }}>
      <div className={`mx-auto px-4 md:px-8 py-6 ${layoutWidthClass}`}>
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center w-full relative flex justify-center items-center">
            <div className="absolute left-0">
               <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity" style={{ color: theme.text_color }}>
                 <StoreIcon name="share" theme={theme} className="w-4 h-4" /> <span className="hidden md:inline">Share</span>
               </button>
            </div>
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-14 md:h-16 object-contain" /> : <h1 className="text-2xl md:text-4xl font-normal tracking-wide" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
            <div className="absolute right-0">
              <button onClick={() => setIsCartOpen(true)} className="group flex items-center gap-3 text-sm font-medium transition-all" style={{ color: theme.text_color }}>
                <span className="hidden md:inline opacity-70 group-hover:opacity-100">Cart ({cartCount})</span>
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors group-hover:bg-amber-900 group-hover:text-white" style={{ borderColor: theme.border_color, backgroundColor: cartCount > 0 ? theme.primary_color : 'transparent', color: cartCount > 0 ? '#fff' : theme.text_color }}>
                  <StoreIcon name="cart" theme={theme} className="w-4 h-4" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold bg-white" style={{ color: theme.primary_color }}>{cartCount}</span>}
                </span>
               </button>
            </div>
          </div>
          <div className="h-0.5 w-16 opacity-30" style={{ backgroundColor: theme.primary_color }}></div>
        </div>
      </div>
    </header>
  );
}

// ─── Studio Clean Nav ───
export function StudioCleanNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-colors duration-300" style={{ backgroundColor: scrolled ? 'rgba(255,255,255,0.98)' : 'transparent', borderBottom: scrolled ? '1px solid #f0f0f0' : '1px solid transparent' }}>
      <div className={`mx-auto px-6 md:px-12 ${layoutWidthClass}`}>
        <div className="flex h-20 items-center justify-between">
          <h1 className="text-lg md:text-xl font-medium tracking-tight" style={{ fontFamily: FONT_MAP['dmSans'], color: '#0a0a0a' }}>
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-6 object-contain grayscale" /> : vendor.store_name || vendor.name}
          </h1>
          <div className="flex items-center gap-6">
            <button onClick={handleShare} className="text-xs tracking-widest uppercase font-semibold hover:opacity-50 transition-opacity" style={{ color: '#000' }}>Share</button>
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold hover:opacity-50 transition-opacity" style={{ color: '#000' }}>
              Cart {cartCount > 0 && `( ${cartCount} )`}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Artisan Dark Nav ───
export function ArtisanDarkNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500" style={{ backgroundColor: scrolled ? 'rgba(28, 25, 23, 0.9)' : theme.surface_color, backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? `1px solid ${theme.border_color}` : '1px solid transparent' }}>
      <div className={`mx-auto px-6 md:px-10 ${layoutWidthClass}`}>
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 object-contain rounded-md" /> : <h1 className="text-lg md:text-2xl font-normal tracking-wide" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center gap-5">
            <button onClick={handleShare} className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: theme.text_color, fontFamily: FONT_MAP['poppins'] }}>Distribute</button>
            <button onClick={() => setIsCartOpen(true)} className="relative flex h-10 px-6 items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10" style={{ backgroundColor: theme.primary_color, color: '#f5f5f5', border: `1px solid ${theme.border_color}` }}>
              <span className="text-xs uppercase tracking-widest" style={{ fontFamily: FONT_MAP['poppins'] }}>Cart {cartCount > 0 && `(${cartCount})`}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Street Vibe Nav ───
export function StreetVibeNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="sticky top-0 z-[100]" style={{ backgroundColor: theme.background_color, borderBottom: `4px solid ${theme.primary_color}` }}>
      <div className={`mx-auto px-4 md:px-6 py-2 ${layoutWidthClass}`}>
        <div className="flex h-12 md:h-16 items-center justify-between">
          <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center border-2 rounded-sm transform transition-transform hover:-translate-y-1" style={{ borderColor: theme.primary_color, color: theme.heading_color, backgroundColor: theme.secondary_color }}>
            <StoreIcon name="share" theme={theme} className="w-5 h-5" />
          </button>
          <div className="flex justify-center items-center flex-1 mx-4 overflow-hidden relative">
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-widest whitespace-nowrap" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.heading_color, WebkitTextStroke: `1px ${theme.primary_color}` }}>
              {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-8 object-contain" /> : vendor.store_name || vendor.name}
            </h1>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative flex h-10 px-4 items-center justify-center gap-2 border-2 rounded-sm uppercase font-black tracking-widest transform transition-transform hover:-translate-y-1 active:translate-y-0" style={{ backgroundColor: theme.primary_color, borderColor: '#000', color: '#000' }}>
            <StoreIcon name="cart" theme={theme} className="w-5 h-5" />
            <span className="hidden sm:inline">Cop</span>
            {cartCount > 0 && <span className="absolute -top-3 -right-2 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 text-[10px] font-black" style={{ backgroundColor: '#fff', color: '#000', borderColor: '#000' }}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Vintage Retro Nav ───
export function VintageRetroNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="relative z-[100]" style={{ backgroundColor: theme.background_color }}>
      <div className="mx-auto" style={{ borderBottom: `1px dashed ${theme.primary_color}` }}>
        <div className={`mx-auto px-4 py-8 ${layoutWidthClass}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 flex justify-center md:justify-start">
              <button onClick={handleShare} className="text-sm italic tracking-wide relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-current hover:opacity-70 transition-opacity" style={{ color: theme.primary_color, fontFamily: FONT_MAP['playfair'] }}>
                Spread the word
              </button>
            </div>
            <div className="flex-1 flex justify-center text-center">
              {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-16 object-contain" /> : <h1 className="text-3xl md:text-5xl font-normal tracking-wide" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 px-6 py-2 rounded-full border-2 transition-all hover:bg-orange-950/5" style={{ borderColor: theme.primary_color, color: theme.primary_color }}>
                <span className="uppercase tracking-[0.2em] text-xs font-bold font-serif">Cart [{cartCount}]</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Gourmet Bistro Nav ───
export function GourmetBistroNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-colors duration-700" style={{ backgroundColor: scrolled ? 'rgba(17, 17, 17, 0.98)' : 'transparent', borderBottom: scrolled ? `1px solid ${theme.border_color}` : '1px solid transparent' }}>
      <div className={`mx-auto px-8 md:px-16 ${layoutWidthClass}`}>
        <div className="flex h-20 md:h-24 items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button onClick={handleShare} className="group flex h-12 w-12 items-center justify-center rounded-full border border-transparent transition-all hover:border-[#c5a059]" style={{ color: '#c5a059' }}>
               <StoreIcon name="share" theme={theme} className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
          <div className="flex-1 flex justify-center text-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 md:h-12 object-contain" /> : <h1 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase transition-all" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color, textShadow: scrolled ? 'none' : '0 2px 10px rgba(0,0,0,0.8)' }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex-1 flex justify-end">
            <button onClick={() => setIsCartOpen(true)} className="group flex items-center gap-3 h-10 transition-all hover:opacity-80" style={{ color: '#c5a059' }}>
              <span className="text-sm font-light tracking-[0.2em] uppercase hidden md:inline" style={{ fontFamily: FONT_MAP['dmSans'] }}>Order</span>
              <div className="relative">
                 <StoreIcon name="cart" theme={theme} className="w-6 h-6" />
                 {cartCount > 0 && <span className="absolute -top-1 -right-2 text-[10px] bg-[#c5a059] text-black w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Coffee Roasters Nav ───
export function CoffeeRoastersNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 pointer-events-none" style={{ top: scrolled ? '10px' : '0' }}>
      <div className={`mx-auto px-4 md:px-6 ${layoutWidthClass} pointer-events-auto`}>
        <div className="flex h-16 md:h-18 items-center justify-between px-6 transition-all duration-500" style={{ backgroundColor: scrolled ? theme.surface_color : 'transparent', borderRadius: scrolled ? '999px' : '0', border: scrolled ? `1px solid ${theme.border_color}` : '1px solid transparent', boxShadow: scrolled ? '0 10px 30px rgba(70, 35, 18, 0.08)' : 'none' }}>
          <div className="flex items-center gap-4">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 object-contain rounded-full" /> : <h1 className="text-xl md:text-2xl font-bold tracking-tight" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5" style={{ color: theme.text_color }}>
              <StoreIcon name="share" theme={theme} className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative flex h-10 px-5 items-center gap-2 rounded-full font-bold transition transform active:scale-95" style={{ backgroundColor: theme.primary_color, color: '#fff' }}>
              <StoreIcon name="cart" theme={theme} className="w-4 h-4" />
              <span className="text-sm font-medium">Cart</span>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-black shadow-sm" style={{ backgroundColor: theme.accent_color, color: '#fff' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Cyber Matrix Nav ───
export function CyberMatrixNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="sticky top-0 z-[100]" style={{ backgroundColor: theme.surface_color, borderBottom: `1px solid ${theme.primary_color}` }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="absolute bottom-0 left-0 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary_color}, transparent)`, boxShadow: `0 0 10px ${theme.primary_color}, 0 0 20px ${theme.primary_color}` }}></div>
      <div className={`mx-auto px-6 md:px-8 relative z-10 ${layoutWidthClass}`}>
        <div className="flex h-14 md:h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <button onClick={handleShare} className="flex h-8 w-8 items-center justify-center border transition-all hover:bg-white/5" style={{ borderColor: `${theme.primary_color}40`, color: theme.text_color }}>
               <StoreIcon name="share" theme={theme} className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center text-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-8 md:h-10 object-contain" /> : <h1 className="text-lg md:text-xl font-bold uppercase tracking-[0.2em]" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.heading_color, textShadow: `0 0 8px ${theme.primary_color}60` }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex flex-1 items-center justify-end">
            <button onClick={() => setIsCartOpen(true)} className="relative flex h-8 px-4 items-center justify-center gap-2 border uppercase tracking-widest text-[10px] sm:text-xs font-bold transition-all hover:bg-white/10" style={{ backgroundColor: `${theme.primary_color}10`, borderColor: theme.primary_color, color: theme.heading_color, boxShadow: `inset 0 0 10px ${theme.primary_color}20` }}>
              <span>Load Cart</span>
              <StoreIcon name="cart" theme={theme} className="w-3.5 h-3.5" />
              {cartCount > 0 && <span className="absolute -top-2.5 -right-2.5 flex h-5 min-w-[20px] items-center justify-center text-[9px] font-bold shadow-lg" style={{ backgroundColor: theme.accent_color, color: '#fff', border: `1px solid ${theme.primary_color}` }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Minimal SaaS Nav ───
export function MinimalSaaSNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300" style={{ backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : theme.surface_color || '#ffffff', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: scrolled ? `1px solid ${theme.border_color}` : '1px solid transparent' }}>
      <div className={`mx-auto px-6 md:px-12 ${layoutWidthClass}`}>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gradient-to-br flex items-center justify-center shadow-md font-bold text-white text-sm" style={{ backgroundImage: theme.primary_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}>
               {vendor.store_name ? vendor.store_name.charAt(0) : vendor.name.charAt(0)}
             </div>
             {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-8 object-contain" /> : <h1 className="text-base md:text-lg font-semibold tracking-tight" style={{ fontFamily: FONT_MAP['outfit'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="text-sm font-medium hover:opacity-75 transition-opacity" style={{ color: theme.text_color, fontFamily: FONT_MAP['inter'] }}>Share</button>
            <button onClick={() => setIsCartOpen(true)} className="flex h-9 px-5 items-center justify-center gap-2 rounded-lg text-sm font-medium shadow-sm border transition-shadow hover:shadow-md" style={{ backgroundColor: '#ffffff', color: theme.primary_color, borderColor: theme.border_color }}>
              <StoreIcon name="cart" theme={theme} className="w-4 h-4" />
              <span>Cart {cartCount > 0 && <span className="ml-1 bg-slate-100 rounded-full px-1.5 py-0.5 text-xs text-slate-700">{cartCount}</span>}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Gaming Pulse Nav ───
export function GamingPulseNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-colors duration-500 text-white" style={{ backgroundColor: scrolled ? 'rgba(8,1,18,0.95)' : 'transparent', borderBottom: scrolled ? `1px solid rgba(139, 92, 246, 0.2)` : '1px solid transparent' }}>
      <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
      <div className={`mx-auto px-6 md:px-10 ${layoutWidthClass}`}>
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center group">
               <StoreIcon name="share" theme={theme} className="w-5 h-5 text-indigo-300 group-hover:text-pink-400 transition-colors" />
            </button>
          </div>
          <div className="flex-1 flex justify-center text-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 md:h-12 object-contain" /> : <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: FONT_MAP['spaceGrotesk'], textShadow: scrolled ? '0 0 10px rgba(244,114,182,0.3)' : '0 4px 20px rgba(0,0,0,0.8)' }}>
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: theme.primary_gradient || 'linear-gradient(90deg, #8b5cf6, #f472b6)' }}>{vendor.store_name || vendor.name}</span>
            </h1>}
          </div>
          <div className="flex-1 flex justify-end">
            <button onClick={() => setIsCartOpen(true)} className="group relative flex h-10 px-5 items-center justify-center rounded-sm bg-white/5 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 transition-all font-bold tracking-widest text-[10px] uppercase">
              <span className="hidden sm:inline-block mr-2" style={{ fontFamily: FONT_MAP['spaceGrotesk'] }}>Inventory</span>
              <StoreIcon name="cart" theme={theme} className="w-4 h-4 text-pink-400 group-hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center text-[9px] bg-pink-500 shadow-[0_0_10px_rgba(244,114,182,0.8)] text-white">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Serene Spa Nav ───
export function SereneSpaNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-colors duration-500" style={{ backgroundColor: scrolled ? 'rgba(254, 250, 224, 0.95)' : theme.background_color, borderBottom: scrolled ? `1px solid ${theme.border_color}` : '1px solid transparent' }}>
      <div className={`mx-auto px-6 md:px-12 py-3 ${layoutWidthClass}`}>
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 md:h-12 object-contain" /> : <h1 className="text-2xl md:text-3xl font-normal tracking-wider lowercase" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          <div className="flex items-center gap-8 border-t pt-3 w-full justify-center" style={{ borderColor: theme.border_color }}>
            <button onClick={handleShare} className="text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-60" style={{ color: theme.text_color, fontFamily: FONT_MAP['dmSans'] }}>Discover</button>
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-60" style={{ color: theme.text_color, fontFamily: FONT_MAP['dmSans'] }}>
              <span>Bag</span>
              <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: theme.primary_color, color: '#fff' }}>{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Makeup Studio Nav ───
export function MakeupStudioNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="sticky top-0 z-[100]" style={{ backgroundColor: theme.background_color, borderBottom: `2px solid ${theme.border_color}` }}>
      <div className={`mx-auto px-4 sm:px-6 md:px-10 py-3 ${layoutWidthClass}`}>
        <div className="flex h-12 md:h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-12 object-contain" /> : <h1 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase" style={{ fontFamily: FONT_MAP['montserrat'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform" style={{ color: theme.primary_color }}>
              <StoreIcon name="share" theme={theme} className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative flex h-10 md:h-12 px-6 items-center justify-center gap-2 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm shadow-md transition-transform hover:scale-105" style={{ background: theme.primary_gradient || `linear-gradient(45deg, ${theme.primary_color}, ${theme.accent_color})`, color: '#fff', fontFamily: FONT_MAP['montserrat'] }}>
              <StoreIcon name="cart" theme={theme} className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Checkout</span>
              {cartCount > 0 && <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] shadow-lg" style={{ backgroundColor: '#fff', color: theme.primary_color, borderColor: theme.primary_color }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Organic Roots Nav ───
export function OrganicRootsNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="relative z-[100] mt-4 mb-2 mx-4" style={{ backgroundColor: 'transparent' }}>
      <div className={`mx-auto px-6 py-2 rounded-2xl md:rounded-[2rem] border transition-shadow hover:shadow-lg ${layoutWidthClass} bg-white/60 backdrop-blur-md`} style={{ borderColor: theme.border_color }}>
        <div className="flex h-14 md:h-16 items-center justify-between relative">
          <div className="flex-1 flex items-center justify-start gap-4">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 object-contain rounded-xl" /> : <h1 className="text-xl font-medium tracking-tight" style={{ fontFamily: FONT_MAP['dmSans'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-8 h-8 rounded-full border flex items-center justify-center opacity-30" style={{ borderColor: theme.primary_color }}>
               {/* Decorative subtle leaf graphic inside nav center */}
               <svg viewBox="0 0 24 24" fill="none" stroke={theme.primary_color} strokeWidth="1" className="w-4 h-4"><path d="M12 21C12 21 4 15 4 8C4 4.5 7.5 2 11 2C11.5 2 12 2.2 12 2.2C12 2.2 12.5 2 13 2C16.5 2 20 4.5 20 8C20 15 12 21 12 21Z" /></svg>
             </div>
          </div>
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
            <button onClick={handleShare} className="text-sm font-medium hover:opacity-75 transition-opacity px-2" style={{ color: theme.text_color, fontFamily: FONT_MAP['dmSans'] }}>Spread</button>
            <button onClick={() => setIsCartOpen(true)} className="flex h-10 px-4 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors border" style={{ backgroundColor: theme.surface_color, color: theme.primary_color, borderColor: theme.border_color }}>
              <StoreIcon name="cart" theme={theme} className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && <span className="ml-1 bg-[#166534] text-white rounded-full px-2 py-0.5 text-[10px] shadow-sm">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Clay Pottery Nav ───
export function ClayPotteryNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-700" style={{ backgroundColor: scrolled ? theme.surface_color : 'transparent', borderBottom: scrolled ? `1px solid ${theme.border_color}` : '1px solid transparent', boxShadow: scrolled ? '0 10px 40px rgba(154, 52, 18, 0.05)' : 'none' }}>
      <div className={`mx-auto px-6 md:px-16 ${layoutWidthClass}`}>
        <div className="flex h-20 md:h-24 items-center justify-between">
          <div className="flex items-center pl-2">
            <button onClick={handleShare} className="group relative text-sm italic tracking-wide transition-colors" style={{ color: theme.text_color, fontFamily: FONT_MAP['playfair'] }}>
               Share Work
               <span className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all group-hover:w-full"></span>
            </button>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 h-full flex flex-col items-center justify-center text-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-12 object-contain" /> : <h1 className="text-2xl md:text-3xl font-normal tracking-widest uppercase" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center">
            <button onClick={() => setIsCartOpen(true)} className="group flex flex-col items-center gap-1 transition-all" style={{ color: theme.text_color }}>
               <StoreIcon name="cart" theme={theme} className="w-6 h-6 transition-transform group-hover:scale-110" />
               <div className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-1" style={{ fontFamily: FONT_MAP['inter'] }}>
                 Basket <span className="w-1 h-1 rounded-full bg-[#c2410c] inline-block"></span> {cartCount}
               </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Leather & Grain Nav ───
export function LeatherGrainNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="relative z-[100] bg-[#fffbeb]">
      <div className="absolute bottom-0 w-full border-b-[3px] border-dashed" style={{ borderColor: theme.primary_color, opacity: 0.3 }} />
      <div className={`mx-auto px-6 py-4 ${layoutWidthClass}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-14 object-contain rounded-sm" /> : <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight" style={{ fontFamily: FONT_MAP['roboto'], color: theme.heading_color }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleShare} className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-2" style={{ color: theme.text_color, fontFamily: FONT_MAP['roboto'] }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary_color }}></span>
              Share
            </button>
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition-transform hover:-translate-y-1 shadow-[4px_4px_0_0_rgba(69,26,3,1)]" style={{ backgroundColor: theme.primary_color, color: '#fffbeb', fontFamily: FONT_MAP['roboto'] }}>
              <StoreIcon name="cart" theme={theme} className="w-4 h-4" />
              <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Monochrome Pro Nav ───
export function MonochromeProNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white mix-blend-difference text-white">
      <div className={`mx-auto px-8 lg:px-16 ${layoutWidthClass}`}>
        <div className="flex h-20 md:h-24 items-center justify-between">
          <div className="flex items-center gap-12">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-8 md:h-10 object-contain invert" /> : <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: FONT_MAP['inter'] }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center gap-8">
            <button onClick={handleShare} className="text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4" style={{ fontFamily: FONT_MAP['inter'] }}>Share</button>
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4" style={{ fontFamily: FONT_MAP['inter'] }}>
              Bag {cartCount > 0 && `[${cartCount}]`}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Gold Reserve Nav ───
export function GoldReserveNav({ vendor, theme, cartCount, setIsCartOpen, handleShare, layoutWidthClass }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-700" style={{ backgroundColor: scrolled ? 'rgba(2, 6, 23, 0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? `1px solid rgba(251, 191, 36, 0.2)` : '1px solid transparent' }}>
      <div className={`mx-auto px-6 lg:px-12 py-2 ${layoutWidthClass}`}>
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center">
             <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(251,191,36,0.3)] hover:bg-[rgba(251,191,36,0.1)] transition-all" style={{ color: theme.primary_color }}>
                <StoreIcon name="share" theme={theme} className="w-4 h-4" />
             </button>
          </div>
          <div className="flex-1 flex justify-center text-center">
            {theme.logo_url ? <img src={theme.logo_url} alt="" className="h-10 md:h-12 object-contain filter drop-shadow-md" /> : <h1 className="text-xl md:text-2xl font-light tracking-widest uppercase text-transparent bg-clip-text" style={{ fontFamily: FONT_MAP['outfit'], backgroundImage: theme.primary_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}>{vendor.store_name || vendor.name}</h1>}
          </div>
          <div className="flex items-center">
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 px-6 py-2 rounded-full border border-[rgba(251,191,36,0.3)] hover:bg-[rgba(251,191,36,0.1)] transition-all" style={{ color: theme.primary_color, fontFamily: FONT_MAP['outfit'] }}>
              <StoreIcon name="cart" theme={theme} className="w-5 h-5" />
              <span className="text-[11px] font-bold tracking-widest uppercase hidden md:inline">Cart</span>
              {cartCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black" style={{ backgroundColor: theme.primary_color, color: theme.background_color }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Dynamic Registry ───
export const NAV_RENDERERS: Record<string, React.FC<NavProps>> = {
  'leather-grain': LeatherGrainNav,
  'monochrome-pro': MonochromeProNav,
  'gold-reserve': GoldReserveNav,
  'serene-spa': SereneSpaNav,
  'makeup-studio': MakeupStudioNav,
  'organic-roots': OrganicRootsNav,
  'clay-pottery': ClayPotteryNav,
  'coffee-roasters': CoffeeRoastersNav,
  'cyber-matrix': CyberMatrixNav,
  'minimal-saas': MinimalSaaSNav,
  'gaming-pulse': GamingPulseNav,
  'artisan-dark': ArtisanDarkNav,
  'street-vibe': StreetVibeNav,
  'vintage-retro': VintageRetroNav,
  'gourmet-bistro': GourmetBistroNav,
  'fresh-market': FreshMarketNav,
  'quick-bites': QuickBitesNav,
  'handmade-craft': HandmadeCraftNav,
  'studio-clean': StudioCleanNav,
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
