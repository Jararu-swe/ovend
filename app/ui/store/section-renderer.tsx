'use client';

import { User, Product, StoreTheme } from '@/app/lib/definitions';
import { TemplateSection, TemplateSectionContent, FONT_MAP } from '@/app/lib/template-presets';
import { formatCurrency, getSectionSpacing, getButtonStyles, getBorderRadiusClass } from '@/app/lib/utils';
import type { StoreAvailability } from '@/app/lib/store-availability';
import { ShoppingBagIcon, PlusIcon, ChevronUpIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import StoreIcon from './storefront-icons';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { JSX, useEffect, useState } from 'react';
import DynamicHero from './hero-renderers';

// ─── Shared style helpers ─────────────────────────────────────

function entranceClass(anim: string, delayMs = 0) {
  const delayStyle = delayMs > 0 ? `animation-delay: ${delayMs}ms;` : '';
  switch (anim) {
    case 'fade': return { className: 'ovd-fade-in', style: delayStyle };
    case 'slide': return { className: 'ovd-slide-up', style: delayStyle };
    case 'zoom': return { className: 'ovd-zoom-in', style: delayStyle };
    case 'bounce': return { className: 'ovd-bounce-in', style: delayStyle };
    default: return { className: '', style: '' };
  }
}

// ─── CSS Keyframes Injection ──────────────────────────────────
const KEYFRAMES_CSS = `
@keyframes ovdFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ovdSlideUp {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ovdZoomIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes ovdBounceIn {
  0% { opacity: 0; transform: scale(0.85) translateY(20px); }
  60% { opacity: 1; transform: scale(1.04) translateY(-4px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes ovdMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes ovdShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.ovd-fade-in { animation: ovdFadeIn 0.6s ease-out both; }
.ovd-slide-up { animation: ovdSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
.ovd-zoom-in { animation: ovdZoomIn 0.5s ease-out both; }
.ovd-bounce-in { animation: ovdBounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }
`;

// ─── Section Renderer ─────────────────────────────────────────
interface SectionRendererProps {
  sections: TemplateSection[];
  content: TemplateSectionContent;
  vendor: User;
  products: Product[];
  theme: StoreTheme;
  availability: StoreAvailability;
  onAddToCart: (product: Product) => void;
  renderProductGrid?: () => React.ReactNode;
}

export default function SectionRenderer({
  sections, content, vendor, products, theme, availability, onAddToCart, renderProductGrid,
}: SectionRendererProps) {
  const sorted = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('ovd-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'ovd-keyframes';
    style.textContent = KEYFRAMES_CSS;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      {sorted.map((section, idx) => {
        const c = content[section.id] || {};
        const e = entranceClass(theme.animation_style, idx * 120);
        const wrapStyle = e.style ? { style: e.style } : {};
        switch (section.id) {
          case 'hero-banner':
            return <DynamicHero key={section.id} content={c} theme={theme} entrance={e} />;
          case 'announcement-bar':
            return <AnnouncementBar key={section.id} content={c} theme={theme} entrance={e} />;
          case 'featured-products':
            return <FeaturedProducts key={section.id} content={c} products={products} theme={theme} onAddToCart={onAddToCart} entrance={e} isClosed={availability.state === 'closed'} />;
          case 'product-grid':
            return renderProductGrid ? <div key={section.id} className={e.className} style={e.style ? { animationDelay: `${idx * 120}ms` } : undefined}>{renderProductGrid()}</div> : null;
          case 'testimonials':
            return <Testimonials key={section.id} content={c} theme={theme} entrance={e} />;
          case 'about-section':
            return <AboutSection key={section.id} content={c} theme={theme} entrance={e} />;
          case 'trust-badges':
            return <TrustBadges key={section.id} content={c} theme={theme} entrance={e} />;
          case 'image-gallery':
            return <ImageGallery key={section.id} content={c} theme={theme} entrance={e} />;
          case 'faqs':
            return <FaqsSection key={section.id} content={c} theme={theme} entrance={e} />;
          case 'contact-cta':
            return <ContactCta key={section.id} content={c} vendor={vendor} theme={theme} entrance={e} />;
          case 'newsletter':
            return <Newsletter key={section.id} content={c} theme={theme} entrance={e} />;
          case 'video-promo':
            return <VideoPromo key={section.id} content={c} theme={theme} entrance={e} />;
          case 'logo-cloud':
            return <LogoCloud key={section.id} content={c} theme={theme} entrance={e} />;
          case 'rich-text':
            return <RichText key={section.id} content={c} theme={theme} entrance={e} />;
          case 'split-feature':
            return <SplitFeature key={section.id} content={c} theme={theme} entrance={e} />;
          case 'category-grid':
            return <CategoryGrid key={section.id} content={c} theme={theme} entrance={e} />;
          default:
            return null;
        }
      })}
      <BackToTop theme={theme} />
    </>
  );
}

type Entrance = { className: string; style: string };

// ═══════════════════════════════════════════════════════════════
// ─── SCROLLING MARQUEE ANNOUNCEMENT BAR ───────────────────────
// ═══════════════════════════════════════════════════════════════

function AnnouncementBar({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const text = content.text || 'Special offer — limited time!';
  const bgColor = content.bg_color || theme.primary_color;
  const textColor = content.text_color || '#ffffff';
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div
      className={`overflow-hidden ${getBorderRadiusClass(theme.border_radius as any)} ${entrance.className}`}
      style={{ backgroundColor: bgColor, color: textColor, marginBottom: spacing.section }}
    >
      <div className="relative flex overflow-hidden py-2.5">
        <div
          className="flex shrink-0 whitespace-nowrap gap-12 px-4"
          style={{ animation: 'ovdMarquee 20s linear infinite' }}
        >
          {/* Duplicate content for seamless loop */}
          {[0,1,2,3,4,5].map((i) => (
            <span key={i} className="text-sm font-semibold tracking-wide">{text}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── FEATURED PRODUCTS (Horizontal Scroll) ────────────────────
// ═══════════════════════════════════════════════════════════════

function FeaturedProducts({
  content, products, theme, onAddToCart, entrance, isClosed,
}: {
  content: Record<string, any>; products: Product[]; theme: StoreTheme; onAddToCart: (p: Product) => void; entrance: Entrance; isClosed?: boolean;
}) {
  const activeProducts = products.filter((p) => p.status === 'active');
  const featured = content.product_ids?.length > 0
    ? activeProducts.filter((p) => content.product_ids.includes(p.id))
    : activeProducts.slice(0, 6);

  if (featured.length === 0) return null;

  const btn = getButtonStyles(theme);
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div className={entrance.className} style={{ marginBottom: spacing.section }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}>
        {content.title || 'Featured'}
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {featured.map((product, idx) => {
          const e = entranceClass(theme.animation_style, idx * 80);
          return (
            <div
              key={product.id}
              className={`min-w-[160px] max-w-[180px] flex-shrink-0 snap-start group overflow-hidden bg-white shadow-sm border transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${e.className}`}
              style={{
                animationDelay: `${idx * 80}ms`,
                borderColor: theme.border_color || '#e2e8f0',
                borderRadius: theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem',
                ['--tw-ring-color' as any]: theme.primary_color,
              } as React.CSSProperties}
            >
              {product.image_url ? (
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-slate-50 text-slate-200">
                  <StoreIcon name="cart" theme={theme} className="h-10 w-10" />
                </div>
              )}
              <div className="p-3">
                <h4 className="text-sm font-bold truncate" style={{ color: theme.text_color }}>{product.name}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: theme.primary_color }}>{formatCurrency(product.price)}</span>
                  <button 
                    onClick={() => onAddToCart(product)} 
                    disabled={isClosed}
                    className={`h-7 w-7 flex items-center justify-center ${btn.className} disabled:opacity-40 disabled:cursor-not-allowed`} 
                    style={{ ...btn.style, '--tw-ring-color': theme.primary_color } as any as React.CSSProperties}
                  >
                    <StoreIcon name="add" theme={theme} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── TESTIMONIALS (Animated Cards) ────────────────────────────
// ═══════════════════════════════════════════════════════════════

function Testimonials({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const quotes: { name: string; text: string; rating: number }[] = content.quotes || [];
  if (quotes.length === 0) return null;

  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div className={entrance.className} style={{ marginBottom: spacing.section }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}>
        Customer Reviews
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
        {quotes.map((q, i) => {
          const e = entranceClass(theme.animation_style, i * 100);
          return (
            <div
              key={i}
              className={`min-w-[260px] max-w-[300px] flex-shrink-0 snap-start border p-5 ${e.className}`}
              style={{
                animationDelay: `${i * 100}ms`,
                borderColor: theme.border_color || '#e2e8f0',
                backgroundColor: theme.glass_effect ? 'rgba(255, 255, 255, 0.4)' : (theme.surface_color || '#ffffff'),
                backdropFilter: theme.glass_effect ? 'blur(12px)' : undefined,
                WebkitBackdropFilter: theme.glass_effect ? 'blur(12px)' : undefined,
                borderRadius: theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem',
              }}
            >
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map((star) => (
                  <StarSolid key={star} className={`h-4 w-4 ${star <= (q.rating || 5) ? 'text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <p className="text-sm italic mb-4 leading-relaxed" style={{ color: theme.text_color }}>
                &ldquo;{q.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t pt-3" style={{ borderColor: `${theme.border_color || '#e2e8f0'}80` }}>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  {q.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <p className="text-xs font-bold" style={{ color: theme.heading_color || theme.text_color }}>
                  {q.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ABOUT SECTION ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function AboutSection({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');
  return (
    <div
      className={`border ${getBorderRadiusClass(theme.border_radius as any)} ${entrance.className}`}
      style={{
        borderColor: theme.border_color || '#e2e8f0',
        backgroundColor: theme.surface_color || '#ffffff',
        marginBottom: spacing.section,
        padding: spacing.internal,
      }}
    >
      <h3
        className="text-lg font-bold mb-3"
        style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}
      >
        {content.title || 'About Us'}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: theme.text_color }}>
        {content.text || ''}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── TRUST BADGES ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

// ─── SVG ICON MAP FOR TRUST BADGES ────────────────────────────
const BADGE_ICONS: Record<string, JSX.Element> = {
  shield: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
  truck: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.07-.504 1.004-1.125a57.006 57.006 0 0 0-2.33-10.5A2.625 2.625 0 0 0 16.5 4.5h-1.875a.375.375 0 0 0-.375.375V10.5m-3.375 8.25H7.5m9-13.5V5.625m0 0H2.25V15" /></svg>,
  'return': <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>,
  chat: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>,
  star: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
  gift: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>,
  diamond: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 7.5 8.25 11.25L20.25 7.5m-16.5 0L12 2.25l8.25 5.25m-16.5 0h16.5" /></svg>,
  rocket: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>,
  crown: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>,
  clock: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  fresh: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /></svg>,
  price: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>,
};

function TrustBadges({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const badges = content.badges || [
    { icon: 'shield', label: 'Secure Checkout' },
    { icon: 'truck', label: 'Fast Delivery' },
    { icon: 'return', label: 'Easy Returns' },
    { icon: 'chat', label: 'WhatsApp Support' },
  ];

  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div className={entrance.className} style={{ marginTop: spacing.section, marginBottom: spacing.section }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((badge: any, i: number) => {
          const e = entranceClass(theme.animation_style, i * 60);
          const svgIcon = BADGE_ICONS[badge.icon];
          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-2.5 py-5 px-3 text-center border ${e.className}`}
              style={{
                animationDelay: `${i * 60}ms`,
                borderColor: theme.border_color || '#e2e8f0',
                backgroundColor: theme.surface_color || '#ffffff',
                borderRadius: getBorderRadiusClass(theme.border_radius as any) === 'rounded-none' ? '0' : '1rem',
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${theme.primary_color}12`, color: theme.primary_color }}>
                {svgIcon || <span className="text-xl">{badge.icon}</span>}
              </div>
              <span className="text-xs font-semibold" style={{ color: theme.text_color }}>{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── CONTACT CTA ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function ContactCta({ content, vendor, theme, entrance }: { content: Record<string, any>; vendor: User; theme: StoreTheme; entrance: Entrance }) {
  const whatsappLink = vendor.whatsapp_number
    ? `https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}`
    : null;
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div
      className={`text-center ${getBorderRadiusClass(theme.border_radius as any)} ${entrance.className}`}
      style={{
        background: `linear-gradient(135deg, ${theme.primary_color}12, ${theme.secondary_color}12)`,
        marginBottom: spacing.section,
        padding: spacing.internal,
      }}
    >
      <h3 className="text-lg font-bold mb-1" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}>
        {content.title || 'Have questions?'}
      </h3>
      <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: theme.text_color, opacity: 0.7 }}>
        {content.subtitle || 'Reach us directly on WhatsApp.'}
      </p>
      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold shadow-xl ${getButtonStyles(theme).className}`}
          style={{ ...getButtonStyles(theme).style, '--tw-ring-color': theme.primary_color } as any as React.CSSProperties}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.03L.789 23.66l4.77-1.456A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.17 0-4.206-.61-5.947-1.664l-.427-.253-2.828.863.84-2.736-.278-.442A9.776 9.776 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12 17.418 21.818 12 21.818z"/></svg>
          {content.button_text || 'Chat on WhatsApp'}
        </a>
      ) : (
        <p className="text-xs text-slate-400 italic">WhatsApp number not configured</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── BACK TO TOP BUTTON ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function BackToTop({ theme }: { theme: StoreTheme }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: theme.primary_color, '--tw-ring-color': theme.primary_color } as any as React.CSSProperties}
      aria-label="Back to top"
    >
      <ChevronUpIcon className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── IMAGE GALLERY ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function ImageGallery({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const images: { url: string; caption?: string }[] = content.images || [];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => i !== null ? (i + 1) % images.length : null);
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => i !== null ? (i - 1 + images.length) % images.length : null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIdx, images.length]);

  if (images.length === 0) return null;

  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '0.75rem';
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div className={entrance.className} style={{ marginBottom: spacing.section }}>
      <h3
        className="text-lg font-bold mb-4"
        style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}
      >
        {content.title || 'Gallery'}
      </h3>

      {/* Masonry-style grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((img, i) => {
          const e2 = entranceClass(theme.animation_style, i * 60);
          const isLarge = i === 0 || (i % 5 === 0);
          return (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer group ${e2.className} ${
                isLarge ? 'col-span-2 row-span-2' : ''
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
              style={{
                animationDelay: `${i * 60}ms`,
                borderRadius: borderRadiusStyle,
                aspectRatio: isLarge ? '1' : '1',
                '--tw-ring-color': theme.primary_color,
              } as any as React.CSSProperties}
              onClick={() => setLightboxIdx(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxIdx(i); } }}
              tabIndex={0}
              role="button"
              aria-label={img.caption || `View gallery image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption || `Gallery image ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
                {img.caption && (
                  <p className="w-full px-3 py-2 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate bg-gradient-to-t from-black/50 to-transparent">
                    {img.caption}
                  </p>
                )}
              </div>
              {/* Zoom icon on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Lightbox Overlay ─── */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close lightbox"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setLightboxIdx((lightboxIdx - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Previous image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => setLightboxIdx((lightboxIdx + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Next image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative max-h-[80vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIdx].url}
              alt={images[lightboxIdx].caption || ''}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
            />
            {images[lightboxIdx].caption && (
              <p className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-sm">
                {images[lightboxIdx].caption}
              </p>
            )}
          </div>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    i === lightboxIdx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── FAQS SECTION ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function FaqsSection({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const items: { question: string; answer: string }[] = content.items || [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (items.length === 0) return null;

  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div className={entrance.className} style={{ marginBottom: spacing.section }}>
      <h3
        className="text-lg font-bold mb-4"
        style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}
      >
        {content.title || 'FAQ'}
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          const e = entranceClass(theme.animation_style, idx * 60);
          return (
            <div
              key={idx}
              className={`border overflow-hidden transition-all duration-300 ${e.className} ${isOpen ? 'shadow-md' : 'shadow-sm'}`}
              style={{
                animationDelay: `${idx * 60}ms`,
                borderColor: isOpen ? theme.primary_color : (theme.border_color || '#e2e8f0'),
                backgroundColor: theme.surface_color || '#ffffff',
                borderRadius: borderRadiusStyle,
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                style={{ '--tw-ring-color': theme.primary_color } as any as React.CSSProperties}
              >
                <span className="font-semibold" style={{ color: theme.heading_color || theme.text_color }}>
                  {item.question}
                </span>
                <ChevronUpIcon
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-90'}`}
                  style={{ color: theme.primary_color }}
                  strokeWidth={2.5}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ overflow: 'hidden' }}
              >
                <div className="p-4 pt-0 text-sm leading-relaxed" style={{ color: theme.text_color }}>
                  <div className="pt-2 border-t border-slate-100">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── NEWSLETTER SECTION ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function Newsletter({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const btn = getButtonStyles(theme);
  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div
      className={`relative overflow-hidden ${entrance.className}`}
      style={{
        backgroundColor: theme.surface_color || '#ffffff',
        border: `1px solid ${theme.border_color || '#e2e8f0'}`,
        borderRadius: borderRadiusStyle,
        marginBottom: spacing.section,
        padding: spacing.internal,
      }}
    >
      <div className="relative z-10 text-center max-w-lg mx-auto">
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] }}>
          {content.title || 'Join our mailing list'}
        </h3>
        <p className="text-sm opacity-70 mb-6" style={{ color: theme.text_color }}>
          {content.subtitle || 'Get the latest updates and exclusive offers.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder={content.placeholder || 'your@email.com'}
            className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-offset-1"
            style={{ borderRadius: theme.button_radius === 'sharp' ? '0' : '0.75rem', '--tw-ring-color': theme.primary_color } as any}
          />
          <button
            className={`px-6 py-3 text-sm font-bold shadow-sm whitespace-nowrap ${btn.className}`}
            style={btn.style as any}
          >
            {content.button_text || 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── VIDEO PROMO ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function VideoPromo({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');
  const [playing, setPlaying] = useState(content.autoplay || false);

  const videoId = content.video_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)?.[1];
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${playing ? 1 : 0}&mute=1` : content.video_url;

  return (
    <div
      className={`overflow-hidden ${entrance.className}`}
      style={{
        borderRadius: borderRadiusStyle,
        marginBottom: spacing.section,
        aspectRatio: content.aspect_ratio || '16/9',
        border: `1px solid ${theme.border_color || '#e2e8f0'}`,
      }}
    >
      {videoId ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">
          <svg className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── LOGO CLOUD ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function LogoCloud({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const logos = content.logos || [];
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');

  return (
    <div className={`text-center ${entrance.className}`} style={{ marginBottom: spacing.section }}>
      {content.title && (
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 px-1">
          {content.title}
        </h4>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        {logos.map((logo: any, i: number) => (
          <img key={i} src={logo.url} alt={logo.name} className="h-6 md:h-8 w-auto object-contain" />
        ))}
        {logos.length === 0 && <span className="text-xs italic text-slate-300">Brand logos go here</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── RICH TEXT ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function RichText({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');
  const alignClass = content.align === 'center' ? 'text-center mx-auto' : content.align === 'right' ? 'text-right ml-auto' : 'text-left';
  const sizeClass = content.size === 'large' ? 'text-lg md:text-xl' : content.size === 'small' ? 'text-xs md:text-sm' : 'text-sm md:text-base';

  return (
    <div className={`${alignClass} ${entrance.className} max-w-2xl px-4`} style={{ marginBottom: spacing.section }}>
      {content.title && (
        <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] }}>
          {content.title}
        </h3>
      )}
      <p className={`${sizeClass} leading-relaxed opacity-80`} style={{ color: theme.text_color }}>
        {content.text}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── CATEGORY GRID ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function CategoryGrid({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const categories = content.categories || [];
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');
  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';

  return (
    <div className={entrance.className} style={{ marginBottom: spacing.section }}>
      {content.title && (
        <h3 className="text-lg font-bold mb-4" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] }}>
          {content.title}
        </h3>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat: any, i: number) => {
          const e = entranceClass(theme.animation_style, i * 60);
          return (
            <a
              key={cat.id || i}
              href={cat.link || '#'}
              className={`group relative overflow-hidden aspect-[4/5] ${e.className}`}
              style={{
                animationDelay: `${i * 60}ms`,
                borderRadius: borderRadiusStyle,
              }}
            >
              <img src={cat.image_url} alt={cat.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-sm font-bold tracking-tight">{cat.name}</span>
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">Shop Now →</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── SPLIT IMAGE/TEXT FEATURE ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function SplitFeature({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const spacing = getSectionSpacing(theme.spacing || 'comfortable');
  const btn = getButtonStyles(theme);
  const layoutReversed = content.image_position === 'right';
  const radiusClass = getBorderRadiusClass(theme.border_radius as any);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${entrance.className}`} style={{ marginBottom: spacing.section }}>
      {/* Target Image Container */}
      <div className={`relative aspect-square md:aspect-[4/5] overflow-hidden ${radiusClass} ${layoutReversed ? 'md:order-2' : 'md:order-1'}`}>
        {content.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400 text-sm tracking-widest uppercase">Feature Image</span>
          </div>
        )}
      </div>

      {/* Target Content Container */}
      <div className={`flex flex-col justify-center px-4 md:px-0 ${layoutReversed ? 'md:order-1' : 'md:order-2'}`}>
        {content.eyebrow && (
          <span className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: theme.accent_color }}>
            {content.eyebrow}
          </span>
        )}
        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] }}>
          {content.title || 'Highlight Your Best Feature'}
        </h2>
        <p className="text-base md:text-lg opacity-80 leading-relaxed mb-8" style={{ color: theme.text_color }}>
          {content.subtitle || 'Use this split layout to dynamically showcase a featured product, a new collection, or an important aspect of your brand story.'}
        </p>
        
        {content.features && Array.isArray(content.features) && (
          <ul className="space-y-3 mb-10">
            {content.features.map((feature: string, idx: number) => (
              <li key={idx} className="flex items-center gap-3 text-sm md:text-base" style={{ color: theme.text_color }}>
                <CheckCircleIcon className="w-5 h-5 shrink-0" style={{ color: theme.accent_color }} />
                <span className="opacity-90">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {content.cta_text && (
          <div>
            <a href={content.cta_link || '#'} className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold shadow-lg ${btn.className} focus-visible:outline-none focus-visible:ring-2`} style={{ ...btn.style, ['--tw-ring-color' as any]: theme.primary_color } as React.CSSProperties}>
              {content.cta_text}
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
