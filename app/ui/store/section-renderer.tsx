'use client';

import { User, Product, StoreTheme } from '@/app/lib/definitions';
import { TemplateSection, TemplateSectionContent } from '@/app/lib/template-presets';
import { formatCurrency } from '@/app/lib/utils';
import { ShoppingBagIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface SectionRendererProps {
  sections: TemplateSection[];
  content: TemplateSectionContent;
  vendor: User;
  products: Product[];
  theme: StoreTheme;
  onAddToCart: (product: Product) => void;
  // The following props allow the product grid to be rendered separately if needed
  renderProductGrid?: () => React.ReactNode;
}

export default function SectionRenderer({
  sections,
  content,
  vendor,
  products,
  theme,
  onAddToCart,
  renderProductGrid,
}: SectionRendererProps) {
  const sorted = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {sorted.map((section) => {
        const c = content[section.id] || {};
        switch (section.id) {
          case 'hero-banner':
            return <HeroBanner key={section.id} content={c} theme={theme} />;
          case 'announcement-bar':
            return <AnnouncementBar key={section.id} content={c} />;
          case 'featured-products':
            return (
              <FeaturedProducts
                key={section.id}
                content={c}
                products={products}
                theme={theme}
                onAddToCart={onAddToCart}
              />
            );
          case 'product-grid':
            return renderProductGrid ? (
              <div key={section.id}>{renderProductGrid()}</div>
            ) : null;
          case 'testimonials':
            return <Testimonials key={section.id} content={c} theme={theme} />;
          case 'about-section':
            return <AboutSection key={section.id} content={c} theme={theme} />;
          case 'contact-cta':
            return <ContactCta key={section.id} content={c} vendor={vendor} theme={theme} />;
          default:
            return null;
        }
      })}
    </>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────

function HeroBanner({ content, theme }: { content: Record<string, any>; theme: StoreTheme }) {
  const borderRadiusClass =
    theme.border_radius === 'sharp' ? 'rounded-none'
    : theme.border_radius === 'pill' ? 'rounded-3xl'
    : 'rounded-2xl';

  return (
    <div
      className={`mb-8 overflow-hidden ${borderRadiusClass} p-8 text-white shadow-xl relative`}
      style={{
        background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`,
        fontFamily: theme.heading_font,
      }}
    >
      <div className="relative z-10">
        <h2 className="text-2xl font-bold tracking-tight">
          {content.title || 'Welcome to our store'}
        </h2>
        <p className="mt-2 text-white/80 text-sm max-w-[280px]">
          {content.subtitle || 'Browse our collection and order directly.'}
        </p>
      </div>
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 blur-2xl"
        style={{ backgroundColor: `${theme.accent_color}40` }}
      />
      <div
        className="absolute bottom-0 right-0 w-24 h-24 rounded-full mr-10 mb-10 blur-xl"
        style={{ backgroundColor: `${theme.accent_color}30` }}
      />
    </div>
  );
}

// ─── Announcement Bar ─────────────────────────────────────────

function AnnouncementBar({ content }: { content: Record<string, any> }) {
  return (
    <div
      className="mb-6 px-4 py-2.5 text-center text-sm font-semibold rounded-xl"
      style={{
        backgroundColor: content.bg_color || '#10b981',
        color: content.text_color || '#ffffff',
      }}
    >
      {content.text || '🎉 Special offer — limited time!'}
    </div>
  );
}

// ─── Featured Products ────────────────────────────────────────

function FeaturedProducts({
  content,
  products,
  theme,
  onAddToCart,
}: {
  content: Record<string, any>;
  products: Product[];
  theme: StoreTheme;
  onAddToCart: (p: Product) => void;
}) {
  // Show first 4 active products as featured (or use product_ids if specified)
  const activeProducts = products.filter((p) => p.status === 'active');
  const featured =
    content.product_ids?.length > 0
      ? activeProducts.filter((p) => content.product_ids.includes(p.id))
      : activeProducts.slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.heading_color || theme.text_color }}>
        {content.title || 'Featured'}
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {featured.map((product) => (
          <div
            key={product.id}
            className="min-w-[160px] max-w-[180px] flex-shrink-0 rounded-2xl border bg-white shadow-sm overflow-hidden"
            style={{ borderColor: theme.border_color || '#e2e8f0' }}
          >
            {product.image_url ? (
              <div className="aspect-square relative overflow-hidden bg-slate-50">
                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-slate-50 text-slate-200">
                <ShoppingBagIcon className="h-10 w-10" />
              </div>
            )}
            <div className="p-3">
              <h4 className="text-sm font-bold truncate" style={{ color: theme.text_color }}>
                {product.name}
              </h4>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: theme.primary_color }}>
                  {formatCurrency(product.price)}
                </span>
                <button
                  onClick={() => onAddToCart(product)}
                  className="h-7 w-7 flex items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Testimonials ─────────────────────────────────────────────

function Testimonials({ content, theme }: { content: Record<string, any>; theme: StoreTheme }) {
  const quotes: { name: string; text: string; rating: number }[] = content.quotes || [];
  if (quotes.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.heading_color || theme.text_color }}>
        What our customers say
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {quotes.map((q, i) => (
          <div
            key={i}
            className="rounded-2xl border p-5"
            style={{
              borderColor: theme.border_color || '#e2e8f0',
              backgroundColor: theme.surface_color || '#ffffff',
            }}
          >
            <div className="text-amber-400 text-sm mb-2">
              {'★'.repeat(Math.min(q.rating || 5, 5))}
            </div>
            <p className="text-sm italic mb-3" style={{ color: theme.text_color }}>
              &ldquo;{q.text}&rdquo;
            </p>
            <p className="text-xs font-bold" style={{ color: theme.primary_color }}>
              — {q.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── About Section ────────────────────────────────────────────

function AboutSection({ content, theme }: { content: Record<string, any>; theme: StoreTheme }) {
  return (
    <div
      className="mb-8 rounded-2xl border p-6"
      style={{
        borderColor: theme.border_color || '#e2e8f0',
        backgroundColor: theme.surface_color || '#ffffff',
      }}
    >
      <h3 className="text-lg font-bold mb-3" style={{ color: theme.heading_color || theme.text_color }}>
        {content.title || 'About Us'}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: theme.text_color }}>
        {content.text || ''}
      </p>
    </div>
  );
}

// ─── Contact CTA ──────────────────────────────────────────────

function ContactCta({ content, vendor, theme }: { content: Record<string, any>; vendor: User; theme: StoreTheme }) {
  const whatsappLink = vendor.whatsapp_number
    ? `https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}`
    : null;

  return (
    <div
      className="mb-8 rounded-2xl p-6 text-center"
      style={{
        background: `linear-gradient(135deg, ${theme.primary_color}15, ${theme.secondary_color}15)`,
        borderColor: theme.border_color || '#e2e8f0',
      }}
    >
      <h3 className="text-lg font-bold mb-1" style={{ color: theme.heading_color || theme.text_color }}>
        {content.title || 'Have questions?'}
      </h3>
      <p className="text-sm mb-4" style={{ color: theme.text_color, opacity: 0.7 }}>
        {content.subtitle || 'Reach us directly on WhatsApp.'}
      </p>
      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95"
        >
          {content.button_text || 'Chat on WhatsApp'}
        </a>
      ) : (
        <p className="text-xs text-slate-400 italic">WhatsApp number not configured</p>
      )}
    </div>
  );
}
