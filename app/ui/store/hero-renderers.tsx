'use client';

import React from 'react';
import { StoreTheme } from '@/app/lib/definitions';
import { FONT_MAP } from '@/app/lib/template-presets';
import { getSectionSpacing, getButtonStyles, getBorderRadiusClass } from '@/app/lib/utils';
import Image from 'next/image';

interface Entrance { className: string; style: string }

interface HeroProps {
  content: Record<string, any>;
  theme: StoreTheme;
  entrance?: Entrance;
}

// ─── STANDARD HERO ───
export function StandardHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const btn = getButtonStyles(theme);
  const radiusClass = getBorderRadiusClass(theme.border_radius as any);
  const align = content.text_align || 'left';
  const alignClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';
  const hasImage = !!content.image_url;
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');
  const heroMarginBottom = theme.header_style === 'transparent' ? `calc(${spacing.section} + 2rem)` : spacing.section;

  return (
    <div
      className={`overflow-hidden ${radiusClass} relative min-h-[320px] md:min-h-[420px] ${entrance.className}`}
      style={{ animationDelay: entrance.style ? '0ms' : undefined, marginBottom: heroMarginBottom }}
    >
      {hasImage ? (
        <>
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image_url} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ background: theme.primary_gradient ? `${theme.primary_gradient}dd` : `linear-gradient(135deg, ${theme.primary_color}dd, ${theme.secondary_color}aa)` }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: theme.primary_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }} />
      )}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")', backgroundSize: '128px 128px' }} />
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-16 -mt-16 blur-3xl opacity-30" style={{ backgroundColor: theme.accent_color }} />
      <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full -ml-10 -mb-10 blur-3xl opacity-20" style={{ backgroundColor: theme.accent_color }} />
      <div className={`relative z-10 flex flex-col ${alignClass} p-8 md:p-12 lg:p-14`} style={theme.header_style === 'transparent' ? { paddingTop: '6rem' } : undefined}>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight" style={{ color: theme.heading_color || '#ffffff', fontFamily: FONT_MAP[theme.heading_font] || theme.heading_font, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{content.title || 'Welcome to our store'}</h2>
        <p className="mt-3 text-white/75 text-sm md:text-base max-w-[380px] leading-relaxed">{content.subtitle || 'Browse our collection and order directly.'}</p>
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className={`mt-6 inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold shadow-xl ${btn.className}`} style={{ ...btn.style, backgroundColor: '#ffffff', color: theme.primary_color, border: 'none', '--tw-ring-color': theme.primary_color } as any as React.CSSProperties}>
            {content.cta_text}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}

// ─── BEAUTY HERO ───
export function BeautyHero({ content, theme }: HeroProps) {
  const align = content.text_align || 'center';
  const textAlignClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';
  const hasImage = !!content.image_url;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 'min(90vh, 800px)', marginBottom: '4rem', borderRadius: '0 0 2rem 2rem', boxShadow: `0 20px 40px -10px ${theme.primary_color}1a` }}>
      {hasImage ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="h-full w-full object-cover" style={{ objectPosition: 'center 30%' }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${theme.primary_color}dd 0%, ${theme.primary_color}44 50%, transparent 100%)` }} />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ background: theme.primary_gradient || `linear-gradient(135deg, ${theme.secondary_color}, ${theme.primary_color})` }}>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[80px] opacity-40 mix-blend-screen" style={{ background: theme.accent_color }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[100px] opacity-30 mix-blend-screen" style={{ background: '#ffffff' }} />
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-12">
        <div className={`mx-auto w-full max-w-5xl flex flex-col ${textAlignClass}`}>
          <span className="text-white/80 uppercase tracking-[0.2em] text-xs font-semibold mb-6 bty-fade-up">✦ Discover Excellence</span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-8 max-w-4xl text-white bty-fade-up bty-delay-1" style={{ fontFamily: FONT_MAP['playfair'], textShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>{content.title || 'Glow from within'}</h2>
          <p className="text-lg md:text-xl text-white/95 max-w-xl font-light leading-relaxed mb-10 bty-fade-up bty-delay-2">{content.subtitle || 'Premium skincare and beauty essentials curated for radiant skin.'}</p>
          {content.cta_text && (
            <div className="bty-fade-up bty-delay-2">
              <a href={content.cta_link || '#item-list'} className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide transition-all hover:scale-105 active:scale-95" style={{ color: theme.primary_color, boxShadow: `0 10px 30px -5px ${theme.primary_color}66` }}>
                <span className="relative z-10">{content.cta_text}</span>
                <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MIDNIGHT HERO ───
export function MidnightHero({ content, theme }: HeroProps) {
  const align = content.text_align || 'center';
  const textAlignClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';
  const hasImage = !!content.image_url;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 'min(100vh, 1080px)', marginBottom: '4rem', backgroundColor: '#0f0f14' }}>
      {hasImage ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="h-full w-full object-cover opacity-60 mix-blend-luminosity" style={{ objectPosition: 'center' }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, #0f0f14 5%, transparent 60%, rgba(15,15,20,0.8) 100%)` }} />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40 mix-blend-color-dodge" style={{ backgroundImage: `radial-gradient(ellipse at 50% -20%, ${theme.primary_color}66 0%, transparent 70%)` }} />
          <div className="absolute inset-0 opacity-20 mix-blend-screen mdn-float" style={{ backgroundImage: `radial-gradient(circle at 80% 80%, ${theme.accent_color}33 0%, transparent 40%)` }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }} />
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 mt-16 md:mt-24">
        <div className={`mx-auto w-full max-w-6xl flex flex-col ${textAlignClass}`}>
          <span className="text-[#a78bfa] font-mono tracking-[0.3em] text-xs md:text-sm uppercase mb-8 mdn-reveal">✦ Exclusively Yours</span>
          <h2 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] leading-[1.0] tracking-tighter mb-8 max-w-5xl text-[#f5f3ff] mdn-reveal mdn-delay-1" style={{ fontFamily: FONT_MAP['outfit'] }}>{content.title || 'Welcome to the Dark Side'}</h2>
          <p className="text-lg md:text-2xl text-[#a1a1aa] max-w-2xl font-light leading-relaxed mb-12 mdn-reveal mdn-delay-2">{content.subtitle || 'Discover premium items perfectly tailored for your sophisticated taste.'}</p>
          {content.cta_text && (
            <div className="mdn-reveal mdn-delay-2">
              <a href={content.cta_link || '#item-list'} className="group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-full bg-white/5 border border-white/10 px-8 lg:px-10 py-4 lg:py-5 text-sm font-bold tracking-widest uppercase text-white transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 backdrop-blur-md">
                <span className="relative z-10">{content.cta_text}</span>
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:bg-white/20 group-hover:translate-x-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-[#7c3aed40] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-screen blur-xl" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── VOGUE HERO ───
export function VogueHero({ content, theme }: HeroProps) {
  const align = content.text_align || 'center';
  const textAlignClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';
  const hasImage = !!content.image_url;

  return (
    <div className="relative w-full overflow-hidden flex flex-col md:flex-row" style={{ minHeight: 'min(95vh, 900px)', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
      <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-full" style={{ borderRight: '1px solid #e5e5e5' }}>
        {hasImage ? (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image_url} alt="" className="h-full w-full object-cover transition-transform duration-[20s] hover:scale-105" style={{ objectPosition: 'center 20%' }} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-[150%] h-[150%] opacity-[0.03] text-black mix-blend-multiply" fill="none" stroke="currentColor" strokeWidth="0.5">
              <path d="M0,50 Q25,0 50,50 T100,50" />
              <path d="M0,70 Q25,20 50,70 T100,70" />
              <path d="M0,30 Q25,80 50,30 T100,30" />
            </svg>
            <span className="absolute text-3xl opacity-10" style={{ fontFamily: FONT_MAP['playfair'], fontStyle: 'italic' }}>Vogue</span>
          </div>
        )}
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 relative bg-white">
        <div className={`w-full max-w-lg flex flex-col ${textAlignClass}`}>
          <span className="text-black/50 tracking-[0.4em] text-xs font-bold uppercase mb-8" style={{ fontFamily: FONT_MAP['dmSans'] }}>Editorial</span>
          <h2 className="text-5xl md:text-6xl lg:text-[5rem] leading-[1.0] tracking-[-0.02em] mb-8 text-black" style={{ fontFamily: FONT_MAP['playfair'] }}>{content.title || 'The Autumn Collection'}</h2>
          <p className="text-lg text-black/70 font-light leading-relaxed mb-12" style={{ fontFamily: FONT_MAP['dmSans'] }}>{content.subtitle || 'Essential pieces for the modern wardrobe.'}</p>
          {content.cta_text && (
            <div>
              <a href={content.cta_link || '#item-list'} className="group relative inline-flex items-center justify-center bg-black text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2" style={{ fontFamily: FONT_MAP['dmSans'] }}>
                <span>{content.cta_text}</span>
                <span className="ml-4 transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LUXE BOUTIQUE HERO ───
export function BoutiqueHero({ content, theme }: HeroProps) {
  const align = content.text_align || 'center';
  const textAlignClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';
  const hasImage = !!content.image_url;
  const gold = theme.accent_color || '#c59b3f';

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 'calc(100vh - 0px)', marginBottom: '4rem' }}>
      {hasImage ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,9,11,0.55) 0%, rgba(9,9,11,0.35) 40%, rgba(9,9,11,0.75) 100%)' }} />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #09090b 0%, #18181b 45%, #1c1917 100%)' }} />
      )}
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%271.2%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] blur-[100px] opacity-20" style={{ backgroundColor: gold }} />
      <div className="absolute bottom-0 right-0 w-[300px] h-[200px] blur-[80px] opacity-10" style={{ backgroundColor: gold }} />
      <div className={`relative z-10 flex flex-col ${textAlignClass} justify-center min-h-[inherit] px-6 md:px-14`} style={{ minHeight: 'calc(100vh - 0px)', paddingTop: '96px', paddingBottom: '64px' }}>
        <div className="btq-line-grow mb-8" style={{ height: '1px', width: align === 'center' ? '48px' : '64px', backgroundColor: gold, ...(align === 'center' ? { alignSelf: 'center' } : {}) }} />
        <p className="btq-sub-reveal text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.35em] mb-5" style={{ color: gold, opacity: 0.85 }}>✦ Curated Collection</p>
        <h2 className="btq-hero-reveal font-bold leading-[1.05] tracking-[0.06em] uppercase" style={{ fontFamily: FONT_MAP['playfair'], color: '#ffffff', fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', textShadow: '0 4px 32px rgba(0,0,0,0.5)', maxWidth: '700px', ...(align === 'center' ? { alignSelf: 'center' } : {}) }}>{content.title || 'Curated for you'}</h2>
        <div className="btq-line-grow my-7" style={{ height: '1px', width: '120px', background: `linear-gradient(90deg, ${gold}, transparent)`, ...(align === 'center' ? { alignSelf: 'center' } : {}), animationDelay: '0.3s' }} />
        <p className="btq-sub-reveal text-sm md:text-base leading-relaxed max-w-[440px]" style={{ color: 'rgba(255,255,255,0.65)', ...(align === 'center' ? { alignSelf: 'center' } : {}), animationDelay: '0.6s' }}>{content.subtitle || 'Discover exclusive pieces handpicked with care.'}</p>
        {content.cta_text && (
          <div className="btq-sub-reveal mt-10 flex flex-wrap gap-4" style={{ ...(align === 'center' ? { justifyContent: 'center' } : {}), animationDelay: '0.85s' }}>
            <a href={content.cta_link || '#item-list'} className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:gap-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: '#ffffff', borderBottom: `1px solid rgba(255,255,255,0.35)`, paddingBottom: '4px', ['--tw-ring-color' as any]: gold }}>
              {content.cta_text}
              <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </a>
            <span className="inline-flex items-center px-4 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: gold, border: `1px solid ${gold}40`, letterSpacing: '0.2em' }}>New Season</span>
          </div>
        )}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 btq-sub-reveal" style={{ animationDelay: '1.2s' }}>
          <span className="text-[9px] uppercase tracking-[0.3em] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>Scroll</span>
          <div className="w-px h-10" style={{ background: `linear-gradient(to bottom, ${gold}60, transparent)`, animation: 'boutiqueLineGrow 2s ease-in-out infinite alternate' }} />
        </div>
      </div>
    </div>
  );
}

// ─── FRESH MARKET HERO ───
export function FreshMarketHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const align = content.text_align || 'left';
  const textAlignClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';
  const btn = getButtonStyles(theme);

  return (
    <div className={`relative w-full overflow-hidden ${entrance.className}`} style={{ minHeight: '60vh', marginBottom: '3rem', backgroundColor: theme.background_color, borderRadius: '0 0 3rem 3rem' }}>
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ backgroundColor: theme.primary_color, filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-20" style={{ backgroundColor: theme.accent_color, filter: 'blur(60px)' }} />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row h-full min-h-[60vh] max-w-7xl mx-auto items-center px-6 md:px-12 py-12 md:py-24">
        <div className={`flex-1 flex flex-col ${textAlignClass} gap-6`}>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${theme.primary_color}20`, color: theme.primary_color }}>
            Freshly Picked
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight" style={{ color: theme.heading_color, fontFamily: FONT_MAP['poppins'] }}>
            {content.title || 'Fresh picks, delivered fast'}
          </h2>
          <p className="text-lg md:text-xl max-w-lg opacity-90 leading-relaxed" style={{ color: theme.text_color }}>
            {content.subtitle || 'Farm-fresh groceries and produce at your fingertips.'}
          </p>
          {content.cta_text && (
            <div className="mt-4">
              <a href={content.cta_link || '#item-list'} className={`inline-flex items-center gap-2 px-8 py-4 text-base font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 ${btn.className}`} style={{ ...btn.style }}>
                {content.cta_text}
              </a>
            </div>
          )}
        </div>
        {content.image_url && (
          <div className="flex-1 mt-12 md:mt-0 relative w-full h-full min-h-[300px] md:min-h-[400px]">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover rounded-3xl md:rounded-[3rem] shadow-2xl transition-transform hover:scale-105 duration-[5s]" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── QUICK BITES HERO ───
export function QuickBitesHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  return (
    <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center pt-24 pb-16 md:pt-32 md:pb-24 px-4 border-b-8 ${entrance.className}`} style={{ backgroundColor: theme.primary_color, borderColor: theme.text_color, marginBottom: '4rem' }}>
      <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${theme.secondary_color} 0, ${theme.secondary_color} 2px, transparent 2px, transparent 10px)`, opacity: 0.2 }} />
      <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center">
        <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.9]" style={{ fontFamily: FONT_MAP['montserrat'], color: theme.surface_color, textShadow: `4px 4px 0px ${theme.text_color}` }}>
          {content.title || 'Hungry? Order Now'}
        </h2>
        <div className="w-full h-2 my-8" style={{ backgroundColor: theme.text_color }} />
        <p className="text-xl md:text-2xl font-bold max-w-2xl px-4 py-2" style={{ fontFamily: FONT_MAP['montserrat'], color: theme.text_color, backgroundColor: theme.surface_color, border: `2px solid ${theme.text_color}`, boxShadow: `4px 4px 0px ${theme.text_color}` }}>
          {content.subtitle || 'Delicious meals ready in minutes — straight to your door.'}
        </p>
        {content.cta_text && (
          <div className="mt-12">
            <a href={content.cta_link || '#item-list'} className="inline-flex items-center px-10 py-5 text-2xl font-black uppercase italic tracking-wider transition-transform hover:-translate-y-2 active:translate-y-1" style={{ fontFamily: FONT_MAP['montserrat'], backgroundColor: theme.accent_color, color: theme.text_color, border: `4px solid ${theme.text_color}`, boxShadow: `6px 6px 0px ${theme.text_color}` }}>
              {content.cta_text}
              <svg className="ml-3 h-6 w-6" fill="black" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
        )}
      </div>
      {content.image_url && (
         <div className="relative z-10 mt-16 max-w-5xl w-full" style={{ border: `4px solid ${theme.text_color}`, boxShadow: `8px 8px 0px ${theme.text_color}` }}>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={content.image_url} alt="" className="w-full aspect-video object-cover" />
         </div>
      )}
    </div>
  );
}

// ─── HANDMADE CRAFT HERO ───
export function HandmadeCraftHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col md:flex-row min-h-[60vh] ${entrance.className}`} style={{ backgroundColor: theme.surface_color, marginBottom: '4rem', borderBottom: `1px solid ${theme.border_color}` }}>
      <div className="flex-1 flex flex-col justify-center px-8 py-16 md:p-16 lg:p-24 relative z-10 text-center md:text-left">
        <h2 className="text-4xl md:text-6xl font-normal leading-tight mb-6" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
          {content.title || 'Made with love'}
        </h2>
        <p className="text-lg md:text-xl font-light leading-relaxed mb-10 max-w-lg opacity-80 mx-auto md:mx-0" style={{ color: theme.text_color }}>
          {content.subtitle || 'Handcrafted pieces, each one unique — made just for you.'}
        </p>
        {content.cta_text && (
          <div>
            <a href={content.cta_link || '#item-list'} className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium tracking-widest uppercase transition-all hover:opacity-70" style={{ border: `1px solid ${theme.border_color}`, color: theme.text_color }}>
              {content.cta_text}
            </a>
          </div>
        )}
      </div>
      {hasImage && (
        <div className="flex-1 relative min-h-[40vh] md:min-h-full p-4 md:p-8">
           <div className="absolute inset-4 md:inset-8" style={{ border: `1px solid ${theme.primary_color}40`, pointerEvents: 'none', zIndex: 2 }}></div>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover sepia-[0.3]" />
        </div>
      )}
    </div>
  );
}

// ─── STUDIO CLEAN HERO ───
export function StudioCleanHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  return (
    <div className={`relative w-full flex items-center justify-center overflow-hidden bg-white ${entrance.className}`} style={{ minHeight: '80vh', marginBottom: '4rem' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter mb-8" style={{ fontFamily: FONT_MAP['dmSans'], color: '#000' }}>
          {content.title || 'Less is more.'}
        </h2>
        <p className="text-lg md:text-2xl font-light text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          {content.subtitle || 'A carefully curated selection of products you\'ll love.'}
        </p>
        
        {content.image_url && (
          <div className="mx-auto w-full max-w-3xl aspect-[16/9] overflow-hidden mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-[10s] ease-out grayscale" />
          </div>
        )}

        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-block border-b-2 border-black pb-1 text-sm font-semibold tracking-[0.2em] uppercase hover:text-gray-500 hover:border-gray-500 transition-colors">
            {content.cta_text}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── ARTISAN DARK HERO ───
export function ArtisanDarkHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full overflow-hidden flex flex-col md:flex-row min-h-[70vh] ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '4rem' }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%271.5%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }} />
      {hasImage && (
        <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-[70vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, ${theme.background_color})` }} />
        </div>
      )}
      <div className={`w-full ${hasImage ? 'md:w-1/2' : 'max-w-4xl mx-auto'} flex flex-col justify-center px-8 md:px-16 py-16 relative z-10 items-center md:items-start text-center md:text-left`}>
        <span className="text-xs uppercase tracking-[0.3em] font-medium opacity-60 mb-6" style={{ color: theme.accent_color }}>Masterfully Crafted</span>
        <h2 className="text-5xl md:text-6xl font-normal leading-tight mb-8" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
          {content.title || 'Crafted with Intent'}
        </h2>
        <div className="w-12 h-0.5 mb-10" style={{ backgroundColor: theme.accent_color }} />
        <p className="text-lg font-light leading-relaxed mb-10 max-w-md opacity-80" style={{ color: theme.text_color }}>
          {content.subtitle || 'Every object tells a story of heritage and skill.'}
        </p>
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-flex items-center gap-4 px-8 py-4 text-sm tracking-widest uppercase transition-all hover:bg-white/5 border" style={{ borderColor: theme.border_color, color: theme.text_color }}>
            {content.cta_text}
            <span className="font-serif italic font-bold" style={{ color: theme.accent_color }}>→</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ─── STREET VIBE HERO ───
export function StreetVibeHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  return (
    <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[85vh] ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      <div className="absolute top-1/4 -left-[20%] w-[140%] overflow-hidden whitespace-nowrap opacity-10 rotate-[-5deg] pointer-events-none">
        <h1 className="text-[12rem] font-black uppercase" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.primary_color, WebkitTextStroke: `4px ${theme.primary_color}` }}>
          STREET DROP NO.1 STREET DROP NO.1 STREET DROP NO.1 
        </h1>
      </div>
      <div className="absolute bottom-1/4 -left-[20%] w-[140%] overflow-hidden whitespace-nowrap opacity-10 rotate-[5deg] pointer-events-none">
        <h1 className="text-[12rem] font-black uppercase" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.primary_color, WebkitTextStroke: `4px ${theme.primary_color}` }}>
          NEW ARRIVALS NEW ARRIVALS NEW ARRIVALS
        </h1>
      </div>
      
      <div className="relative z-10 w-full max-w-3xl border-8 p-8 md:p-16 bg-black flex flex-col items-center text-center transform transition-transform hover:scale-[1.02]" style={{ borderColor: theme.primary_color, boxShadow: `16px 16px 0px ${theme.primary_color}` }}>
        <span className="bg-white text-black px-4 py-1 text-xs font-black tracking-widest uppercase mb-8" style={{ fontFamily: FONT_MAP['spaceGrotesk'] }}>Limited Run</span>
        <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter mb-8" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.heading_color }}>
          {content.title || 'STREET DROP 01'}
        </h2>
        <p className="text-lg md:text-2xl font-bold uppercase tracking-wider mb-12" style={{ color: theme.text_color, fontFamily: FONT_MAP['spaceGrotesk'] }}>
          {content.subtitle || 'The wait is over. Limited edition arrivals.'}
        </p>
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-block px-12 py-5 text-2xl font-black uppercase tracking-widest hover:invert transition-all" style={{ backgroundColor: theme.primary_color, color: '#000', fontFamily: FONT_MAP['spaceGrotesk'] }}>
            {content.cta_text}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── VINTAGE RETRO HERO ───
export function VintageRetroHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col items-center justify-center min-h-[70vh] py-16 px-6 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '4rem' }}>
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-radial-gradient(circle at center, #7c2d12 0, transparent 2px)', backgroundSize: '16px 16px' }} />
      <div className="w-full max-w-6xl border-2 p-3 md:p-6 relative z-10 bg-[#fdf8f1]" style={{ borderColor: theme.primary_color }}>
        <div className="border border-dashed p-8 md:p-16 flex flex-col items-center text-center" style={{ borderColor: theme.primary_color }}>
          <span className="text-sm italic mb-6" style={{ fontFamily: FONT_MAP['playfair'], color: theme.accent_color }}>Est. Now</span>
          <h2 className="text-5xl md:text-7xl font-normal leading-tight mb-8 max-w-3xl" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
            {content.title || 'Timeless Treasures'}
          </h2>
          <div className="flex items-center gap-4 w-full max-w-xs mb-8">
            <div className="h-px flex-1" style={{ backgroundColor: theme.primary_color }} />
            <span style={{ color: theme.primary_color }}>✦</span>
            <div className="h-px flex-1" style={{ backgroundColor: theme.primary_color }} />
          </div>
          <p className="text-lg leading-relaxed max-w-xl opacity-90 mb-12" style={{ color: theme.text_color }}>
            {content.subtitle || 'Ethically curated vintage pieces with a story.'}
          </p>
          {content.cta_text && (
            <a href={content.cta_link || '#item-list'} className="inline-block border-2 px-10 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#7c2d12] hover:text-[#fdf8f1] transition-colors" style={{ borderColor: theme.primary_color, color: theme.heading_color }}>
              {content.cta_text}
            </a>
          )}
        </div>
      </div>
      {hasImage && (
        <div className="w-full max-w-4xl mt-16 relative z-10 aspect-video md:aspect-[21/9] overflow-hidden border-4 bg-[#431407]" style={{ borderColor: theme.primary_color, boxShadow: `8px 8px 0px ${theme.primary_color}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="w-full h-full object-cover sepia-[0.5] mix-blend-luminosity opacity-90 hover:scale-105 transition-transform duration-700" />
        </div>
      )}
    </div>
  );
}

// ─── GOURMET BISTRO HERO ───
export function GourmetBistroHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[90vh] ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      {hasImage ? (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.7) 100%)' }} />
        </div>
      ) : (
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(circle at top right, #2a2a2a 0%, #111111 60%)' }} />
      )}
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-12 w-full max-w-4xl mx-auto pt-20">
        <svg className="w-12 h-12 mb-8 opacity-80" viewBox="0 0 24 24" fill="none" stroke={theme.accent_color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="text-xs uppercase tracking-[0.4em] mb-4" style={{ color: theme.accent_color, fontFamily: FONT_MAP['dmSans'] }}>Fine Collection</span>
        <h2 className="text-5xl sm:text-6xl md:text-8xl font-light mb-8 italic" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
          {content.title || 'The Art of Taste'}
        </h2>
        <div className="w-24 h-px mb-8" style={{ backgroundColor: theme.accent_color, opacity: 0.5 }} />
        <p className="text-lg md:text-xl font-light max-w-2xl mb-12 leading-relaxed" style={{ color: theme.text_color, fontFamily: FONT_MAP['dmSans'] }}>
          {content.subtitle || 'Experience exquisite selections delivered directly to your table.'}
        </p>
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-flex items-center px-10 py-4 text-xs tracking-[0.2em] uppercase transition-all hover:bg-[#c5a059] hover:text-black border" style={{ borderColor: theme.accent_color, color: theme.accent_color, fontFamily: FONT_MAP['dmSans'] }}>
            {content.cta_text}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── COFFEE ROASTERS HERO ───
export function CoffeeRoastersHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col items-center justify-center min-h-[75vh] px-4 md:px-8 pt-24 pb-12 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '4rem' }}>
      <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%272%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27 opacity=%270.3%27/%3E%3C/svg%3E")', mixBlendMode: 'multiply' }} />
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 lg:gap-16 items-center relative z-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-8 text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: `${theme.primary_color}15`, color: theme.primary_color, fontFamily: FONT_MAP['inter'] }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent_color }}></span>
            Freshly Roasted
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.heading_color }}>
            {content.title || 'Roasted with Soul'}
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-lg mx-auto md:mx-0" style={{ color: theme.text_color, fontFamily: FONT_MAP['inter'] }}>
            {content.subtitle || 'Specialty beans sourced directly from independent growers.'}
          </p>
          {content.cta_text && (
            <a href={content.cta_link || '#item-list'} className="inline-block px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ backgroundColor: theme.primary_color, color: '#fff', fontFamily: FONT_MAP['inter'] }}>
              {content.cta_text}
            </a>
          )}
        </div>
        {hasImage && (
          <div className="flex-1 w-full max-w-md md:max-w-none relative aspect-[4/5] md:aspect-square">
            <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] transform translate-x-4 translate-y-4" style={{ backgroundColor: theme.primary_color, opacity: 0.1 }}></div>
            <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] border-2 transform -translate-x-4 -translate-y-4" style={{ borderColor: theme.accent_color }}></div>
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover rounded-[2rem] md:rounded-[4rem] shadow-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CYBER MATRIX HERO ───
export function CyberMatrixHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  return (
    <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[90vh] p-6 lg:p-12 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px w-full opacity-30" style={{ background: theme.primary_color, boxShadow: `0 0 20px ${theme.primary_color}` }} />
      
      <div className="relative z-20 w-full max-w-5xl flex flex-col md:flex-row items-center border border-white/10 bg-black/40 backdrop-blur-sm p-8 md:p-16">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 -translate-x-1 -translate-y-1" style={{ borderColor: theme.primary_color }}></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 translate-x-1 -translate-y-1" style={{ borderColor: theme.primary_color }}></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 -translate-x-1 translate-y-1" style={{ borderColor: theme.primary_color }}></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 translate-x-1 translate-y-1" style={{ borderColor: theme.primary_color }}></div>

        <div className="flex-1 flex flex-col items-start w-full">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: theme.accent_color, boxShadow: `0 0 10px ${theme.accent_color}` }}></span>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: theme.accent_color }}>System.Online</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-[0.9] mb-6" style={{ fontFamily: FONT_MAP['spaceGrotesk'], color: theme.heading_color, textShadow: `0 0 30px ${theme.primary_color}40` }}>
            {content.title || 'Beyond the Circuit'}
          </h2>
          <p className="text-lg md:text-xl font-mono mb-10 max-w-lg opacity-70" style={{ color: theme.text_color }}>
            {'>'} {content.subtitle || 'Cutting-edge hardware for the next generation of creators.'}
          </p>
          {content.cta_text && (
            <a href={content.cta_link || '#item-list'} className="group relative inline-flex items-center justify-center px-10 py-4 text-xs font-bold font-mono tracking-widest uppercase transition-all overflow-hidden border" style={{ borderColor: theme.primary_color, color: theme.primary_color }}>
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" style={{ backgroundColor: theme.primary_color }}></span>
              <span className="relative z-10 group-hover:text-black">{content.cta_text}</span>
            </a>
          )}
        </div>
        {content.image_url && (
            <div className="flex-1 w-full mt-12 md:mt-0 relative aspect-video filter drop-shadow-2xl opacity-90 transition-all hover:opacity-100 hover:scale-105" style={{ filter: `drop-shadow(0 0 30px ${theme.primary_color}40)` }}>
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={content.image_url} alt="" className="w-full h-full object-cover mix-blend-screen" />
            </div>
        )}
      </div>
    </div>
  );
}

// ─── MINIMAL SAAS HERO ───
export function MinimalSaaSHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full overflow-hidden min-h-[85vh] flex flex-col justify-center pt-20 px-6 md:px-12 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '4rem' }}>
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-40 blur-[100px]" style={{ backgroundColor: theme.accent_color }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px]" style={{ backgroundColor: theme.primary_color }} />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left mt-16 md:mt-0">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6" style={{ fontFamily: FONT_MAP['outfit'], color: theme.heading_color }}>
            {content.title || 'Simplify your workflow'}
          </h2>
          <p className="text-lg md:text-2xl font-normal leading-relaxed mb-10 max-w-xl text-slate-500" style={{ fontFamily: FONT_MAP['inter'] }}>
            {content.subtitle || 'Powerful tools designed for speed and reliability.'}
          </p>
          {content.cta_text && (
            <div className="flex items-center gap-4">
              <a href={content.cta_link || '#item-list'} className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 hover:-translate-y-1" style={{ backgroundColor: theme.primary_color, color: '#fff', fontFamily: FONT_MAP['inter'] }}>
                {content.cta_text}
              </a>
            </div>
          )}
        </div>
        {hasImage && (
          <div className="flex-1 w-full relative">
            <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-700" style={{ border: `1px solid ${theme.border_color}` }}>
              <div className="absolute top-0 left-0 w-full h-8 bg-slate-100 flex items-center px-4 gap-2 z-20 border-b border-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.image_url} alt="" className="w-full h-full object-cover pt-8 bg-white" />
            </div>
            <div className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: theme.primary_color }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GAMING PULSE HERO ───
export function GamingPulseHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full overflow-hidden min-h-[90vh] flex items-center justify-center pt-16 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(244,114,182,0.1) 100px, rgba(244,114,182,0.1) 200px)', animation: 'slideBg 60s linear infinite' }}></div>
      </div>
      
      {hasImage && (
        <div className="absolute inset-0 z-0 opacity-50 mix-blend-screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0" style={{ backgroundImage: theme.primary_gradient || 'linear-gradient(to top, #080112, transparent, #080112)' }}></div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter italic mb-6 text-transparent bg-clip-text" style={{ fontFamily: FONT_MAP['spaceGrotesk'], backgroundImage: theme.primary_gradient || 'linear-gradient(90deg, #8b5cf6, #ec4899)', filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.5))' }}>
          {content.title || 'UNLEASH THE POWER'}
        </h2>
        <p className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#a5b4fc] mb-10 max-w-3xl" style={{ fontFamily: FONT_MAP['spaceGrotesk'] }}>
          {content.subtitle || 'Pro-grade gaming gear for competitive elite.'}
        </p>
        {content.cta_text && (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" style={{ backgroundImage: `linear-gradient(to right, ${theme.primary_color}, ${theme.accent_color})` }}></div>
            <a href={content.cta_link || '#item-list'} className="relative inline-flex items-center justify-center px-12 py-5 bg-black rounded-lg text-lg font-black uppercase tracking-widest text-white transition-all transform group-hover:scale-[1.02]" style={{ fontFamily: FONT_MAP['spaceGrotesk'] }}>
              {content.cta_text}
            </a>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideBg {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── SERENE SPA HERO ───
export function SereneSpaHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col md:flex-row items-center justify-center min-h-[85vh] px-6 lg:px-16 py-20 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '4rem' }}>
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10 md:pr-12">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-8" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
          {content.title || 'Find Your Calm'}
        </h2>
        <div className="w-16 h-px mb-8" style={{ backgroundColor: theme.primary_color }} />
        <p className="text-lg md:text-xl font-light leading-relaxed mb-10 max-w-lg" style={{ color: theme.text_color, fontFamily: FONT_MAP['dmSans'] }}>
          {content.subtitle || 'Natural remedies for mind, body, and soul.'}
        </p>
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-flex items-center px-10 py-4 text-sm tracking-[0.2em] uppercase transition-all rounded-full hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: theme.primary_color, color: '#fefae0', fontFamily: FONT_MAP['dmSans'] }}>
            {content.cta_text}
          </a>
        )}
      </div>
      
      {hasImage && (
        <div className="w-full md:w-1/2 mt-16 md:mt-0 relative aspect-[3/4] max-w-md mx-auto md:max-w-none">
          <div className="absolute inset-0 rounded-full md:rounded-[10rem] overflow-hidden">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image_url} alt="" className="w-full h-full object-cover" />
          </div>
          {/* Decorative floating arch */}
          <div className="absolute -inset-4 md:-inset-8 border-px rounded-full md:rounded-[11rem] opacity-30 z-0 pointer-events-none" style={{ border: `1px solid ${theme.primary_color}` }}></div>
        </div>
      )}
    </div>
  );
}

// ─── MAKEUP STUDIO HERO ───
export function MakeupStudioHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full overflow-hidden min-h-[85vh] flex flex-col items-center justify-center p-6 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: theme.primary_color }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: theme.accent_color }}></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {hasImage && (
          <div className="flex-1 w-full relative">
            <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl z-10" style={{ border: `4px solid ${theme.border_color}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.image_url} alt="" className="w-full h-full object-cover aspect-[4/5] object-center" />
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent mix-blend-overlay"></div>
            </div>
            <div className="absolute top-4 left-4 w-full h-full rounded-2xl md:rounded-[2rem] z-0" style={{ backgroundColor: theme.primary_color }}></div>
          </div>
        )}
        <div className={`flex-1 flex flex-col ${hasImage ? 'items-start text-left' : 'items-center text-center max-w-3xl mx-auto'}`}>
          <div className="mb-4 inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ backgroundColor: theme.border_color, color: theme.primary_color, fontFamily: FONT_MAP['montserrat'] }}>
            Professional Grade
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6" style={{ fontFamily: FONT_MAP['montserrat'], color: theme.heading_color }}>
            {content.title || 'Fearless Beauty'}
          </h2>
          <p className="text-lg md:text-xl font-medium leading-relaxed mb-10 opacity-80" style={{ color: theme.text_color, fontFamily: FONT_MAP['montserrat'] }}>
            {content.subtitle || 'Unleash your inner artist with professional grade cosmetics.'}
          </p>
          {content.cta_text && (
            <a href={content.cta_link || '#item-list'} className="inline-flex items-center justify-center px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-xl" style={{ background: theme.primary_gradient || `linear-gradient(45deg, ${theme.primary_color}, ${theme.accent_color})`, color: '#fff', fontFamily: FONT_MAP['montserrat'] }}>
              {content.cta_text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ORGANIC ROOTS HERO ───
export function OrganicRootsHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col items-center justify-center min-h-[85vh] px-4 md:px-8 py-20 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '3rem' }}>
      <div className="absolute inset-0 opacity-[0.03]">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">
           <defs>
              <pattern id="leaves" width="100" height="100" patternUnits="userSpaceOnUse">
                 <path d="M50 0 Q60 50 50 100 Q40 50 50 0" fill={theme.primary_color}/>
              </pattern>
           </defs>
           <rect x="0" y="0" width="100%" height="100%" fill="url(#leaves)"/>
        </svg>
      </div>

      <div className="w-full max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: FONT_MAP['dmSans'], color: theme.heading_color }}>
          {content.title || 'Skin Kind, Earth Kind'}
        </h2>
        <p className="text-lg md:text-2xl font-normal leading-relaxed mb-12 max-w-2xl text-[#14532d]" style={{ fontFamily: FONT_MAP['dmSans'] }}>
          {content.subtitle || '100% organic, plastic-free skincare essentials.'}
        </p>
        {hasImage && (
          <div className="w-full max-w-4xl mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-12 aspect-[16/9] shadow-xl relative group">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={content.image_url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#14532d]/40 to-transparent"></div>
          </div>
        )}
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: theme.primary_color, color: '#fff', fontFamily: FONT_MAP['dmSans'] }}>
            {content.cta_text}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        )}
      </div>
    </div>
  );
}

// ─── CLAY POTTERY HERO ───
export function ClayPotteryHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col md:flex-row items-center justify-center min-h-[90vh] py-24 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#9a3412 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="w-full flex-1 flex flex-col items-center text-center px-6 lg:px-12 relative z-10 mt-16 md:mt-0">
        <span className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: theme.accent_color, fontFamily: FONT_MAP['inter'] }}>Hand Built</span>
        <h2 className="text-5xl md:text-7xl font-normal mb-8 max-w-2xl leading-tight" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
          {content.title || 'Shaped by Hand'}
        </h2>
        <div className="w-16 h-1 mb-8" style={{ backgroundColor: theme.primary_color }}></div>
        <p className="text-lg md:text-xl font-light mb-12 max-w-md mx-auto" style={{ color: theme.text_color, fontFamily: FONT_MAP['inter'] }}>
          {content.subtitle || 'Functional art for your daily rituals.'}
        </p>
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-flex items-center justify-center border-b-2 pb-1 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-70" style={{ borderColor: theme.primary_color, color: theme.primary_color, fontFamily: FONT_MAP['inter'] }}>
            {content.cta_text}
          </a>
        )}
      </div>

      {hasImage && (
        <div className="w-full flex-1 mt-16 md:mt-0 px-6 lg:px-12 relative z-10 flex justify-center">
          <div className="relative w-full max-w-md aspect-[3/4] bg-[#9a3412] p-2 md:p-3 shadow-2xl" style={{ borderRadius: '50% 50% 0 0' }}>
            <div className="w-full h-full overflow-hidden" style={{ borderRadius: '50% 50% 0 0', backgroundColor: '#7c2d12' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.image_url} alt="" className="w-full h-full object-cover mix-blend-luminosity opacity-90 hover:scale-105 transition-transform duration-[1.5s]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LEATHER & GRAIN HERO ───
export function LeatherGrainHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col md:flex-row min-h-[85vh] ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #451a03 0px, #451a03 2px, transparent 2px, transparent 8px)' }}></div>
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-20 relative z-10">
        <div className="inline-flex items-center gap-4 mb-8">
           <div className="w-12 h-px" style={{ backgroundColor: theme.primary_color }}></div>
           <span className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: theme.primary_color, fontFamily: FONT_MAP['roboto'] }}>Est. 2026</span>
        </div>
        <h2 className="text-6xl lg:text-7xl font-bold leading-[1.05] mb-8" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
          {content.title || 'Built to Last'}
        </h2>
        <p className="text-lg lg:text-xl font-normal leading-relaxed mb-12 max-w-md opacity-80" style={{ color: theme.text_color, fontFamily: FONT_MAP['roboto'] }}>
          {content.subtitle || 'Generations of craftsmanship in every stitch.'}
        </p>
        {content.cta_text && (
          <a href={content.cta_link || '#item-list'} className="inline-flex items-center justify-center bg-[#451a03] text-[#fffbeb] px-10 py-4 font-bold uppercase tracking-widest text-sm transition-all hover:-translate-y-1 hover:shadow-xl w-max" style={{ fontFamily: FONT_MAP['roboto'] }}>
            {content.cta_text}
          </a>
        )}
      </div>

      {hasImage && (
        <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-full border-l-[8px]" style={{ borderColor: theme.primary_color }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover sepia-[0.3]" />
          <div className="absolute inset-0 bg-[#451a03] mix-blend-color opacity-20"></div>
          <div className="absolute bottom-8 right-8 bg-[#fffbeb] p-4 shadow-xl border-dashed border-2" style={{ borderColor: theme.primary_color }}>
             <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.primary_color, fontFamily: FONT_MAP['roboto'] }}>Premium Quality</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MONOCHROME PRO HERO ───
export function MonochromeProHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  return (
    <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[95vh] px-6 lg:px-12 py-24 ${entrance.className}`} style={{ backgroundColor: theme.background_color }}>
      <div className="absolute top-0 left-0 w-full h-full p-6 lg:p-12 pointer-events-none z-0">
        <div className="w-full h-full border-[10px]" style={{ borderColor: theme.primary_color }}></div>
      </div>
      
      <div className="relative z-10 w-full flex flex-col items-center text-center">
        {content.image_url && (
          <div className="w-full max-w-4xl aspect-[21/9] mb-16 overflow-hidden border">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={content.image_url} alt="" className="w-full h-full object-cover grayscale hover:scale-[1.03] transition-transform duration-[2s]" />
          </div>
        )}
        <h2 className="text-[12vw] md:text-[10vw] font-black uppercase tracking-tighter leading-[0.8] mb-8" style={{ fontFamily: FONT_MAP['inter'], color: theme.heading_color }}>
          {content.title || 'FORM & FUNCTION'}
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mt-8">
          <p className="text-xl md:text-2xl font-medium tracking-wide uppercase" style={{ color: theme.text_color, fontFamily: FONT_MAP['inter'] }}>
            {content.subtitle || 'The essential collection.'}
          </p>
          {content.cta_text && (
            <a href={content.cta_link || '#item-list'} className="inline-block px-12 py-5 bg-black text-white text-sm font-bold uppercase tracking-[0.2em] border-2 border-black hover:bg-white hover:text-black transition-colors" style={{ fontFamily: FONT_MAP['inter'] }}>
              {content.cta_text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GOLD RESERVE HERO ───
export function GoldReserveHero({ content, theme, entrance = { className: '', style: '' } }: HeroProps) {
  const hasImage = !!content.image_url;

  return (
    <div className={`relative w-full flex flex-col lg:flex-row items-center justify-center min-h-[95vh] px-6 lg:px-16 pt-24 pb-16 ${entrance.className}`} style={{ backgroundColor: theme.background_color, marginBottom: '2rem' }}>
      <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: `radial-gradient(ellipse at top right, ${theme.primary_color} 0%, transparent 50%)` }}></div>
      <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: `radial-gradient(ellipse at bottom left, ${theme.secondary_color} 0%, transparent 50%)` }}></div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="mb-8 p-[1px] rounded-full inline-block" style={{ backgroundImage: theme.primary_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}>
             <div className="px-6 py-1.5 rounded-full bg-[#020617] text-xs uppercase tracking-[0.4em] font-light" style={{ color: theme.primary_color, fontFamily: FONT_MAP['outfit'] }}>
               Private Member
             </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-normal leading-tight mb-8" style={{ fontFamily: FONT_MAP['playfair'], color: theme.heading_color }}>
            {content.title || 'The Gold Standard'}
          </h2>
          <p className="text-lg md:text-xl font-light leading-relaxed mb-12 max-w-lg opacity-80" style={{ color: theme.text_color, fontFamily: FONT_MAP['outfit'] }}>
            {content.subtitle || 'Uncompromising luxury for the discerning few.'}
          </p>
          {content.cta_text && (
            <a href={content.cta_link || '#item-list'} className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden rounded-full font-light tracking-[0.2em] uppercase text-sm border hover:border-transparent transition-all" style={{ borderColor: 'rgba(251,191,36,0.3)', color: theme.primary_color, fontFamily: FONT_MAP['outfit'] }}>
              <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundImage: theme.primary_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}></span>
              <span className="relative z-10 group-hover:text-[#020617] transition-colors">{content.cta_text}</span>
            </a>
          )}
        </div>

        {hasImage && (
          <div className="flex-1 w-full relative max-w-md lg:max-w-none">
            <div className="relative aspect-[3/4] rounded-[2rem] p-[2px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style={{ backgroundImage: theme.primary_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}>
              <div className="absolute inset-0 p-[2px]">
                 <div className="w-full h-full rounded-[2rem] overflow-hidden bg-[#020617] relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none"></div>
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={content.image_url} alt="" className="w-full h-full object-cover mix-blend-luminosity opacity-90 hover:scale-105 transition-transform duration-[2s]" />
                 </div>
              </div>
            </div>
            
            {/* Floating glass card */}
            <div className="absolute -bottom-6 -left-6 lg:-left-12 p-[1px] rounded-2xl z-20" style={{ backgroundImage: `linear-gradient(135deg, rgba(251,191,36,0.5), transparent)` }}>
              <div className="px-6 py-4 rounded-2xl bg-[#0f172a]/80 backdrop-blur-md shadow-2xl flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundImage: theme.primary_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}>
                   <span className="text-[#020617] font-black text-xl leading-none">V</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-white text-sm font-bold tracking-widest uppercase">Verified</span>
                   <span className="text-[#fbbf24] text-[10px] tracking-widest uppercase">Authentic</span>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DYNAMIC REGISTRY ───
export const HERO_RENDERERS: Record<string, React.FC<HeroProps>> = {
  'leather-grain': LeatherGrainHero,
  'monochrome-pro': MonochromeProHero,
  'gold-reserve': GoldReserveHero,
  'serene-spa': SereneSpaHero,
  'makeup-studio': MakeupStudioHero,
  'organic-roots': OrganicRootsHero,
  'clay-pottery': ClayPotteryHero,
  'coffee-roasters': CoffeeRoastersHero,
  'cyber-matrix': CyberMatrixHero,
  'minimal-saas': MinimalSaaSHero,
  'gaming-pulse': GamingPulseHero,
  'artisan-dark': ArtisanDarkHero,
  'street-vibe': StreetVibeHero,
  'vintage-retro': VintageRetroHero,
  'gourmet-bistro': GourmetBistroHero,
  'fresh-market': FreshMarketHero,
  'quick-bites': QuickBitesHero,
  'handmade-craft': HandmadeCraftHero,
  'studio-clean': StudioCleanHero,
  'luxe-boutique': BoutiqueHero,
  'beauty-glow': BeautyHero,
  'midnight-luxe': MidnightHero,
  'vogue-minimal': VogueHero,
  'default': StandardHero,
};

export default function DynamicHero(props: HeroProps) {
  const Renderer = HERO_RENDERERS[props.theme.template_id] || HERO_RENDERERS['default'];
  return <Renderer {...props} />;
}
