'use client';

import { User, Product, StoreTheme } from '@/app/lib/definitions';
import { TemplateSection, TemplateSectionContent, FONT_MAP } from '@/app/lib/template-presets';
import { formatCurrency } from '@/app/lib/utils';
import { ShoppingBagIcon, PlusIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// ─── Shared style helpers ─────────────────────────────────────
function useButtonProps(theme: StoreTheme) {
  const radiusClass =
    theme.button_radius === 'sharp' ? 'rounded-none' :
    theme.button_radius === 'pill' ? 'rounded-full' : 'rounded-xl';

  const style = (() => {
    switch (theme.button_style) {
      case 'outline': return { border: `2px solid ${theme.primary_color}`, color: theme.primary_color, backgroundColor: 'transparent' };
      case 'soft': return { backgroundColor: `${theme.primary_color}18`, color: theme.primary_color, border: 'none' };
      case 'glass': return { backgroundColor: `${theme.surface_color || '#fff'}cc`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${theme.border_color || '#e2e8f0'}`, color: theme.primary_color };
      default: return { backgroundColor: theme.primary_color, color: '#ffffff', border: 'none' };
    }
  })();

  const hover = (() => {
    switch (theme.animation_style) {
      case 'zoom': return 'hover:scale-105 active:scale-95';
      case 'slide': return 'hover:-translate-y-1 active:translate-y-0';
      case 'bounce': return 'hover:-translate-y-1.5 hover:scale-[1.03] active:scale-95';
      case 'fade': return 'hover:opacity-80 active:opacity-60';
      default: return 'hover:opacity-90';
    }
  })();

  return { radiusClass, style, hover, className: `transition-all duration-300 ${radiusClass} ${hover}` };
}

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
  onAddToCart: (product: Product) => void;
  renderProductGrid?: () => React.ReactNode;
}

export default function SectionRenderer({
  sections, content, vendor, products, theme, onAddToCart, renderProductGrid,
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
            return <HeroBanner key={section.id} content={c} theme={theme} entrance={e} />;
          case 'announcement-bar':
            return <AnnouncementBar key={section.id} content={c} theme={theme} entrance={e} />;
          case 'featured-products':
            return <FeaturedProducts key={section.id} content={c} products={products} theme={theme} onAddToCart={onAddToCart} entrance={e} />;
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
          case 'contact-cta':
            return <ContactCta key={section.id} content={c} vendor={vendor} theme={theme} entrance={e} />;
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
// ─── HERO BANNER V2 ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function HeroBanner({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const btn = useButtonProps(theme);
  const radiusClass =
    theme.border_radius === 'sharp' ? 'rounded-none'
    : theme.border_radius === 'pill' ? 'rounded-3xl'
    : 'rounded-2xl';

  const align = content.text_align || 'left';
  const alignClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';
  const hasImage = !!content.image_url;

  return (
    <div
      className={`mb-8 overflow-hidden ${radiusClass} relative min-h-[200px] ${entrance.className}`}
      style={{
        animationDelay: entrance.style ? '0ms' : undefined,
      }}
    >
      {/* Background */}
      {hasImage ? (
        <>
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image_url} alt="" className="h-full w-full object-cover" />
          </div>
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${theme.primary_color}dd, ${theme.secondary_color}aa)` }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}
        />
      )}

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-12 -mt-12 blur-3xl opacity-50" style={{ backgroundColor: theme.accent_color }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-8 -mb-8 blur-2xl opacity-30" style={{ backgroundColor: theme.accent_color }} />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#ffffff' }} />

      {/* Content */}
      <div className={`relative z-10 flex flex-col ${alignClass} p-8 md:p-10`}>
        <h2
          className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight"
          style={{ fontFamily: FONT_MAP[theme.heading_font] || theme.heading_font }}
        >
          {content.title || 'Welcome to our store'}
        </h2>
        <p className="mt-2 text-white/80 text-sm md:text-base max-w-[340px] leading-relaxed">
          {content.subtitle || 'Browse our collection and order directly.'}
        </p>
        {content.cta_text && (
          <a
            href={content.cta_link || '#item-list'}
            className={`mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-xl ${btn.className}`}
            style={{
              ...btn.style,
              // Override for hero: always high contrast
              backgroundColor: '#ffffff',
              color: theme.primary_color,
              border: 'none',
            }}
          >
            {content.cta_text}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── SCROLLING MARQUEE ANNOUNCEMENT BAR ───────────────────────
// ═══════════════════════════════════════════════════════════════

function AnnouncementBar({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const text = content.text || '🎉 Special offer — limited time!';
  const bgColor = content.bg_color || theme.primary_color;
  const textColor = content.text_color || '#ffffff';

  return (
    <div
      className={`mb-6 overflow-hidden rounded-xl ${entrance.className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
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
  content, products, theme, onAddToCart, entrance,
}: {
  content: Record<string, any>; products: Product[]; theme: StoreTheme; onAddToCart: (p: Product) => void; entrance: Entrance;
}) {
  const activeProducts = products.filter((p) => p.status === 'active');
  const featured = content.product_ids?.length > 0
    ? activeProducts.filter((p) => content.product_ids.includes(p.id))
    : activeProducts.slice(0, 6);

  if (featured.length === 0) return null;

  const btn = useButtonProps(theme);

  return (
    <div className={`mb-8 ${entrance.className}`}>
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}>
        {content.title || '⭐ Featured'}
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {featured.map((product, idx) => {
          const e = entranceClass(theme.animation_style, idx * 80);
          return (
            <div
              key={product.id}
              className={`min-w-[160px] max-w-[180px] flex-shrink-0 snap-start group overflow-hidden bg-white shadow-sm border transition-shadow hover:shadow-lg ${e.className}`}
              style={{
                animationDelay: `${idx * 80}ms`,
                borderColor: theme.border_color || '#e2e8f0',
                borderRadius: theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem',
              }}
            >
              {product.image_url ? (
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-slate-50 text-slate-200">
                  <ShoppingBagIcon className="h-10 w-10" />
                </div>
              )}
              <div className="p-3">
                <h4 className="text-sm font-bold truncate" style={{ color: theme.text_color }}>{product.name}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: theme.primary_color }}>{formatCurrency(product.price)}</span>
                  <button onClick={() => onAddToCart(product)} className={`h-7 w-7 flex items-center justify-center ${btn.className}`} style={btn.style}>
                    <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
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

  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';

  return (
    <div className={`mb-8 ${entrance.className}`}>
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}>
        💬 What our customers say
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
                backgroundColor: theme.surface_color || '#ffffff',
                borderRadius: borderRadiusStyle,
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
  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';

  return (
    <div
      className={`mb-8 border p-6 ${entrance.className}`}
      style={{
        borderColor: theme.border_color || '#e2e8f0',
        backgroundColor: theme.surface_color || '#ffffff',
        borderRadius: borderRadiusStyle,
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

function TrustBadges({ content, theme, entrance }: { content: Record<string, any>; theme: StoreTheme; entrance: Entrance }) {
  const badges = content.badges || [
    { icon: '🔒', label: 'Secure Checkout' },
    { icon: '🚚', label: 'Fast Delivery' },
    { icon: '↩️', label: 'Easy Returns' },
    { icon: '💬', label: 'WhatsApp Support' },
  ];

  return (
    <div className={`mb-8 ${entrance.className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((badge: any, i: number) => {
          const e = entranceClass(theme.animation_style, i * 60);
          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-2 py-4 px-3 text-center border ${e.className}`}
              style={{
                animationDelay: `${i * 60}ms`,
                borderColor: theme.border_color || '#e2e8f0',
                backgroundColor: theme.surface_color || '#ffffff',
                borderRadius: theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '0.75rem',
              }}
            >
              <span className="text-2xl">{badge.icon}</span>
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

  const btn = useButtonProps(theme);
  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';

  return (
    <div
      className={`mb-8 p-6 md:p-8 text-center ${entrance.className}`}
      style={{
        background: `linear-gradient(135deg, ${theme.primary_color}12, ${theme.secondary_color}12)`,
        borderRadius: borderRadiusStyle,
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
          className={`inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold shadow-xl ${btn.className}`}
          style={btn.style}
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
      className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
      style={{ backgroundColor: theme.primary_color }}
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

  return (
    <div className={`mb-8 ${entrance.className}`}>
      <h3
        className="text-lg font-bold mb-4"
        style={{ color: theme.heading_color || theme.text_color, fontFamily: FONT_MAP[theme.heading_font] || undefined }}
      >
        {content.title || '📸 Gallery'}
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
              }`}
              style={{
                animationDelay: `${i * 60}ms`,
                borderRadius: borderRadiusStyle,
                aspectRatio: isLarge ? '1' : '1',
              }}
              onClick={() => setLightboxIdx(i)}
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
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => setLightboxIdx((lightboxIdx + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
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
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === lightboxIdx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
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
