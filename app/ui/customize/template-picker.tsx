'use client';

import { useState, useRef, useEffect } from 'react';
import { Template, TEMPLATES, TEMPLATE_CATEGORIES, FONT_MAP } from '@/app/lib/template-presets';

interface TemplatePickerProps {
  activeTemplateId: string;
  onSelect: (template: Template) => void;
}

/** Mini storefront mockup rendered with CSS using the theme's actual colors/fonts */
function ThemePreview({ template, isActive }: { template: Template; isActive: boolean }) {
  const t = template.theme;

  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden"
      style={{ backgroundColor: t.background_color }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${t.border_color}` }}>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: t.primary_color }} />
          <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: t.heading_color, opacity: 0.3 }} />
        </div>
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.text_color, opacity: 0.2 }} />
      </div>

      {/* Hero banner */}
      <div
        className="mx-2 mt-2 rounded-lg p-3"
        style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.secondary_color})` }}
      >
        <div className="h-1.5 w-16 rounded-full bg-white/70 mb-1" />
        <div className="h-1 w-12 rounded-full bg-white/40 mb-2" />
        <div
          className="h-4 w-12 bg-white"
          style={{
            borderRadius: t.button_radius === 'sharp' ? '0' : t.button_radius === 'pill' ? '999px' : '4px',
          }}
        />
      </div>

      {/* Product cards */}
      <div className="px-2 mt-2 grid grid-cols-2 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="overflow-hidden"
            style={{
              backgroundColor: t.surface_color,
              border: t.card_style === 'bold' ? `2px solid ${t.primary_color}` : `1px solid ${t.border_color}`,
              borderRadius: t.border_radius === 'sharp' ? '0' : t.border_radius === 'pill' ? '12px' : '6px',
              boxShadow: t.card_shadow === 'elevated' ? '0 4px 12px rgba(0,0,0,0.08)' : t.card_shadow === 'hard' ? `2px 2px 0 ${t.primary_color}30` : t.card_shadow === 'soft' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <div
              className="w-full"
              style={{
                backgroundColor: `${t.primary_color}10`,
                aspectRatio: t.image_aspect_ratio === 'portrait' ? '3/4' : t.image_aspect_ratio === 'landscape' ? '4/3' : '1',
              }}
            />
            <div className="p-1.5">
              <div className="h-1 w-full rounded-full mb-1" style={{ backgroundColor: t.heading_color, opacity: 0.15 }} />
              <div className="h-1 w-8 rounded-full" style={{ backgroundColor: t.primary_color, opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Active badge overlay */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[1px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatePicker({ activeTemplateId, onSelect }: TemplatePickerProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const [activeCategory, setActiveCategory] = useState(() => {
    // Default to the category of the active theme if it exists, otherwise 'all'
    const activeTemplate = TEMPLATES.find(t => t.id === activeTemplateId);
    return activeTemplate?.category || 'all';
  });

  const filtered = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory);

  // Auto-scroll to the active theme on mount and when category changes
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeCategory]);

  return (
    <div className="p-3 space-y-3">
      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Theme Grid */}
      <div className="space-y-2">
        {filtered.map((tpl) => {
          const isActive = tpl.id === activeTemplateId;
          return (
            <button
              key={tpl.id}
              ref={isActive ? activeRef : null}
              type="button"
              onClick={() => onSelect(tpl)}
              className={`group w-full overflow-hidden text-left transition-all ${
                isActive
                  ? 'rounded-2xl ring-2 ring-emerald-500 ring-offset-2'
                  : 'rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Visual preview */}
              <ThemePreview template={tpl} isActive={isActive} />

              {/* Theme info */}
              <div className={`px-3 py-2.5 ${isActive ? 'bg-emerald-50' : 'bg-white'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{tpl.emoji}</span>
                  <span className={`text-sm font-bold ${isActive ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {tpl.name}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                  {tpl.description}
                </p>
                {/* Tags */}
                <div className="flex gap-1 mt-1.5">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
