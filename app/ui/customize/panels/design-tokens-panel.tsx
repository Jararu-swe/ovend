'use client';

import { useState, useMemo } from 'react';
import { StoreTheme } from '@/app/lib/definitions';

interface DesignTokensPanelProps {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
  subscriptionTier?: string;
}

type TokenCategory = 'spacing' | 'typography' | 'borders' | 'shadows' | 'transitions';

const CATEGORY_META: Record<TokenCategory, { label: string; icon: string; description: string }> = {
  spacing: { label: 'Spacing Scale', icon: '📐', description: 'Padding & margin values' },
  typography: { label: 'Font Sizes & Lines', icon: '🔤', description: 'Font sizes, line heights, letter spacing' },
  borders: { label: 'Border Radii', icon: '⬜', description: 'Corner radius values' },
  shadows: { label: 'Shadows', icon: '🌑', description: 'Box shadow definitions' },
  transitions: { label: 'Transitions', icon: '⚡', description: 'Animation timing' },
};

const DEFAULT_SPACING = {
  xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem',
};

const DEFAULT_FONT_SIZES = {
  xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
};

const DEFAULT_BORDER_RADII = {
  none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px',
};

const DEFAULT_SHADOWS = {
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
};

const DEFAULT_TRANSITIONS = {
  fast: '150ms', normal: '300ms', slow: '500ms',
};

function TokenEditor({
  label,
  tokens,
  defaults,
  onChange,
}: {
  label: string;
  tokens: Record<string, string>;
  defaults: Record<string, string>;
  onChange: (updated: Record<string, string>) => void;
}) {
  return (
    <div className="space-y-2">
      {Object.entries(defaults).map(([key, defaultVal]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 w-8 shrink-0 text-right">{key}</span>
          <input
            type="text"
            value={tokens[key] ?? defaultVal}
            onChange={(e) => onChange({ ...tokens, [key]: e.target.value })}
            className="flex-1 rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-[11px] font-mono text-slate-700 outline-none focus:border-emerald-500 transition"
            placeholder={defaultVal}
          />
          {tokens[key] && tokens[key] !== defaultVal && (
            <button
              type="button"
              onClick={() => {
                const updated = { ...tokens };
                delete updated[key];
                onChange(updated);
              }}
              className="text-[9px] text-slate-300 hover:text-red-500 transition-colors"
              title="Reset to default"
            >
              ↩
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DesignTokensPanel({ theme, onChange, subscriptionTier }: DesignTokensPanelProps) {
  const [activeCategory, setActiveCategory] = useState<TokenCategory | null>(null);

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'business';

  const tokens = useMemo(() => {
    if (!theme.design_tokens) return {};
    try {
      return typeof theme.design_tokens === 'string' ? JSON.parse(theme.design_tokens) : theme.design_tokens;
    } catch {
      return {};
    }
  }, [theme.design_tokens]);

  const updateTokenCategory = (category: string, values: Record<string, string>) => {
    const updated = { ...tokens, [category]: values };
    onChange('design_tokens', JSON.stringify(updated));
  };

  if (!isPro) {
    return (
      <div className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-3xl">
            🔒
          </div>
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-2">Design Tokens</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
          Design tokens give you complete control over every spacing value, font size, shadow, and transition in your storefront.
        </p>
        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Pro Feature
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
        <p className="text-[10px] font-semibold text-amber-700">
          <span className="font-black">PRO:</span> Fine-tune every design system value. Changes apply as CSS custom properties.
        </p>
      </div>

      {/* Category list */}
      <div className="space-y-1">
        {(Object.entries(CATEGORY_META) as [TokenCategory, typeof CATEGORY_META[TokenCategory]][]).map(([key, meta]) => (
          <div key={key}>
            <button
              type="button"
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                activeCategory === key ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span className="text-lg">{meta.icon}</span>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-800">{meta.label}</span>
                <p className="text-[10px] text-slate-400">{meta.description}</p>
              </div>
              <svg
                className={`h-3.5 w-3.5 text-slate-300 transition-transform ${activeCategory === key ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {activeCategory === key && (
              <div className="mt-2 mb-3 pl-10 pr-2 animate-in slide-in-from-top-2 duration-200">
                {key === 'spacing' && (
                  <TokenEditor
                    label="Spacing"
                    tokens={tokens.spacing_scale || {}}
                    defaults={DEFAULT_SPACING}
                    onChange={(v) => updateTokenCategory('spacing_scale', v)}
                  />
                )}
                {key === 'typography' && (
                  <TokenEditor
                    label="Font Sizes"
                    tokens={tokens.font_sizes || {}}
                    defaults={DEFAULT_FONT_SIZES}
                    onChange={(v) => updateTokenCategory('font_sizes', v)}
                  />
                )}
                {key === 'borders' && (
                  <TokenEditor
                    label="Border Radii"
                    tokens={tokens.border_radii || {}}
                    defaults={DEFAULT_BORDER_RADII}
                    onChange={(v) => updateTokenCategory('border_radii', v)}
                  />
                )}
                {key === 'shadows' && (
                  <TokenEditor
                    label="Shadows"
                    tokens={tokens.shadows || {}}
                    defaults={DEFAULT_SHADOWS}
                    onChange={(v) => updateTokenCategory('shadows', v)}
                  />
                )}
                {key === 'transitions' && (
                  <TokenEditor
                    label="Transitions"
                    tokens={tokens.transitions || {}}
                    defaults={DEFAULT_TRANSITIONS}
                    onChange={(v) => updateTokenCategory('transitions', v)}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reset all tokens */}
      {Object.keys(tokens).length > 0 && (
        <button
          type="button"
          onClick={() => onChange('design_tokens', null)}
          className="w-full py-2 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
        >
          Reset All Tokens to Defaults
        </button>
      )}
    </div>
  );
}
