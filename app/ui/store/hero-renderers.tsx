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
          <a href={content.cta_link || '#item-list'} className={`mt-6 inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold shadow-xl ${btn.className}`} style={{ ...btn.style, backgroundColor: '#ffffff', color: theme.primary_color, border: 'none', '--tw-ring-color': theme.primary_color } as React.CSSProperties}>
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

// ─── DYNAMIC REGISTRY ───
export const HERO_RENDERERS: Record<string, React.FC<HeroProps>> = {
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
